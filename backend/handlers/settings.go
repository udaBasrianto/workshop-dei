package handlers

import (
	"deistok/config"
	"deistok/models"

	"github.com/gofiber/fiber/v2"
)

func GetSettings(c *fiber.Ctx) error {
	var settings models.AppSetting
	if err := config.DB.First(&settings).Error; err != nil {
		// Create default settings if not exists
		settings = models.AppSetting{
			BrandName:  "DeiStok",
			ThemeColor: "Sky",
		}
		config.DB.Create(&settings)
	}
	return c.JSON(settings)
}

func UpdateSettings(c *fiber.Ctx) error {
	var settings models.AppSetting
	if err := config.DB.First(&settings).Error; err != nil {
		settings = models.AppSetting{}
	}

	if err := c.BodyParser(&settings); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if settings.ID == 0 {
		config.DB.Create(&settings)
	} else {
		config.DB.Save(&settings)
	}

	return c.JSON(fiber.Map{
		"message":  "Settings updated",
		"settings": settings,
	})
}
