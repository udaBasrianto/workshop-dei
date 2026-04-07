package handlers

import (
	"deistok/config"
	"deistok/models"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// ========== PRODUCTS ==========
func GetProducts(c *fiber.Ctx) error {
	var products []models.Product
	config.DB.Preload("Category").Preload("ProductMaterials.Material").Preload("ProductLabors.Labor").Preload("ProductOverheads.Overhead").Preload("Images").Find(&products)
	return c.JSON(products)
}

func GetProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	var product models.Product
	if err := config.DB.Preload("Category").Preload("ProductMaterials.Material").Preload("ProductLabors.Labor").Preload("ProductOverheads.Overhead").Preload("Images").First(&product, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Product not found"})
	}
	return c.JSON(product)
}

func CreateProduct(c *fiber.Ctx) error {
	var product models.Product
	if err := c.BodyParser(&product); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Filter out empty associations
	var validMaterials []models.ProductMaterial
	for _, pm := range product.ProductMaterials {
		if pm.MaterialID != 0 {
			validMaterials = append(validMaterials, pm)
		}
	}
	product.ProductMaterials = validMaterials

	var validLabors []models.ProductLabor
	for _, pl := range product.ProductLabors {
		if pl.LaborID != 0 {
			validLabors = append(validLabors, pl)
		}
	}
	product.ProductLabors = validLabors

	var validOverheads []models.ProductOverhead
	for _, po := range product.ProductOverheads {
		if po.OverheadID != 0 {
			validOverheads = append(validOverheads, po)
		}
	}
	product.ProductOverheads = validOverheads

	// Calculate buy_price if it's production and associations are provided
	if product.Type == "production" {
		var totalHPP float64
		for _, pm := range product.ProductMaterials {
			var material models.Material
			config.DB.First(&material, pm.MaterialID)
			totalHPP += material.Price * pm.Quantity
		}
		for _, pl := range product.ProductLabors {
			var labor models.Labor
			config.DB.First(&labor, pl.LaborID)
			totalHPP += labor.Rate * pl.Hours
		}
		for _, po := range product.ProductOverheads {
			totalHPP += po.Amount
		}
		product.BuyPrice = totalHPP
		product.Price = totalHPP + (totalHPP * (product.ProfitMargin / 100))
	}

	if err := config.DB.Create(&product).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create product"})
	}
	return c.Status(201).JSON(product)
}

func UpdateProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	var product models.Product
	if err := config.DB.First(&product, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Product not found"})
	}

	if err := c.BodyParser(&product); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	// Filter out empty associations
	var validMaterials []models.ProductMaterial
	for _, pm := range product.ProductMaterials {
		if pm.MaterialID != 0 {
			validMaterials = append(validMaterials, pm)
		}
	}
	product.ProductMaterials = validMaterials

	var validLabors []models.ProductLabor
	for _, pl := range product.ProductLabors {
		if pl.LaborID != 0 {
			validLabors = append(validLabors, pl)
		}
	}
	product.ProductLabors = validLabors

	var validOverheads []models.ProductOverhead
	for _, po := range product.ProductOverheads {
		if po.OverheadID != 0 {
			validOverheads = append(validOverheads, po)
		}
	}
	product.ProductOverheads = validOverheads

	// Calculate buy_price if it's production
	if product.Type == "production" {
		var totalHPP float64
		for _, pm := range product.ProductMaterials {
			var material models.Material
			config.DB.First(&material, pm.MaterialID)
			totalHPP += material.Price * pm.Quantity
		}
		for _, pl := range product.ProductLabors {
			var labor models.Labor
			config.DB.First(&labor, pl.LaborID)
			totalHPP += labor.Rate * pl.Hours
		}
		for _, po := range product.ProductOverheads {
			totalHPP += po.Amount
		}
		product.BuyPrice = totalHPP
		product.Price = totalHPP + (totalHPP * (product.ProfitMargin / 100))
	}

	// Clear associations before saving to allow updates
	config.DB.Model(&product).Association("ProductMaterials").Replace(product.ProductMaterials)
	config.DB.Model(&product).Association("ProductLabors").Replace(product.ProductLabors)
	config.DB.Model(&product).Association("ProductOverheads").Replace(product.ProductOverheads)
	config.DB.Model(&product).Association("Images").Replace(product.Images)

	config.DB.Save(&product)
	return c.JSON(product)
}

func DeleteProduct(c *fiber.Ctx) error {
	idParam := c.Params("id")
	idInt, err := strconv.Atoi(idParam)
	if err != nil || idInt <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid product id"})
	}
	id := uint(idInt)

	if err := config.DB.First(&models.Product{}, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Product not found"})
	}

	var txItemCount int64
	config.DB.Model(&models.TransactionItem{}).Where("product_id = ?", id).Count(&txItemCount)
	if txItemCount > 0 {
		return c.Status(409).JSON(fiber.Map{
			"error": "Product cannot be deleted because it has transactions",
		})
	}

	var opnameItemCount int64
	config.DB.Model(&models.StockOpnameItem{}).Where("product_id = ?", id).Count(&opnameItemCount)
	if opnameItemCount > 0 {
		return c.Status(409).JSON(fiber.Map{
			"error": "Product cannot be deleted because it has stock opname history",
		})
	}

	err = config.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Delete(&models.ProductMaterial{}, "product_id = ?", id).Error; err != nil {
			return err
		}
		if err := tx.Delete(&models.ProductLabor{}, "product_id = ?", id).Error; err != nil {
			return err
		}
		if err := tx.Delete(&models.ProductOverhead{}, "product_id = ?", id).Error; err != nil {
			return err
		}
		if err := tx.Delete(&models.ProductImage{}, "product_id = ?", id).Error; err != nil {
			return err
		}
		if err := tx.Delete(&models.Product{}, id).Error; err != nil {
			return err
		}
		return nil
	})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete product"})
	}

	return c.JSON(fiber.Map{"message": "Product deleted"})
}

