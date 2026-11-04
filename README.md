# StockFlow

StockFlow is a multi-tenant inventory management web application built on the MERN stack (MongoDB, Express, React, Node.js). It is designed for small to mid-sized businesses to manage product catalogs, track stock levels in real time, configure low-stock alerts, and perform quick inventory adjustments.

---

## Features

- **Multi-Tenant Organization Scoping**: Data is strictly isolated per organization using indexed tenant IDs, preventing cross-tenant access.
- **Authentication and Security**: User registration and login powered by JSON Web Tokens (JWT) and bcrypt password hashing.
- **Product Management**: Full CRUD operations for products with SKU uniqueness per organization, pricing details (cost and selling prices), and real-time search.
- **Quick Stock Adjustments**: Fast stock addition or deduction with an optional reason note and automatic audit logging (tracking user ID and timestamp).
- **Inventory Dashboard**: At-a-glance summary cards showing total products, total stock units on hand, and active low-stock alerts with a dedicated low-stock warning table.
- **Configurable Low-Stock Thresholds**: Individual product threshold settings with an organization-level fallback threshold in settings.

---

## Tech Stack

### Frontend
- **React 18** with **Vite** for fast client-side development and building
- **Tailwind CSS** for clean, responsive UI styling
- **React Router v6** for client-side routing and protected routes
- **Lucide React** for clean SVG iconography
- **Axios** with request interceptors for token handling and 401 redirect logic

### Backend
- **Node.js** and **Express.js** for RESTful API architecture
- **MongoDB** and **Mongoose** with compound indexing (`organizationId` + `sku`)
- **JSON Web Tokens (JWT)** for stateless session management
- **bcryptjs** for secure password hashing
- **CORS** and **dotenv** for cross-origin security and environment configuration

---

## Project Structure

```
wexa.ai-assignment/
├── client/                 # React frontend (Vite)
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── api/            # Axios API client and interceptors
│   │   ├── components/     # Reusable UI components (Modals, Layout, Navbar)
│   │   ├── context/        # Auth context provider
│   │   ├── pages/          # Dashboard, Products, Settings, Login, Signup
│   │   └── App.jsx         # App router and protected route wrappers
│   └── package.json
├── server/                 # Express REST API
│   ├── src/
│   │   ├── config/         # Database connection setup
│   │   ├── middleware/     # JWT authentication and validation middleware
│   │   ├── models/         # Mongoose schemas (Organization, User, Product)
│   │   ├── routes/         # Express route handlers (auth, products, dashboard, settings)
│   │   └── index.js        # Server entry point
│   └── package.json
├── package.json            # Root scripts for running client and server together
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (v18.x or later)
- npm (v9.x or later)
- MongoDB instance (MongoDB Atlas or local MongoDB)

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd wexa.ai-assignment
   ```

2. Install dependencies for root, server, and client:
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   cd ..
   ```

3. Configure environment variables:
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

   (Optional) If pointing the client directly to a custom backend URL in production, create a `.env` in the `client` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

---

## Running the Application

### Development Mode (Both Frontend and Backend)
Run both the Express server and Vite development server with a single command from the root directory:
```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

### Running Individually

To run the backend server only:
```bash
cd server
npm run dev
```

To run the frontend client only:
```bash
cd client
npm run dev
```

---

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new organization and admin account
- `POST /api/auth/login` - Authenticate user and receive JWT token
- `GET /api/auth/me` - Get current user profile and organization details

### Products
- `GET /api/products` - List all products for the tenant (supports `?search=` filter)
- `POST /api/products` - Create a new product
- `GET /api/products/:id` - Fetch single product details
- `PUT /api/products/:id` - Update existing product information
- `DELETE /api/products/:id` - Delete product
- `PATCH /api/products/:id/stock` - Quick stock increment or decrement with notes

### Dashboard & Analytics
- `GET /api/dashboard/stats` - Total products, total units on hand, and low stock count
- `GET /api/dashboard/low-stock` - List of products below effective threshold

### Settings
- `GET /api/settings` - Get organization settings (default low stock threshold)
- `PUT /api/settings` - Update default low stock threshold

---

## Database Design Notes

- Multi-tenancy is enforced on every query by scoping with `organizationId`.
- A compound unique index `{ organizationId: 1, sku: 1 }` guarantees that SKU codes are unique within an organization while allowing different organizations to use standard SKU conventions without conflicts.
- Stock adjustments validate against negative total quantities on hand before committing updates.
