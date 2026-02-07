package main

import (
	"deistok/config"
	"deistok/models"
	"log"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Try loading .env from parent directory (if running from scripts/)
	if err := godotenv.Load("../.env"); err != nil {
		// Try loading .env from current directory (if running from backend root)
		if err := godotenv.Load(".env"); err != nil {
			log.Println("Warning: .env file not found")
		}
	}
	
	config.ConnectDB()

	email := "admin@deistok.com"
	password := "123456"
	name := "Administrator"
	role := "admin"

	var user models.User
	if err := config.DB.Where("email = ?", email).First(&user).Error; err == nil {
		log.Printf("User %s already exists. Updating password...", email)
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		user.Password = string(hashedPassword)
		user.Role = role // Ensure role is admin
		config.DB.Save(&user)
		log.Printf("Admin updated: %s / %s", email, password)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	newUser := models.User{
		Name:     name,
		Email:    email,
		Password: string(hashedPassword),
		Role:     role,
	}

	if err := config.DB.Create(&newUser).Error; err != nil {
		log.Fatalf("Failed to create admin: %v", err)
	}

	log.Printf("Successfully created admin user: %s / %s", email, password)
}
