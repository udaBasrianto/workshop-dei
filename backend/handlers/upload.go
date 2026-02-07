package handlers

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// UploadImage handles image uploads
func UploadImage(c *fiber.Ctx) error {
	folder := c.Query("folder", "products")

	// Get file from form
	file, err := c.FormFile("image")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "No image file provided",
		})
	}

	// Validate file type
	ext := filepath.Ext(file.Filename)
	allowedExts := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".webp": true}
	if !allowedExts[ext] {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid file type. Allowed: jpg, jpeg, png, gif, webp",
		})
	}

	// Create uploads directory if not exists
	uploadsDir := filepath.Join("./uploads", folder)
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create uploads directory",
		})
	}

	// Generate unique filename
	filename := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), uuid.New().String()[:8], ext)
	dst := filepath.Join(uploadsDir, filename)

	// Save file
	if err := c.SaveFile(file, dst); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to save file",
		})
	}

	// Return the URL path
	imageURL := fmt.Sprintf("/uploads/%s/%s", folder, filename)

	return c.JSON(fiber.Map{
		"url":     imageURL,
		"message": "Image uploaded successfully",
	})
}
