# 🛒 Flipkart Clone — Full Stack E-Commerce Application

A production-ready, feature-rich e-commerce web application that closely replicates Flipkart's design, functionality, and user experience. Built with **Next.js 16** on the frontend and **Express.js + MySQL** on the backend.

---

## 📑 Table of Contents

- [Live Demo](#-live-demo)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Setup Instructions](#-setup-instructions)
- [Environment Variables](#-environment-variables)
- [Database Seeding](#-database-seeding)
- [API Endpoints](#-api-endpoints)
- [Recent Changes & Improvements](#-recent-changes--improvements)
- [Assumptions & Design Decisions](#-assumptions--design-decisions)

---

## 🌐 Live Demo

**Production Deployment:**  
🔗 **Frontend:** https://flipkart-clone-one-omega.vercel.app/

> **Note:** Backend is deployed separately. Make sure both frontend and backend are running for full functionality.

---

## 🧰 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.2.3 | React framework with App Router, SSR |
| **React** | 19.2.4 | UI library |
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **Axios** | 1.15.0 | HTTP client for API calls |
| **NextAuth.js** | 4.24.13 | Google OAuth authentication |
| **React Hot Toast** | 2.6.0 | Toast notifications |
| **React Icons** | 5.6.0 | Icon library |
| **Swiper** | 12.1.3 | Image carousel |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 22.x | JavaScript runtime |
| **Express.js** | 4.21.0 | Web framework |
| **Sequelize** | 6.37.3 | ORM for MySQL |
| **MySQL2** | 3.11.0 | MySQL database driver |
| **JWT** | 9.0.2 | Token-based authentication |
| **bcryptjs** | 2.4.3 | Password hashing |
| **Nodemailer** | 8.0.5 | Email notifications (SMTP/Gmail) |
| **Helmet** | 7.1.0 | Security headers |
| **Morgan** | 1.10.0 | HTTP request logging |
| **Nodemon** | 3.1.4 | Development auto-restart |

### Database
| Technology | Purpose |
|---|---|
| **MySQL** | Relational database (via MySQL Workbench locally) |

---

## 📁 Project Structure

```
flipkart_clone/
├── client/                          # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.jsx             # Homepage (banners, deals, featured)
│   │   │   ├── login/page.jsx       # Login & Registration
│   │   │   ├── products/page.jsx    # Product listing with filters
│   │   │   ├── product/[id]/page.jsx# Product detail page
│   │   │   ├── category/[slug]/     # Category-based browsing
│   │   │   ├── cart/page.jsx        # Shopping cart
│   │   │   ├── checkout/page.jsx    # Checkout with address form
│   │   │   ├── checkout/payment/    # Payment page
│   │   │   ├── orders/page.jsx      # Order history
│   │   │   ├── order-confirmation/  # Order success page
│   │   │   ├── wishlist/page.jsx    # Wishlist
│   │   │   ├── compare/page.jsx     # Product comparison
│   │   │   ├── flipkart-plus/       # Flipkart Plus membership
│   │   │   └── account/             # Account management
│   │   │       ├── page.jsx         # Profile overview
│   │   │       ├── addresses/       # Saved addresses (CRUD)
│   │   │       ├── coupons/         # Available coupons
│   │   │       ├── gift-cards/      # Gift card management
│   │   │       ├── saved-cards/     # Saved payment cards
│   │   │       ├── saved-upi/       # Saved UPI IDs
│   │   │       ├── notifications/   # Notification preferences
│   │   │       ├── reviews/         # User reviews
│   │   │       └── pan/             # PAN card info
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx       # Flipkart-style navigation bar
│   │   │   │   ├── Footer.jsx       # Site footer
│   │   │   │   └── ClientLayout.jsx # Root layout wrapper
│   │   │   ├── product/
│   │   │   │   └── ProductCard.jsx  # Reusable product card
│   │   │   └── account/
│   │   │       └── AccountSidebar.jsx # Account navigation sidebar
│   │   ├── context/
│   │   │   ├── AuthContext.jsx      # Authentication state
│   │   │   └── CartContext.jsx      # Cart state management
│   │   └── lib/
│   │       ├── api.js               # Axios API client
│   │       └── utils.js             # Utility functions
│   └── package.json
│
├── server/                          # Express.js Backend
│   ├── server.js                    # Entry point
│   ├── src/
│   │   ├── app.js                   # Express app setup
│   │   ├── config/
│   │   │   └── database.js          # Sequelize DB connection
│   │   ├── controllers/
│   │   │   ├── authController.js    # Login, register, Google OAuth
│   │   │   ├── productController.js # Product CRUD & search
│   │   │   ├── cartController.js    # Cart management
│   │   │   ├── orderController.js   # Order placement & history
│   │   │   ├── wishlistController.js# Wishlist management
│   │   │   ├── addressController.js # Address CRUD
│   │   │   └── categoryController.js# Category & subcategory tree
│   │   ├── models/
│   │   │   ├── User.js              # User accounts
│   │   │   ├── Product.js           # Products with specs & images
│   │   │   ├── Category.js          # Top-level categories
│   │   │   ├── Subcategory.js       # Subcategories
│   │   │   ├── SubSubcategory.js    # Sub-subcategories
│   │   │   ├── Brand.js             # Product brands
│   │   │   ├── Color.js             # Available colors
│   │   │   ├── Cart.js / CartItem.js# Cart & cart items
│   │   │   ├── Order.js / OrderItem.js # Orders & line items
│   │   │   ├── Wishlist.js / WishlistItem.js # Wishlist
│   │   │   ├── Address.js           # Shipping addresses
│   │   │   └── index.js             # Model associations
│   │   ├── routes/                  # Express route definitions
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT authentication guard
│   │   │   ├── optionalAuth.js      # Optional auth middleware
│   │   │   └── errorHandler.js      # Global error handler
│   │   ├── services/
│   │   │   └── emailService.js      # Nodemailer email templates
│   │   └── seeders/
│   │       └── seed.js              # Database seed data (80+ products)
│   └── package.json
│
└── README.md
```

---

## ✨ Features

### 🏠 Homepage
- **Hero Banner Carousel** — Auto-rotating promotional banners
- **Category Navigation Bar** — Top-level category strip (Mobiles, Electronics, Fashion, etc.)
- **Deals of the Day** — Countdown timer with discounted products
- **Featured Products** — Curated product carousels
- **Best Sellers** — Products sorted by review count
- **Top Deals** — Products with highest discount percentages
- **Multi-section Layout** — Matches Flipkart's real homepage structure

### 🔍 Product Browsing & Search
- **Global Search Bar** — Search by product name, brand, or category
- **Product Listing Page** — Grid/list view with product cards
- **Advanced Filters** — Filter by:
  - Price range (min/max slider)
  - Brand (multi-select)
  - Category / Subcategory / Sub-subcategory
  - Rating (minimum stars)
  - Color
  - Discount percentage
- **Sorting Options** — Price low-to-high, high-to-low, rating, newest, discount
- **Pagination** — Server-side paginated results
- **Category Pages** — Dedicated `/category/[slug]` pages for each category

### 📦 Product Detail Page
- **Image Carousel** — Main image with prev/next arrows + clickable thumbnail strip
- **Stock Availability** — Real-time stock display ("In Stock — 401 units available" / "Only 3 left, hurry!" / "Out of Stock")
- **Price Display** — MRP with strikethrough, selling price, discount percentage
- **WOW Deal Badge** — Highlighted deal pricing
- **Product Description** — Full product description text (expandable)
- **Specifications Table** — Key-value specification table from product data (expandable)
- **Ratings & Reviews** — Star rating display with review count
- **EMI & Credit Card Offers** — Flipkart Axis Bank card promotion section
- **Delivery Details** — Estimated delivery date with address selection
- **Similar Products** — Related products from the same category
- **Wishlist Toggle** — Heart icon to add/remove from wishlist
- **Add to Cart / Buy Now** — Sticky action buttons

### 🛒 Shopping Cart
- **Cart Item List** — Product image, name, price, quantity selector
- **Quantity Management** — Increase/decrease quantity
- **Remove Items** — Remove individual items
- **Price Summary** — Subtotal, discount, delivery charges, total
- **Savings Display** — Total amount saved on the order
- **Empty Cart State** — Illustrated empty cart with CTA

### 💳 Checkout
- **Step Indicator** — Login → Delivery Address → Order Summary → Payment
- **Inline Address Form** — Full shipping address form directly on checkout page:
  - Name, Phone, Pincode, Locality, Address, City, State (dropdown with all Indian states), Address Type (Home/Work)
- **Saved Address Selection** — Select from previously saved addresses
- **Add New Address** — Create new address without leaving checkout
- **Order Summary** — Product details with quantity selector
- **Payment Options** — Cash on Delivery, UPI, Credit/Debit Card, Net Banking
- **Price Breakdown** — Itemized price details with delivery charges
- **Place Order Button** — Single-click order placement

### 📧 Email Notifications
- **Order Confirmation Email** — Automated email sent on successful order placement
- **Responsive HTML Template** — Mobile-friendly email design with:
  - Flipkart branding header
  - Order number and date
  - Itemized product list with images
  - Price breakdown with savings highlight
  - Shipping address and estimated delivery
  - Payment method details
  - "View Order Details" CTA button
- **Gmail SMTP Integration** — Uses Gmail App Password for reliable delivery
- **Outlook & Gmail Compatible** — MSO conditionals for Outlook, tested on major email clients

### 📊 Product Comparison
- **Side-by-Side Comparison** — Compare up to 4 products simultaneously
- **Specification Comparison** — Aligned spec rows for easy comparison
- **Price Comparison** — Visual price/discount comparison
- **Add from Product Pages** — "Compare" button on product cards
- **Remove Products** — Remove individual products from comparison

### ❤️ Wishlist
- **Add/Remove Products** — Toggle wishlist from product detail or listing pages
- **Wishlist Page** — Dedicated page showing all wishlisted items
- **Move to Cart** — Quick action to move wishlist item to cart
- **Product Cards** — Full product card display with pricing

### 📋 Order Management
- **Order History** — List of all past orders with status
- **Order Details** — Order number, date, items, pricing, shipping info
- **Order Status Tracking** — Pending → Confirmed → Shipped → Delivered
- **Order Confirmation Page** — Post-purchase confirmation with order summary
- **Super Coins Earned** — Display of loyalty points earned per order

### 👤 User Account
- **Profile Management** — View and edit personal information
- **Address Book** — Full CRUD for shipping addresses (add, edit, delete, set default)
- **Account Sidebar** — Consistent navigation across all account pages
- **Saved Cards** — Payment card management page
- **Saved UPI** — UPI ID management page
- **Coupons** — Available coupons page
- **Gift Cards** — Gift card management page
- **PAN Card** — PAN information page
- **Notifications** — Notification preferences page
- **Reviews** — User review history page

### 🔐 Authentication
- **Email/Password Login** — Traditional login with JWT tokens
- **User Registration** — Sign up with name, email, password
- **Google OAuth** — One-click Google sign-in via NextAuth.js
- **Guest Checkout** — Browse and add to cart without logging in
- **JWT Token Management** — Secure token storage with auto-refresh
- **Protected Routes** — Server-side route protection with auth middleware

### ⭐ Flipkart Plus
- **Membership Page** — Flipkart Plus benefits overview
- **Super Coins** — Loyalty points display and tracking
- **Plus Tier Status** — Member tier visualization

### 🎨 UI/UX Design
- **Pixel-Perfect Flipkart UI** — Matches Flipkart's actual design language
- **Responsive Design** — Fully responsive across desktop, tablet, and mobile
- **Flipkart Blue Theme** — `#2874f0` brand color throughout
- **Category Dropdowns** — Mega menu navigation with subcategories
- **Toast Notifications** — Success/error feedback on all actions
- **Loading States** — Skeleton loaders and loading indicators
- **Sticky Elements** — Sticky navbar, sticky action buttons on product pages
- **Mobile Navbar** — Smooth gradient header with stable scroll detection and consistent emoji display

### 🗄️ Database Design
- **15 Models** — User, Product, Category, Subcategory, SubSubcategory, Brand, Color, Cart, CartItem, Order, OrderItem, Wishlist, WishlistItem, Address
- **Associations** — Full relational modeling with foreign keys and cascading deletes
- **80+ Seeded Products** — Pre-populated across all categories with real images
- **Category Tree** — 3-level deep category hierarchy (Category → Subcategory → SubSubcategory)

---

## 🖼️ Screenshots

> Run the application locally to see the full UI. Key pages include:
> - Homepage with banners and product carousels
> - Product listing with filters sidebar
> - Product detail with image carousel and specifications
> - Shopping cart with price summary
> - Checkout with inline address form
> - Order confirmation with email notification

---

## 🚀 Setup Instructions

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 18.x or higher |
| MySQL | 8.x (via MySQL Workbench or CLI) |
| npm | 9.x or higher |
| Git | Latest |

### Step 1: Clone the Repository

```bash
git clone https://github.com/vsn20/flipkart_clone.git
cd flipkart_clone
```

### Step 2: Setup the Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=flipkart_clone_v2
DB_USER=root
DB_PASSWORD="your_mysql_password"

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS="your_gmail_app_password"
SMTP_FROM=your_email@gmail.com
```

Create the MySQL database:

```sql
CREATE DATABASE flipkart_clone_v2;
```

Seed the database with sample data:

```bash
npm run seed
```

Start the backend server:

```bash
npm run dev
# Server runs on http://localhost:5000
```

### Step 3: Setup the Frontend

```bash
cd ../client
npm install
```

Create a `.env.local` file in the `client/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend dev server:

```bash
npm run dev
# App runs on http://localhost:3000
```

### Step 4: Access the Application

Open **http://localhost:3000** in your browser.

**Default Login Credentials:**
| Field | Value |
|---|---|
| Email | `john@example.com` |
| Password | `password123` |

---

## 🔐 Environment Variables

### Server (`server/.env`)

| Variable | Description | Required |
|---|---|---|
| `PORT` | Server port number | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |
| `DB_HOST` | MySQL host | Yes |
| `DB_PORT` | MySQL port | Yes |
| `DB_NAME` | MySQL database name | Yes |
| `DB_USER` | MySQL username | Yes |
| `DB_PASSWORD` | MySQL password | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `CLIENT_URL` | Frontend URL for CORS | Yes |
| `SMTP_HOST` | SMTP server hostname | No* |
| `SMTP_PORT` | SMTP server port | No* |
| `SMTP_USER` | SMTP email address | No* |
| `SMTP_PASS` | SMTP password / Gmail App Password | No* |
| `SMTP_FROM` | Sender email address | No* |

> *SMTP variables are optional — orders will still be placed without email, but confirmation emails won't be sent.

### Client (`client/.env.local`)

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | Yes |

---

## 🌱 Database Seeding

The seed script (`npm run seed`) populates the database with:

- **8 Categories** — Mobiles, Electronics, TVs & Appliances, Fashion (Men/Women), Home & Furniture, Grocery, Toys
- **20+ Subcategories** — Smartphones, Laptops, Audio, Tablets, T-Shirts, Shoes, etc.
- **10+ Sub-subcategories** — Specific categories like Running Shoes, Casual Shirts, etc.
- **15+ Brands** — Apple, Samsung, Sony, Nike, Levi's, etc.
- **80+ Products** — Complete with:
  - Real product images (Unsplash CDN)
  - Realistic pricing (MRP & selling price)
  - Descriptions and specifications (JSON)
  - Stock quantities
  - Ratings and review counts
  - Discount percentages
  - Featured/deal flags

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with email/password |
| POST | `/api/auth/google` | Google OAuth login |
| GET | `/api/auth/me` | Get current user profile |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | List products (search, filter, sort, paginate) |
| GET | `/api/products/:id` | Get product details + similar products |
| GET | `/api/products/featured` | Get featured, top deals, best sellers |
| GET | `/api/products/brands` | Get available brands for filters |
| GET | `/api/products/colors` | Get available colors for filters |

### Categories
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/categories` | Get full category tree |
| GET | `/api/categories/:slug` | Get category by slug with subcategories |

### Cart
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/cart` | Get user's cart |
| POST | `/api/cart/add` | Add item to cart |
| PUT | `/api/cart/update/:itemId` | Update item quantity |
| DELETE | `/api/cart/remove/:itemId` | Remove item from cart |
| DELETE | `/api/cart/clear` | Clear entire cart |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/orders` | Place order from cart |
| POST | `/api/orders/direct` | Place order for single product |
| GET | `/api/orders` | Get user's order history |
| GET | `/api/orders/:id` | Get order details |

### Wishlist
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/wishlist` | Get user's wishlist |
| POST | `/api/wishlist/add` | Add product to wishlist |
| DELETE | `/api/wishlist/remove/:productId` | Remove from wishlist |
| GET | `/api/wishlist/check/:productId` | Check if product is in wishlist |

### Addresses
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/addresses` | Get user's addresses |
| POST | `/api/addresses` | Add new address |
| PUT | `/api/addresses/:id` | Update address |
| DELETE | `/api/addresses/:id` | Delete address |

---

## 🎯 Recent Changes & Improvements

### Mobile UI/UX Enhancements (Latest Build)

**Navbar Scroll Behavior:**
- ✅ Fixed scroll detection flickering on mobile by increasing hysteresis thresholds
  - Mobile: **150px down**, **70px up** (80px gap for stability)
  - Desktop: **140px down**, **40px up** (100px gap for smooth behavior)
- ✅ Navbar remains **sticky on mobile** during scroll with all elements visible
- ✅ All emojis and navigation items stay visible when scrolling down on mobile

**Navbar Visual Design:**
- ✅ Smooth gradient fade header (dark blue #1a237e → light blue → white)
- ✅ White backgrounds on navbar sections to prevent product content overlap
- ✅ Prevented flickering when scrolling minimal distances (better UX on smaller screens)
- ✅ Category emojis remain **large (32px)** consistently during scroll (not shrinking)
- ✅ Removed duplicate Flipkart logos - only shows once in search bar on desktop when scrolled
- ✅ Address selector with coin emoji (🪙) always accessible on mobile

**Product Detail Page:**
- ✅ Fixed missing emoji badges on trust indicators (🔄, 💵, 💬)
- ✅ Replaced broken image placeholders with actual emojis for Return, Cash on Delivery, and Support

**Code Quality:**
- All changes maintain existing functionality
- No breaking changes to backend or API contracts
- Mobile-first approach in scroll detection logic

---

## 📌 Assumptions & Design Decisions

### Architecture
- **Monorepo Structure** — Client and server are in a single repository for easier development and deployment. Both can be deployed independently.
- **REST API** — Chose REST over GraphQL for simplicity and Flipkart-like API design.
- **JWT Authentication** — Stateless auth with tokens stored in localStorage. Suitable for SPA architecture.
- **Sequelize ORM** — Used over raw SQL for type-safe queries and automatic migration support.

### Authentication
- **Google OAuth** — Implemented via NextAuth.js. Simulates real Google sign-in flow. In production, requires Google Cloud Console credentials.
- **Guest Users** — Anonymous users can browse and add to cart. Authentication is prompted only at checkout.
- **Password Hashing** — All passwords are hashed with bcryptjs (10 salt rounds) before storage.

### Product Data
- **Product Images** — Sourced from Unsplash CDN for demo purposes. In production, images would be stored in cloud storage (S3/Cloudinary).
- **Specifications** — Stored as JSON in MySQL, allowing flexible key-value pairs per product category.
- **Stock Management** — Basic stock tracking. Stock is decremented on order placement but not reserved during cart addition.

### Email
- **Gmail SMTP** — Uses Gmail App Passwords for email delivery. In production, a dedicated email service (SendGrid, AWS SES) would be preferred.
- **Fire & Forget** — Email sending is async and non-blocking. Order placement succeeds even if email fails.
- **Responsive Template** — Table-based HTML email layout for cross-client compatibility (Gmail, Outlook, Apple Mail).

### Payments
- **Simulated** — Payment processing is simulated. Options include COD, UPI, Card, and Net Banking, but no actual payment gateway is integrated.
- **Production Note** — Razorpay or Stripe integration would be needed for real payments.

### Database
- **MySQL** — Chosen for relational data integrity (orders, foreign keys, transactions).
- **Auto-Sync** — Sequelize `sync({ alter: true })` is used in development. In production, proper migrations should be used.
- **Seed Data** — 80+ realistic products with Indian pricing (INR), brand names, and specifications.

### UI/UX
- **Flipkart Parity** — UI closely matches Flipkart's actual design as of 2024-2025, including colors (#2874f0, #fb641b), typography, spacing, and component patterns.
- **Mobile Responsive** — All pages adapt to mobile viewport (< 768px breakpoint).
- **No Placeholder Images** — Real product images are used throughout the application via Unsplash CDN URLs.

---

## 👨‍💻 Author

**Sai Naman Vuppala** — [GitHub: @vsn20](https://github.com/vsn20)

---

## 📄 License

This project is built for educational and portfolio purposes. It is not affiliated with or endorsed by Flipkart.
