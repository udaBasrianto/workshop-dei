package handlers

import (
	"deistok/config"
	"deistok/models"
	"time"

	"github.com/gofiber/fiber/v2"
)

type DashboardStats struct {
	TotalProducts     int64   `json:"total_products"`
	TotalTransactions int64   `json:"total_transactions"`
	TotalRevenue      float64 `json:"total_revenue"`
	TotalCustomers    int64   `json:"total_customers"`
	TodayRevenue      float64 `json:"today_revenue"`
	TodayTransactions int64   `json:"today_transactions"`
	LowStockProducts  int64   `json:"low_stock_products"`
	ExpiringProducts  int64   `json:"expiring_products"`
}

func GetDashboardStats(c *fiber.Ctx) error {
	var stats DashboardStats
	today := time.Now().Format("2006-01-02")

	config.DB.Model(&models.Product{}).Count(&stats.TotalProducts)
	config.DB.Model(&models.Transaction{}).Count(&stats.TotalTransactions)
	config.DB.Model(&models.Customer{}).Count(&stats.TotalCustomers)

	config.DB.Model(&models.Transaction{}).Select("COALESCE(SUM(total_amount), 0)").Scan(&stats.TotalRevenue)

	config.DB.Model(&models.Transaction{}).Where("DATE(created_at) = ?", today).Count(&stats.TodayTransactions)
	config.DB.Model(&models.Transaction{}).Where("DATE(created_at) = ?", today).Select("COALESCE(SUM(total_amount), 0)").Scan(&stats.TodayRevenue)

	config.DB.Model(&models.Product{}).Where("production_capacity <= min_stock").Count(&stats.LowStockProducts)
	
	// Expiring in next 30 days
	config.DB.Model(&models.Product{}).Where("expired_at IS NOT NULL AND expired_at <= DATE_ADD(NOW(), INTERVAL 30 DAY)").Count(&stats.ExpiringProducts)

	return c.JSON(stats)
}

type TopProduct struct {
	ProductID   uint    `json:"product_id"`
	ProductName string  `json:"product_name"`
	TotalSold   int     `json:"total_sold"`
	TotalAmount float64 `json:"total_amount"`
}

func GetTopSellingProducts(c *fiber.Ctx) error {
	var topProducts []TopProduct

	config.DB.Table("transaction_items").
		Select("product_id, products.name as product_name, SUM(quantity) as total_sold, SUM(subtotal) as total_amount").
		Joins("JOIN products ON products.id = transaction_items.product_id").
		Group("product_id, products.name").
		Order("total_sold DESC").
		Limit(10).
		Scan(&topProducts)

	return c.JSON(topProducts)
}

type SalesTrend struct {
	Date   string  `json:"date"`
	Amount float64 `json:"amount"`
	Count  int     `json:"count"`
}

func GetSalesTrend(c *fiber.Ctx) error {
	days := c.QueryInt("days", 7)
	var trends []SalesTrend

	config.DB.Table("transactions").
		Select("DATE(created_at) as date, COALESCE(SUM(total_amount), 0) as amount, COUNT(*) as count").
		Where("created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)", days).
		Group("DATE(created_at)").
		Order("date ASC").
		Scan(&trends)

	return c.JSON(trends)
}

func GetPaymentMethodStats(c *fiber.Ctx) error {
	type PaymentStat struct {
		Method string  `json:"method"`
		Count  int     `json:"count"`
		Amount float64 `json:"amount"`
	}

	var stats []PaymentStat
	config.DB.Table("transactions").
		Select("payment_method as method, COUNT(*) as count, SUM(total_amount) as amount").
		Group("payment_method").
		Scan(&stats)

	return c.JSON(stats)
}

func GetLowStockProducts(c *fiber.Ctx) error {
	var products []models.Product
	config.DB.Where("production_capacity <= min_stock").Find(&products)
	return c.JSON(products)
}

func GetExpiringProducts(c *fiber.Ctx) error {
	var products []models.Product
	// Expiring in next 30 days, ordered by expiration date (soonest first)
	config.DB.Where("expired_at IS NOT NULL AND expired_at <= DATE_ADD(NOW(), INTERVAL 30 DAY)").
		Order("expired_at ASC").
		Find(&products)
	return c.JSON(products)
}