// ========== CATEGORIES ==========
func GetCategories(c *fiber.Ctx) error {
	var categories []models.Category
	config.DB.Find(&categories)
	return c.JSON(categories)
}

func CreateCategory(c *fiber.Ctx) error {
	var category models.Category
	if err := c.BodyParser(&category); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}
	config.DB.Create(&category)
	return c.Status(201).JSON(category)
}

func UpdateCategory(c *fiber.Ctx) error {
	id := c.Params("id")
	var category models.Category
	if err := config.DB.First(&category, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Category not found"})
	}
	if err := c.BodyParser(&category); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}
	config.DB.Save(&category)
	return c.JSON(category)
}

func DeleteCategory(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.Category{}, id)
	return c.JSON(fiber.Map{"message": "Category deleted"})
}

// ========== MATERIALS ==========
func GetMaterials(c *fiber.Ctx) error {
	var materials []models.Material
	config.DB.Find(&materials)
	return c.JSON(materials)
}

func CreateMaterial(c *fiber.Ctx) error {
	var material models.Material
	if err := c.BodyParser(&material); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}
	config.DB.Create(&material)
	return c.Status(201).JSON(material)
}

func UpdateMaterial(c *fiber.Ctx) error {
	id := c.Params("id")
	var material models.Material
	if err := config.DB.First(&material, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Material not found"})
	}
	c.BodyParser(&material)
	config.DB.Save(&material)
	return c.JSON(material)
}

func DeleteMaterial(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.Material{}, id)
	return c.JSON(fiber.Map{"message": "Material deleted"})
}

// ========== LABORS ==========
func GetLabors(c *fiber.Ctx) error {
	var labors []models.Labor
	config.DB.Find(&labors)
	return c.JSON(labors)
}

func CreateLabor(c *fiber.Ctx) error {
	var labor models.Labor
	if err := c.BodyParser(&labor); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}
	config.DB.Create(&labor)
	return c.Status(201).JSON(labor)
}

func UpdateLabor(c *fiber.Ctx) error {
	id := c.Params("id")
	var labor models.Labor
	if err := config.DB.First(&labor, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Labor not found"})
	}
	c.BodyParser(&labor)
	config.DB.Save(&labor)
	return c.JSON(labor)
}

func DeleteLabor(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.Labor{}, id)
	return c.JSON(fiber.Map{"message": "Labor deleted"})
}

// ========== OVERHEADS ==========
func GetOverheads(c *fiber.Ctx) error {
	var overheads []models.Overhead
	config.DB.Find(&overheads)
	return c.JSON(overheads)
}

func CreateOverhead(c *fiber.Ctx) error {
	var overhead models.Overhead
	if err := c.BodyParser(&overhead); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}
	config.DB.Create(&overhead)
	return c.Status(201).JSON(overhead)
}

func UpdateOverhead(c *fiber.Ctx) error {
	id := c.Params("id")
	var overhead models.Overhead
	if err := config.DB.First(&overhead, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Overhead not found"})
	}
	c.BodyParser(&overhead)
	config.DB.Save(&overhead)
	return c.JSON(overhead)
}

func DeleteOverhead(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.Overhead{}, id)
	return c.JSON(fiber.Map{"message": "Overhead deleted"})
}

// ========== CUSTOMERS ==========
func GetCustomers(c *fiber.Ctx) error {
	var customers []models.Customer
	config.DB.Find(&customers)
	return c.JSON(customers)
}

func GetCustomer(c *fiber.Ctx) error {
	id := c.Params("id")
	var customer models.Customer
	if err := config.DB.First(&customer, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Customer not found"})
	}
	return c.JSON(customer)
}

func CreateCustomer(c *fiber.Ctx) error {
	var customer models.Customer
	if err := c.BodyParser(&customer); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}
	config.DB.Create(&customer)
	return c.Status(201).JSON(customer)
}

func UpdateCustomer(c *fiber.Ctx) error {
	id := c.Params("id")
	var customer models.Customer
	if err := config.DB.First(&customer, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Customer not found"})
	}
	c.BodyParser(&customer)
	config.DB.Save(&customer)
	return c.JSON(customer)
}

func DeleteCustomer(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.Customer{}, id)
	return c.JSON(fiber.Map{"message": "Customer deleted"})
}

// ========== EXPENSES ==========
func GetExpenses(c *fiber.Ctx) error {
	var expenses []models.Expense
	config.DB.Order("transaction_date desc").Find(&expenses)
	return c.JSON(expenses)
}

func CreateExpense(c *fiber.Ctx) error {
	var req struct {
		Date        string  `json:"date"`
		Description string  `json:"description"`
		Amount      float64 `json:"amount"`
		Category    string  `json:"category"`
		Notes       string  `json:"notes"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	expense := models.Expense{
		Description: req.Description,
		Amount:      req.Amount,
		Category:    req.Category,
		Notes:       req.Notes,
	}

	// Parse date
	if req.Date != "" {
		parsedDate, err := time.Parse("2006-01-02", req.Date)
		if err == nil {
			expense.Date = parsedDate
		}
	}

	config.DB.Create(&expense)
	return c.Status(201).JSON(expense)
}

func UpdateExpense(c *fiber.Ctx) error {
	id := c.Params("id")
	var expense models.Expense
	if err := config.DB.First(&expense, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Expense not found"})
	}
	c.BodyParser(&expense)
	config.DB.Save(&expense)
	return c.JSON(expense)
}

func DeleteExpense(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.Expense{}, id)
	return c.JSON(fiber.Map{"message": "Expense deleted"})
}
