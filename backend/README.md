# FMCG Platform Backend API

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Rename `.env.example` to `.env` and fill in your values:
```
PORT=5000
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/fmcg_platform
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_MAX=300
MPESA_PAYBILL_NUMBER=247247
MPESA_ACCOUNT_NUMBER=0710292540
MPESA_CALLBACK_SECRET=
```

### 3. Run the Server
```bash
# Development
npm run dev

# Production
npm start
```

---

## API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Private |

### Suppliers
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/suppliers | Public |
| GET | /api/suppliers/:id | Public |
| POST | /api/suppliers | Private |
| PUT | /api/suppliers/:id | Private |
| DELETE | /api/suppliers/:id | Admin |

### Products
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/products | Public |
| GET | /api/products/:id | Public |
| POST | /api/products | Admin/Supplier |
| PUT | /api/products/:id | Admin/Supplier |
| DELETE | /api/products/:id | Admin |

### Categories
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/categories | Public |
| GET | /api/categories/:id/subcategories | Public |
| POST | /api/categories | Admin |

### Orders
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/orders | Admin |
| GET | /api/orders/my | Private |
| GET | /api/orders/:id | Private |
| POST | /api/orders | Private |
| PUT | /api/orders/:id/status | Admin |

### Payments
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/payments | Private |
| POST | /api/payments/mpesa/callback | M-Pesa callback |
| GET | /api/payments/order/:orderId | Private |
| PUT | /api/payments/:id/confirm | Admin |

### Deliveries
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/deliveries | Admin |
| GET | /api/deliveries/order/:orderId | Private |
| PUT | /api/deliveries/:id | Admin |

### Agents
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/agents | Admin |
| GET | /api/agents/:id | Private |
| POST | /api/agents | Private |

### Reviews
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/reviews | Private |
| GET | /api/reviews/supplier/:supplierId | Public |

### Analytics
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/analytics/dashboard | Admin |

---

## Folder Structure
```
fmcg-backend/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── supplierController.js
│   ├── productController.js
│   ├── orderController.js
│   ├── paymentController.js
│   ├── deliveryController.js
│   ├── agentController.js
│   ├── reviewController.js
│   ├── categoryController.js
│   └── miscControllers.js
├── middleware/
│   └── authMiddleware.js
├── models/
│   ├── User.js
│   ├── Address.js
│   ├── Supplier.js
│   ├── Category.js
│   ├── Product.js
│   ├── SupplierProduct.js
│   ├── Customer.js
│   ├── Order.js
│   ├── Payment.js
│   ├── Delivery.js
│   ├── Driver.js
│   ├── Agent.js
│   ├── Review.js
│   ├── Notification.js
│   └── Banner.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── supplierRoutes.js
│   ├── productRoutes.js
│   ├── categoryRoutes.js
│   ├── customerRoutes.js
│   ├── orderRoutes.js
│   ├── paymentRoutes.js
│   ├── deliveryRoutes.js
│   ├── agentRoutes.js
│   ├── reviewRoutes.js
│   ├── bannerRoutes.js
│   ├── notificationRoutes.js
│   └── analyticsRoutes.js
├── utils/
│   └── generateToken.js
├── .env.example
├── package.json
└── server.js
```
