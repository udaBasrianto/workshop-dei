package main

import (
	"deistok/config"
	"deistok/models"
	"log"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Load .env from parent directory
	godotenv.Load("../.env")

	config.ConnectDB()

	email := "admin@deistok.com"
	password := "123456" // Testing with same password first

	var user models.User
	if err := config.DB.Where("email = ?", email).First(&user).Error; err != nil {
		log.Fatalf("User %s not found in DB: %v", email, err)
	}

	log.Printf("Found user: %s, Email: %s, Hashed password: %s", user.Name, user.Email, user.Password)

	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		log.Fatalf("Authentication failed for %s with password %s: %v", email, password, err)
	}

	log.Println("Authentication SUCCESSFUL for", email)
}
