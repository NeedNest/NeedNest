# NeedNest 🤝💚

> **Connects people with extra essentials to those who need them.**

NeedNest is a full‑stack MERN web application designed to reduce the wastage of useful resources such as food, clothes, books, and other essential items. It bridges the gap between donors and people in need through a simple, location‑based sharing system.

---

## 🌟 Features

### User Module
- User registration with name, email, phone, password, and location
- Secure login with JWT authentication
- Profile management with editable details

### Donor Module
- Upload item details with title, description, category & condition
- Specify pickup location (city, state, address, pincode)
- Optional image upload for items
- Track all donated items and their status

### Item Availability & Receiver Module
- Browse all available items with 4-column responsive grid
- Search by item name or description
- Filter by category (Food, Clothes, Books, Electronics, Furniture, Medicines, Toys, Other)
- Filter by city for location-based discovery
- View detailed item information including donor contact
- Mark items as collected

### Location Management
- Location-based item discovery
- Items displayed with city and state information
- Filter items by city name for nearby availability

### Admin Module
- **Dashboard**: Stats overview (users, items, collected, removed)
- **Category Breakdown**: Visual bar chart of item distribution
- **User Management**: View all users, activate/deactivate accounts, delete users
- **Item Management**: Approve/disapprove items, remove inappropriate listings
- **Notifications**: Admin receives alerts for new donations

---

## 🛠 Tech Stack

| Layer     | Technology           |
|-----------|---------------------|
| Frontend  | React 18 + Vite     |
| Styling   | Vanilla CSS (Dark theme with Glassmorphism) |
| Backend   | Node.js + Express.js |
| Database  | MongoDB + Mongoose   |
| Auth      | JWT + bcryptjs       |
| File Upload | Multer             |
| Icons     | React Icons (Feather)|
| Fonts     | Google Fonts (Inter, Outfit) |

---

## 📁 Project Structure

```
NeedNest/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── middleware/auth.js     # JWT auth middleware
│   ├── models/
│   │   ├── User.js           # User schema
│   │   ├── Item.js           # Item schema
│   │   └── Notification.js   # Notification schema
│   ├── routes/
│   │   ├── auth.js           # Auth routes (login/register/profile)
│   │   ├── items.js          # Item CRUD routes
│   │   ├── admin.js          # Admin management routes
│   │   └── notifications.js  # Notification routes
│   ├── uploads/              # Uploaded images
│   ├── server.js             # Express server
│   ├── seed.js               # Database seed script
│   └── .env                  # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── context/          # Auth context
│   │   ├── pages/            # All page components
│   │   ├── services/         # API service layer
│   │   ├── App.jsx           # Main app with routing
│   │   └── index.css         # Design system
│   └── vite.config.js        # Vite config with proxy
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) running locally or Atlas URI

### 1. Clone & Install

```bash
# Install backend dependencies
cd NeedNest/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/neediest
JWT_SECRET=your_secret_key_here
```

### 3. Seed the Database

```bash
cd backend
node seed.js
```

This creates:
- **Admin**: admin@neediest.com / admin123
- **Users**: rahul@example.com, priya@example.com, amit@example.com (all: password123)
- **8 sample items** across multiple categories and cities

### 4. Run the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

---

## 📋 Login Credentials

| Role  | Email                   | Password    |
|-------|------------------------|-------------|
| Admin | admin@neediest.com     | admin123    |
| User  | rahul@example.com      | password123 |
| User  | priya@example.com      | password123 |
| User  | amit@example.com       | password123 |

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint           | Description         | Access  |
|--------|-------------------|---------------------|---------|
| POST   | /api/auth/register | Register new user   | Public  |
| POST   | /api/auth/login    | Login user          | Public  |
| GET    | /api/auth/me       | Get current profile | Private |
| PUT    | /api/auth/profile  | Update profile      | Private |

### Items
| Method | Endpoint               | Description           | Access  |
|--------|------------------------|-----------------------|---------|
| GET    | /api/items             | Browse items (filtered)| Public  |
| GET    | /api/items/:id         | Get item details      | Public  |
| POST   | /api/items             | Donate new item       | Private |
| PUT    | /api/items/:id         | Update item           | Owner   |
| DELETE | /api/items/:id         | Delete item           | Owner/Admin |
| PUT    | /api/items/:id/collect | Mark as collected     | Private |
| GET    | /api/items/my-donations| Get user's donations  | Private |

### Admin
| Method | Endpoint                          | Description         | Access |
|--------|----------------------------------|---------------------|--------|
| GET    | /api/admin/stats                 | Dashboard stats     | Admin  |
| GET    | /api/admin/users                 | List all users      | Admin  |
| PUT    | /api/admin/users/:id/toggle-status| Toggle user status | Admin  |
| DELETE | /api/admin/users/:id             | Delete user         | Admin  |
| GET    | /api/admin/items                 | List all items      | Admin  |
| PUT    | /api/admin/items/:id/approve     | Toggle approval     | Admin  |
| PUT    | /api/admin/items/:id/remove      | Remove item         | Admin  |

---

## 📄 License

This project is for educational purposes.
