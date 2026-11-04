# StockFlow - SaaS Inventory Management System (MVP v0.1)

StockFlow is a focused, multi-tenant inventory management system built with the **MERN Stack** (MongoDB, Express, React, Node.js) strictly according to the 6-Hour MVP PRD specifications.

---

## 1. Core Feature Matrix

| Feature ID | Scope Description | Status |
| :--- | :--- | :--- |
| **FR-1** | **Signup & Login**: Email, password, confirm password, organization name, bcrypt hashing, JWT authentication. | Complete |
| **FR-2** | **Organization Context**: Every tenant is strictly isolated by `organizationId`. Zero cross-tenant data leakage. | Complete |
| **FR-3** | **Product Model**: ID, organization ID, Name, SKU (unique per org), Description, Quantity on Hand, Cost Price, Selling Price, Low Stock Threshold, Timestamps, and Last Updated By. | Complete |
| **FR-4** | **Product CRUD**: Add product modal, products table list with search filter, edit form, delete with confirmation modal dialog. | Complete |
| **FR-5** | **Simple Stock Updates**: Direct edit form plus inline/modal stock adjustment control (`+/- N units` with note), storing `lastUpdatedBy` and timestamp. | Complete |
| **FR-6** | **Dashboard Overview**: Summary cards (Total Products, Total Units on Hand, Low Stock Alerts count) and Low Stock Items table with effective threshold resolution. | Complete |
| **FR-7** | **Global Settings**: Organization-level default low stock threshold setting (default: 5) applied when a product's threshold is empty. | Complete |

---

## 2. Technical Stack

- **Backend**: Node.js, Express.js, Mongoose / MongoDB Atlas, JWT, bcryptjs.
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide SVG icons, Axios, React Router v6.
- **Styling & Color Palette**: Modern flat design palette using White (`#FFFFFF`), Sunset Orange (`#FF5841`), and Red-Violet (`#C53678`), standard rounded corners, zero emojis, zero em dashes, zero AI watermarks.

---

## 3. Getting Started

### Prerequisites
- Node.js (v18+ or v22+)
- npm (v9+)

### Installation
Dependencies are already installed. If reinstalling from scratch:
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

---

## 4. Running the Application

### Option A: Run Full Stack Simultaneously (Recommended)
From the project root:
```bash
npm run dev
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

### Option B: Run Services Individually
In terminal 1 (Server):
```bash
cd server
npm run dev
```

In terminal 2 (Client):
```bash
cd client
npm run dev
```

### Option C: Production Standalone Server
The client is pre-built into `client/dist`. You can run the entire unified app directly from the server:
```bash
cd server
npm start
```
Access the complete application at `http://localhost:5000`.

---

## 5. Demo Credentials

You can sign up a brand new organization via the **Signup** screen or use the pre-configured demo account:

- **Email**: `demo@stockflow.local`
- **Password**: `password123`
- **Organization**: `Acme Retail Store`
*(You can also use the **Create an account** link on the login page to register any new organization).*

