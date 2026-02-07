package middleware

import (
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware(c *fiber.Ctx) error {
	authHeader := c.Get("Authorization")
	if authHeader == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Missing authorization header"})
	}

	tokenString := strings.Replace(authHeader, "Bearer ", "", 1)

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})

	if err != nil || !token.Valid {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid token"})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Invalid token claims"})
	}

	c.Locals("user_id", uint(claims["user_id"].(float64)))
	c.Locals("role", claims["role"].(string))

	return c.Next()
}

func AdminOnly(c *fiber.Ctx) error {
	role := c.Locals("role")
	if role != "admin" {
		return c.Status(403).JSON(fiber.Map{"error": "Admin access required"})
	}
	return c.Next()
}
