package main

import (
	"deistok/config"
	"deistok/models"
	"log"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	godotenv.Load("../.env")
	config.ConnectDB()

	email := "admin@deistok.com"
	password := "123456"

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to hash password: %v", err)
	}

	result := config.DB.Model(&models.User{}).Where("email = ?", email).Update("password", string(hashedPassword))
	if result.Error != nil {
		log.Fatalf("Failed to update password: %v", result.Error)
	}

	if result.RowsAffected == 0 {
		log.Fatalf("User %s not found", email)
	}

	log.Printf("Successfully updated password for %s to bcrypt hash.", email)
}
