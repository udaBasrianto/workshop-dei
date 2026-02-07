package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

const baseURL = "http://localhost:8080/api"

// Structures matching the backend models for request/response
type Material struct {
	ID    uint    `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
	Unit  string  `json:"unit"`
	Stock int     `json:"stock"`
}

type Labor struct {
	ID   uint    `json:"id"`
	Name string  `json:"name"`
	Rate float64 `json:"rate"`
}

type ProductMaterial struct {
	MaterialID uint    `json:"material_id"`
	Quantity   float64 `json:"quantity"`
}

type ProductLabor struct {
	LaborID uint    `json:"labor_id"`
	Hours   float64 `json:"hours"`
}

type ProductOverhead struct {
	OverheadID uint    `json:"overhead_id"`
	Amount     float64 `json:"amount"`
}

type Product struct {
	ID               uint              `json:"id"`
	Name             string            `json:"name"`
	Type             string            `json:"type"`
	Price            float64           `json:"price"`
	BuyPrice         float64           `json:"buy_price"`
	ProfitMargin     float64           `json:"profit_margin"`
	Barcode          string            `json:"barcode"`
	ProductMaterials []ProductMaterial `json:"product_materials"`
	ProductLabors    []ProductLabor    `json:"product_labors"`
	ProductOverheads []ProductOverhead `json:"product_overheads"`
}

type Overhead struct {
	ID   uint    `json:"id"`
	Name string  `json:"name"`
	Cost float64 `json:"cost"`
}

type LoginResponse struct {
	Token string `json:"token"`
}

var token string

func main() {
	fmt.Println("Starting HPP Calculation Test...")

	// 1. Login to get token
	login("admin@deistok.com", "123456")

	// 2. Create Material (Wood)
	wood := createMaterial("Kayu Jati", 10000, "meter", 100)
	fmt.Printf("Created Material: %s (Price: %.2f)\n", wood.Name, wood.Price)

	// 3. Create Material (Varnish)
	varnish := createMaterial("Pernis", 5000, "liter", 50)
	fmt.Printf("Created Material: %s (Price: %.2f)\n", varnish.Name, varnish.Price)

	// 4. Create Labor (Carpenter)
	carpenter := createLabor("Tukang Kayu", 20000) // Rate per hour? Assuming logic treats it as rate * hours
	fmt.Printf("Created Labor: %s (Rate: %.2f)\n", carpenter.Name, carpenter.Rate)

	// 5. Create Overhead (Electricity/Misc) - though currently logic uses manual amount input in product relation
	// But let's create one for reference if needed, though ProductOverhead uses amount directly?
	// Checking models: ProductOverhead has Amount field. Overhead model has Cost (maybe default cost).
	// Let's create an overhead item first.
	overhead := createOverhead("Listrik & Sewa", 0) 
	fmt.Printf("Created Overhead: %s\n", overhead.Name)

	// 6. Create Product (Chair)
	// Recipe: 2 Wood + 0.5 Varnish + 1.5 Hours Carpenter + 5000 Overhead
	// Expected HPP:
	// Wood: 2 * 10000 = 20000
	// Varnish: 0.5 * 5000 = 2500
	// Labor: 1.5 * 20000 = 30000
	// Overhead: 5000
	// Total HPP = 57500
	// Profit Margin: 20%
	// Expected Price = 57500 + (57500 * 0.20) = 69000

	productReq := Product{
		Name:         "Kursi Jati Premium",
		Type:         "production",
		ProfitMargin: 20,
		Barcode:      fmt.Sprintf("TEST-%d", time.Now().Unix()),
		ProductMaterials: []ProductMaterial{
			{MaterialID: wood.ID, Quantity: 2},
			{MaterialID: varnish.ID, Quantity: 0.5},
		},
		ProductLabors: []ProductLabor{
			{LaborID: carpenter.ID, Hours: 1.5},
		},
		ProductOverheads: []ProductOverhead{
			{OverheadID: overhead.ID, Amount: 5000},
		},
	}

	createdProduct := createProduct(productReq)

	fmt.Println("\n--- HPP Verification ---")
	expectedHPP := (2.0 * 10000.0) + (0.5 * 5000.0) + (1.5 * 20000.0) + 5000.0
	expectedPrice := expectedHPP + (expectedHPP * 0.20)

	fmt.Printf("Expected HPP: %.2f\n", expectedHPP)
	fmt.Printf("Actual HPP:   %.2f\n", createdProduct.BuyPrice)
	
	if createdProduct.BuyPrice == expectedHPP {
		fmt.Println("✅ HPP Calculation is CORRECT")
	} else {
		fmt.Println("❌ HPP Calculation is INCORRECT")
	}

	fmt.Printf("\nExpected Price: %.2f\n", expectedPrice)
	fmt.Printf("Actual Price:   %.2f\n", createdProduct.Price)

	if createdProduct.Price == expectedPrice {
		fmt.Println("✅ Selling Price Calculation is CORRECT")
	} else {
		fmt.Println("❌ Selling Price Calculation is INCORRECT")
	}
	
	// Cleanup (Optional, but good for repeatability)
	// deleteProduct(createdProduct.ID)
	// deleteMaterial(wood.ID)
	// deleteMaterial(varnish.ID)
	// deleteLabor(carpenter.ID)
}

func login(email, password string) {
	data := map[string]string{"email": email, "password": password}
	jsonData, _ := json.Marshal(data)
	resp, err := http.Post(baseURL+"/auth/login", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	var res LoginResponse
	json.NewDecoder(resp.Body).Decode(&res)
	token = res.Token
}

func createMaterial(name string, price float64, unit string, stock int) Material {
	m := Material{Name: name, Price: price, Unit: unit, Stock: stock}
	jsonData, _ := json.Marshal(m)
	req, _ := http.NewRequest("POST", baseURL+"/materials", bytes.NewBuffer(jsonData))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
	
	var res Material
	json.NewDecoder(resp.Body).Decode(&res)
	return res
}

func createLabor(name string, rate float64) Labor {
	l := Labor{Name: name, Rate: rate}
	jsonData, _ := json.Marshal(l)
	req, _ := http.NewRequest("POST", baseURL+"/labors", bytes.NewBuffer(jsonData))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
	
	var res Labor
	json.NewDecoder(resp.Body).Decode(&res)
	return res
}

func createOverhead(name string, cost float64) Overhead {
	o := Overhead{Name: name, Cost: cost}
	jsonData, _ := json.Marshal(o)
	req, _ := http.NewRequest("POST", baseURL+"/overheads", bytes.NewBuffer(jsonData))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
	
	var res Overhead
	json.NewDecoder(resp.Body).Decode(&res)
	return res
}

func createProduct(p Product) Product {
	jsonData, _ := json.Marshal(p)
	req, _ := http.NewRequest("POST", baseURL+"/products", bytes.NewBuffer(jsonData))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	// Debug response
	bodyBytes, _ := io.ReadAll(resp.Body)
	// fmt.Println("Create Product Response:", string(bodyBytes))

	var res Product
	json.Unmarshal(bodyBytes, &res)
	return res
}
