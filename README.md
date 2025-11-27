# E-Commerce API  
**Node.js • Express • Prisma • TypeScript • Zod • JWT**

A production-ready, fully typed, and cleanly architected RESTful e-commerce backend.

Live API: https://ecommerce-api-jng7.onrender.com  
Raw OpenAPI JSON: https://ecommerce-api-jng7.onrender.com/swagger.json 

## Features
- User authentication (JWT + refresh tokens)
- Products, Categories, Cart, Wishlist, Orders, Reviews
- Search, filter, sort & pagination
- Full Zod validation + OpenAPI 3.0 docs
- Clean architecture (Controller → Service → Repository)

## Tech Stack
- Node.js + Express
- Prisma ORM + PostgreSQL
- TypeScript + Zod
- JWT authentication
- Swagger UI + zod-to-openapi

## Key Endpoints
| Method | Endpoint                  | Description                  | Auth     |
|--------|---------------------------|------------------------------|----------|
| POST   | `/users/register`         | Register user                | Public   |
| POST   | `/users/login`            | Login                        | Public   |
| GET    | `/products`               | List products                | Public   |
| POST   | `/cart`                   | Add to cart                  | User     |
| POST   | `/wishlist`               | Add to wishlist              | User     |
| POST   | `/orders`                 | Place order                  | User     |
| GET    | `/orders`                 | View order history           | User     |
| PATCH  | `/orders/{id}/status`     | Update order status          | Admin    |


