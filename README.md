# Flipkart Clone - Full Stack E-Commerce Application

A functional e-commerce web application that closely replicates Flipkart's design and user experience.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS v4
- **Backend:** Node.js, Express.js, Sequelize ORM
- **Database:** MySQL

## Project Structure

```
flipkart_clone/
├── client/          # Next.js frontend
└── server/          # Express.js backend
```

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL

### Backend Setup
```bash
cd server
npm install
# Configure .env (see server/.env.example)
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
# Configure .env.local
npm run dev
```

### Default Credentials
- Email: `john@example.com`
- Password: `password123`

## Features
- Product browsing with search, filters, and sorting
- Product detail pages with image carousel
- Cart management
- Checkout with address management
- Order placement with email confirmation
- User authentication (local + Google OAuth)
- Wishlist
- Order history
- Flipkart Plus membership
