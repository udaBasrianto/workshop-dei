package main

import (
	"deistok/config"
	"deistok/models"
	"log"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load("../.env")
	config.ConnectDB()

	var users []models.User
	if err := config.DB.Find(&users).Error; err != nil {
		log.Fatalf("Failed to fetch users: %v", err)
	}

	log.Println("--- Users in Database ---")
	for _, u := range users {
		log.Printf("ID: %d, Name: %s, Email: %s, Role: %s", u.ID, u.Name, u.Email, u.Role)
	}
	log.Println("-------------------------")
}
