package handlers

import (
	"deistok/config"
	"deistok/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

// ========== TRANSACTIONS ==========
func GetTransactions(c *fiber.Ctx) error {
	var transactions []models.Transaction
	config.DB.Preload("User").Preload("Customer").Preload("Items.Product").Order("created_at desc").Find(&transactions)
	return c.JSON(transactions)
}

func GetTransaction(c *fiber.Ctx) error {
	id := c.Params("id")
	var transaction models.Transaction
	if err := config.DB.Preload("User").Preload("Customer").Preload("Items.Product").First(&transaction, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Transaction not found"})
	}
	return c.JSON(transaction)
}

func DeleteTransaction(c *fiber.Ctx) error {
	id := c.Params("id")
	var transaction models.Transaction
	if err := config.DB.Preload("Items").First(&transaction, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Transaction not found"})
	}

	// Restore stock for each item
	for _, item := range transaction.Items {
		var product models.Product
		if err := config.DB.First(&product, item.ProductID).Error; err == nil {
			product.ProductionCapacity += item.Quantity
			config.DB.Save(&product)
		}
	}

	// Delete items and transaction
	config.DB.Delete(&models.TransactionItem{}, "transaction_id = ?", id)
	config.DB.Delete(&transaction)

	return c.JSON(fiber.Map{"message": "Transaction deleted and stock restored"})
}

// ========== POS CHECKOUT ==========
type CartItem struct {
	ProductID uint    `json:"product_id"`
	Quantity  int     `json:"quantity"`
	UnitPrice float64 `json:"unit_price"`
}

type CheckoutRequest struct {
	CustomerID    *uint      `json:"customer_id"`
	PaymentMethod string     `json:"payment_method"`
	CashReceived  float64    `json:"cash_received"`
	ChangeAmount  float64    `json:"change_amount"`
	Notes         string     `json:"notes"`
	Items         []CartItem `json:"items"`
}

func Checkout(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var req CheckoutRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if len(req.Items) == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Cart is empty"})
	}

	// Calculate total and validate stock
	var totalAmount float64
	for _, item := range req.Items {
		var product models.Product
		if err := config.DB.First(&product, item.ProductID).Error; err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Product not found"})
		}
		if product.ProductionCapacity < item.Quantity {
			return c.Status(400).JSON(fiber.Map{
				"error": "Insufficient stock for " + product.Name,
			})
		}
		totalAmount += item.UnitPrice * float64(item.Quantity)
	}

	// Create transaction
	transaction := models.Transaction{
		UserID:        userID,
		CustomerID:    req.CustomerID,
		TotalAmount:   totalAmount,
		CashReceived:  req.CashReceived,
		ChangeAmount:  req.ChangeAmount,
		PaymentMethod: req.PaymentMethod,
		PaymentStatus: "paid",
		Notes:         req.Notes,
		CreatedAt:     time.Now(),
	}
	config.DB.Create(&transaction)

	// Create items and reduce stock
	for _, item := range req.Items {
		transactionItem := models.TransactionItem{
			TransactionID: transaction.ID,
			ProductID:     item.ProductID,
			Quantity:      item.Quantity,
			UnitPrice:     item.UnitPrice,
			Subtotal:      item.UnitPrice * float64(item.Quantity),
		}
		config.DB.Create(&transactionItem)

		// Reduce stock
		config.DB.Model(&models.Product{}).Where("id = ?", item.ProductID).
			Update("production_capacity", fiber.Map{"$dec": item.Quantity})

		var product models.Product
		config.DB.First(&product, item.ProductID)
		product.ProductionCapacity -= item.Quantity
		config.DB.Save(&product)
	}

	// Award points if customer selected
	if req.CustomerID != nil && totalAmount >= 100000 {
		points := int(totalAmount / 100000)
		config.DB.Model(&models.Customer{}).Where("id = ?", *req.CustomerID).
			Update("points", fiber.Map{"$inc": points})
	}

	return c.Status(201).JSON(fiber.Map{
		"message":     "Transaction successful",
		"transaction": transaction,
	})
}
