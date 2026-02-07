package handlers

import (
	"deistok/config"
	"deistok/models"
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

// ========== STOCK OPNAME ==========
func GetStockOpnames(c *fiber.Ctx) error {
	var opnames []models.StockOpname
	config.DB.Preload("Items.Product").Order("created_at desc").Find(&opnames)
	return c.JSON(opnames)
}

func GetStockOpname(c *fiber.Ctx) error {
	id := c.Params("id")
	var opname models.StockOpname
	if err := config.DB.Preload("Items.Product").First(&opname, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Stock opname not found"})
	}
	return c.JSON(opname)
}

type StockOpnameRequest struct {
	Date  string `json:"date"`
	Notes string `json:"notes"`
	Items []struct {
		ProductID   uint `json:"product_id"`
		ActualStock int  `json:"actual_stock"`
	} `json:"items"`
}

func CreateStockOpname(c *fiber.Ctx) error {
	var req StockOpnameRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	date, _ := time.Parse("2006-01-02", req.Date)
	opname := models.StockOpname{
		Date:   date,
		Notes:  req.Notes,
		Status: "draft",
	}
	config.DB.Create(&opname)

	for _, item := range req.Items {
		var product models.Product
		config.DB.First(&product, item.ProductID)

		opnameItem := models.StockOpnameItem{
			StockOpnameID: opname.ID,
			ProductID:     item.ProductID,
			SystemStock:   product.ProductionCapacity,
			ActualStock:   item.ActualStock,
			Difference:    item.ActualStock - product.ProductionCapacity,
		}
		config.DB.Create(&opnameItem)
	}

	config.DB.Preload("Items.Product").First(&opname, opname.ID)
	return c.Status(201).JSON(opname)
}

func ApproveStockOpname(c *fiber.Ctx) error {
	id := c.Params("id")
	var opname models.StockOpname
	if err := config.DB.Preload("Items").First(&opname, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Stock opname not found"})
	}

	if opname.Status != "draft" {
		return c.Status(400).JSON(fiber.Map{"error": "Stock opname already processed"})
	}

	// Update product stocks based on actual counts
	for _, item := range opname.Items {
		config.DB.Model(&models.Product{}).Where("id = ?", item.ProductID).
			Update("production_capacity", item.ActualStock)
	}

	opname.Status = "approved"
	config.DB.Save(&opname)

	return c.JSON(fiber.Map{"message": "Stock opname approved", "opname": opname})
}

func DeleteStockOpname(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.StockOpnameItem{}, "stock_opname_id = ?", id)
	config.DB.Delete(&models.StockOpname{}, id)
	return c.JSON(fiber.Map{"message": "Stock opname deleted"})
}

// ========== USERS ==========
func GetUsers(c *fiber.Ctx) error {
	var users []models.User
	config.DB.Find(&users)
	return c.JSON(users)
}

func CreateUser(c *fiber.Ctx) error {
	var req struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Role     string `json:"role"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	hashedPassword, _ := hashPassword(req.Password)
	user := models.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: hashedPassword,
		Role:     req.Role,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Email already exists"})
	}

	return c.Status(201).JSON(fiber.Map{
		"id":    user.ID,
		"name":  user.Name,
		"email": user.Email,
		"role":  user.Role,
	})
}

func UpdateUser(c *fiber.Ctx) error {
	id := c.Params("id")
	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	var req struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Role     string `json:"role"`
	}
	c.BodyParser(&req)

	user.Name = req.Name
	user.Email = req.Email
	user.Role = req.Role
	if req.Password != "" {
		user.Password, _ = hashPassword(req.Password)
	}

	config.DB.Save(&user)
	return c.JSON(fiber.Map{
		"id":    user.ID,
		"name":  user.Name,
		"email": user.Email,
		"role":  user.Role,
	})
}

func DeleteUser(c *fiber.Ctx) error {
	id := c.Params("id")
	config.DB.Delete(&models.User{}, id)
	return c.JSON(fiber.Map{"message": "User deleted"})
}

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// ========== FINANCIAL REPORTS ==========
type FinancialReport struct {
	Period        string  `json:"period"`
	TotalRevenue  float64 `json:"total_revenue"`
	TotalCOGS     float64 `json:"total_cogs"`
	TotalExpenses float64 `json:"total_expenses"`
	GrossProfit   float64 `json:"gross_profit"`
	NetProfit     float64 `json:"net_profit"`
	Transactions  int64   `json:"transactions"`
}

func GetFinancialReport(c *fiber.Ctx) error {
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	var report FinancialReport
	report.Period = startDate + " - " + endDate

	// Revenue
	config.DB.Model(&models.Transaction{}).
		Where("created_at BETWEEN ? AND ?", startDate, endDate+" 23:59:59").
		Select("COALESCE(SUM(total_amount), 0)").
		Scan(&report.TotalRevenue)

	// Expenses
	config.DB.Model(&models.Expense{}).
		Where("date BETWEEN ? AND ?", startDate, endDate).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&report.TotalExpenses)

	// Transaction count
	config.DB.Model(&models.Transaction{}).
		Where("created_at BETWEEN ? AND ?", startDate, endDate+" 23:59:59").
		Count(&report.Transactions)

	// COGS Calculation (Sum of quantity * buy_price for each item)
	config.DB.Table("transaction_items").
		Select("COALESCE(SUM(transaction_items.quantity * products.buy_price), 0)").
		Joins("JOIN transactions ON transactions.id = transaction_items.transaction_id").
		Joins("JOIN products ON products.id = transaction_items.product_id").
		Where("transactions.created_at BETWEEN ? AND ?", startDate, endDate+" 23:59:59").
		Scan(&report.TotalCOGS)

	report.GrossProfit = report.TotalRevenue - report.TotalCOGS
	report.NetProfit = report.GrossProfit - report.TotalExpenses

	return c.JSON(report)
}

func GetMonthlyReport(c *fiber.Ctx) error {
	year := c.Query("year", "2026")

	type MonthlyData struct {
		Month    int     `json:"month"`
		Revenue  float64 `json:"revenue"`
		COGS     float64 `json:"cogs"`
		Expenses float64 `json:"expenses"`
		Profit   float64 `json:"profit"`
	}

	var monthlyData []MonthlyData

	for month := 1; month <= 12; month++ {
		var data MonthlyData
		data.Month = month

		config.DB.Model(&models.Transaction{}).
			Where("YEAR(created_at) = ? AND MONTH(created_at) = ?", year, month).
			Select("COALESCE(SUM(total_amount), 0)").
			Scan(&data.Revenue)

		config.DB.Model(&models.Expense{}).
			Where("YEAR(date) = ? AND MONTH(date) = ?", year, month).
			Select("COALESCE(SUM(amount), 0)").
			Scan(&data.Expenses)

		// Monthly COGS
		config.DB.Table("transaction_items").
			Select("COALESCE(SUM(transaction_items.quantity * products.buy_price), 0)").
			Joins("JOIN transactions ON transactions.id = transaction_items.transaction_id").
			Joins("JOIN products ON products.id = transaction_items.product_id").
			Where("YEAR(transactions.created_at) = ? AND MONTH(transactions.created_at) = ?", year, month).
			Scan(&data.COGS)

		data.Profit = data.Revenue - data.COGS - data.Expenses
		monthlyData = append(monthlyData, data)
	}

	return c.JSON(monthlyData)
}
