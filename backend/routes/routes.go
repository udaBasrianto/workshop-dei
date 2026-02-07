package routes

import (
	"deistok/handlers"
	"deistok/middleware"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	// Public routes
	app.Post("/api/auth/login", handlers.Login)
	app.Post("/api/auth/register", handlers.Register)
	app.Get("/api/settings", handlers.GetSettings)

	// Protected routes
	api := app.Group("/api", middleware.AuthMiddleware)

	// User
	api.Get("/me", handlers.GetMe)

	// Dashboard
	api.Get("/dashboard/stats", handlers.GetDashboardStats)
	api.Get("/dashboard/top-products", handlers.GetTopSellingProducts)
	api.Get("/dashboard/sales-trend", handlers.GetSalesTrend)
	api.Get("/dashboard/payment-methods", handlers.GetPaymentMethodStats)
	api.Get("/dashboard/low-stock", handlers.GetLowStockProducts)
	api.Get("/dashboard/expiring-products", handlers.GetExpiringProducts)

	// Products
	api.Get("/products", handlers.GetProducts)
	api.Get("/products/:id", handlers.GetProduct)
	api.Post("/products", handlers.CreateProduct)
	api.Put("/products/:id", handlers.UpdateProduct)
	api.Delete("/products/:id", handlers.DeleteProduct)

	// Categories
	api.Get("/categories", handlers.GetCategories)
	api.Post("/categories", handlers.CreateCategory)
	api.Put("/categories/:id", handlers.UpdateCategory)
	api.Delete("/categories/:id", handlers.DeleteCategory)

	// Materials
	api.Get("/materials", handlers.GetMaterials)
	api.Post("/materials", handlers.CreateMaterial)
	api.Put("/materials/:id", handlers.UpdateMaterial)
	api.Delete("/materials/:id", handlers.DeleteMaterial)

	// Labors
	api.Get("/labors", handlers.GetLabors)
	api.Post("/labors", handlers.CreateLabor)
	api.Put("/labors/:id", handlers.UpdateLabor)
	api.Delete("/labors/:id", handlers.DeleteLabor)

	// Overheads
	api.Get("/overheads", handlers.GetOverheads)
	api.Post("/overheads", handlers.CreateOverhead)
	api.Put("/overheads/:id", handlers.UpdateOverhead)
	api.Delete("/overheads/:id", handlers.DeleteOverhead)

	// Customers
	api.Get("/customers", handlers.GetCustomers)
	api.Get("/customers/:id", handlers.GetCustomer)
	api.Post("/customers", handlers.CreateCustomer)
	api.Put("/customers/:id", handlers.UpdateCustomer)
	api.Delete("/customers/:id", handlers.DeleteCustomer)

	// Expenses
	api.Get("/expenses", handlers.GetExpenses)
	api.Post("/expenses", handlers.CreateExpense)
	api.Put("/expenses/:id", handlers.UpdateExpense)
	api.Delete("/expenses/:id", handlers.DeleteExpense)

	// Transactions
	api.Get("/transactions", handlers.GetTransactions)
	api.Get("/transactions/:id", handlers.GetTransaction)
	api.Delete("/transactions/:id", handlers.DeleteTransaction)

	// POS
	api.Post("/pos/checkout", handlers.Checkout)

	// Upload
	api.Post("/upload/image", handlers.UploadImage)

	// Settings
	api.Put("/settings", handlers.UpdateSettings)

	// Stock Opname
	api.Get("/stock-opnames", handlers.GetStockOpnames)
	api.Get("/stock-opnames/:id", handlers.GetStockOpname)
	api.Post("/stock-opnames", handlers.CreateStockOpname)
	api.Post("/stock-opnames/:id/approve", handlers.ApproveStockOpname)
	api.Delete("/stock-opnames/:id", handlers.DeleteStockOpname)

	// Users Management
	api.Get("/users", handlers.GetUsers)
	api.Post("/users", handlers.CreateUser)
	api.Put("/users/:id", handlers.UpdateUser)
	api.Delete("/users/:id", handlers.DeleteUser)

	// Financial Reports
	api.Get("/reports/financial", handlers.GetFinancialReport)
	api.Get("/reports/monthly", handlers.GetMonthlyReport)
}
