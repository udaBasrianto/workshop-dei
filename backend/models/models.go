package models

import (
	"strings"
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name"`
	Email     string    `json:"email" gorm:"type:varchar(191);unique"`
	Password  string    `json:"-"`
	Role      string    `json:"role" gorm:"default:kasir"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Category struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name"`
	Slug      string    `json:"slug" gorm:"type:varchar(191);unique"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Products  []Product `json:"products,omitempty" gorm:"foreignKey:CategoryID"`
}

func (c *Category) BeforeCreate(tx *gorm.DB) (err error) {
	if c.Slug == "" {
		c.Slug = strings.ToLower(strings.ReplaceAll(c.Name, " ", "-"))
	}
	return
}

type Product struct {
	ID                 uint      `json:"id" gorm:"primaryKey"`
	CategoryID         *uint     `json:"category_id"`
	Name               string    `json:"name"`
	Brand              string    `json:"brand" gorm:"type:varchar(100)"`
	Type               string    `json:"type" gorm:"default:production"`
	Price              float64   `json:"price"`
	BuyPrice           float64   `json:"buy_price"`
	ProfitMargin       float64   `json:"profit_margin"`
	ProductionCapacity int       `json:"production_capacity"`
	Unit               string    `json:"unit"`
	Image              string    `json:"image"`
	Barcode            string    `json:"barcode" gorm:"type:varchar(191)"`
	MinStock           int       `json:"min_stock"`
	ExpiredAt          *time.Time `json:"expired_at"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`

	Category         *Category         `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
	ProductMaterials []ProductMaterial `json:"product_materials,omitempty"`
	ProductLabors    []ProductLabor    `json:"product_labors,omitempty"`
	ProductOverheads []ProductOverhead `json:"product_overheads,omitempty"`
	Images           []ProductImage    `json:"images,omitempty" gorm:"foreignKey:ProductID"`
}

type ProductImage struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	ProductID uint      `json:"product_id"`
	URL       string    `json:"url"`
	CreatedAt time.Time `json:"created_at"`
}

type Material struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" gorm:"column:item"`
	Price     float64   `json:"price"`
	Unit      string    `json:"unit"`
	Stock     int       `json:"stock"`
	Image     string    `json:"image"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Labor struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" gorm:"column:role"`
	Rate      float64   `json:"rate"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Overhead struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	Name       string    `json:"name"`
	Cost       float64   `json:"cost"`
	PeriodType string    `json:"period_type" gorm:"default:monthly"` // hourly, daily, monthly
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type ProductMaterial struct {
	ID         uint     `json:"id" gorm:"primaryKey"`
	ProductID  uint     `json:"product_id"`
	MaterialID uint     `json:"material_id"`
	Quantity   float64  `json:"quantity"`
	Product    Product  `json:"product,omitempty" gorm:"foreignKey:ProductID"`
	Material   Material `json:"material,omitempty" gorm:"foreignKey:MaterialID"`
}

type ProductLabor struct {
	ID        uint    `json:"id" gorm:"primaryKey"`
	ProductID uint    `json:"product_id"`
	LaborID   uint    `json:"labor_id"`
	Hours     float64 `json:"hours"`
	Product   Product `json:"product,omitempty" gorm:"foreignKey:ProductID"`
	Labor     Labor   `json:"labor,omitempty" gorm:"foreignKey:LaborID"`
}

type ProductOverhead struct {
	ID         uint     `json:"id" gorm:"primaryKey"`
	ProductID  uint     `json:"product_id"`
	OverheadID uint     `json:"overhead_id"`
	Amount     float64  `json:"amount"` // Biaya yang dibebankan ke produk ini
	Product    Product  `json:"product,omitempty" gorm:"foreignKey:ProductID"`
	Overhead   Overhead `json:"overhead,omitempty" gorm:"foreignKey:OverheadID"`
}

type Customer struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name"`
	Phone     string    `json:"phone" gorm:"type:varchar(20)"`
	Email     string    `json:"email" gorm:"type:varchar(191)"`
	Address   string    `json:"address"`
	Points    int       `json:"points" gorm:"default:0"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Transaction struct {
	ID            uint              `json:"id" gorm:"primaryKey"`
	UserID        uint              `json:"user_id"`
	CustomerID    *uint             `json:"customer_id"`
	TotalAmount   float64           `json:"total_amount"`
	CashReceived  float64           `json:"cash_received"`
	ChangeAmount  float64           `json:"change_amount"`
	PaymentMethod string            `json:"payment_method"`
	PaymentStatus string            `json:"payment_status"`
	Notes         string            `json:"notes"`
	CreatedAt     time.Time         `json:"created_at"`
	UpdatedAt     time.Time         `json:"updated_at"`
	User          User              `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Customer      *Customer         `json:"customer,omitempty" gorm:"foreignKey:CustomerID"`
	Items         []TransactionItem `json:"items,omitempty"`
}

type TransactionItem struct {
	ID            uint        `json:"id" gorm:"primaryKey"`
	TransactionID uint        `json:"transaction_id"`
	ProductID     uint        `json:"product_id"`
	Quantity      int         `json:"quantity"`
	UnitPrice     float64     `json:"unit_price"`
	Subtotal      float64     `json:"subtotal"`
	CreatedAt     time.Time   `json:"created_at"`
	UpdatedAt     time.Time   `json:"updated_at"`
	Transaction   Transaction `json:"-" gorm:"foreignKey:TransactionID"`
	Product       Product     `json:"product,omitempty" gorm:"foreignKey:ProductID"`
}

type Expense struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	Description string    `json:"description" gorm:"column:name"`
	Amount      float64   `json:"amount"`
	Category    string    `json:"category"`
	Date        time.Time `json:"date" gorm:"column:transaction_date"`
	Notes       string    `json:"notes"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type AppSetting struct {
	ID            uint   `json:"id" gorm:"primaryKey"`
	BrandName     string `json:"brand_name"`
	LogoPath      string `json:"logo_path"`
	ThemeColor    string `json:"theme_color"`
	StoreAddress  string `json:"store_address"`
	StorePhone    string `json:"store_phone"`
	ReceiptFooter string `json:"receipt_footer"`
}

type StockOpname struct {
	ID        uint              `json:"id" gorm:"primaryKey"`
	Date      time.Time         `json:"date"`
	Notes     string            `json:"notes"`
	Status    string            `json:"status" gorm:"default:draft"`
	CreatedAt time.Time         `json:"created_at"`
	UpdatedAt time.Time         `json:"updated_at"`
	Items     []StockOpnameItem `json:"items,omitempty"`
}

type StockOpnameItem struct {
	ID            uint    `json:"id" gorm:"primaryKey"`
	StockOpnameID uint    `json:"stock_opname_id"`
	ProductID     uint    `json:"product_id"`
	SystemStock   int     `json:"system_stock"`
	ActualStock   int     `json:"actual_stock"`
	Difference    int     `json:"difference"`
	Product       Product `json:"product,omitempty" gorm:"foreignKey:ProductID"`
}
