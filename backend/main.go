package main

import (
	"log"
	"os"

	"deistok/config"
	"deistok/models"
	"deistok/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	godotenv.Load()

	// Connect to database
	config.ConnectDB()

	// Auto Migrate
	config.DB.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Product{},
		&models.Material{},
		&models.Labor{},
		&models.Overhead{},
		&models.ProductMaterial{},
		&models.ProductLabor{},
		&models.ProductOverhead{},
		&models.Customer{},
		&models.Transaction{},
		&models.TransactionItem{},
		&models.Expense{},
		&models.AppSetting{},
		&models.StockOpname{},
		&models.StockOpnameItem{},
	)

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName: "DeiStok API v2.0",
	})

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	// Static files for uploads
	app.Static("/uploads", "./uploads")

	// Setup routes
	routes.SetupRoutes(app)

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "DeiStok API is running",
		})
	})

	// Start server
	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 DeiStok API running on http://localhost:%s", port)
	log.Fatal(app.Listen(":" + port))
}
