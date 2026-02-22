# 🥚 EggXpress — Roll Into Flavour

A full-stack MERN food ordering website for EggXpress — Mumbai's favourite egg & chicken roll destination. Built to the standard of Domino's-level professionalism.

## 🚀 Tech Stack

- **Frontend**: React 18, React Router v6, React Hot Toast
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via Mongoose)
- **Styling**: Pure CSS with CSS Variables, Google Fonts (Bebas Neue + Nunito)

---

## 📦 Project Structure

```
eggxpress/
├── backend/           # Node.js + Express API
│   ├── models/        # Mongoose models
│   ├── routes/        # API routes
│   ├── server.js      # Main server file
│   └── .env           # Environment variables
├── frontend/          # React application
│   ├── public/
│   └── src/
│       ├── components/ # Navbar, Cart, MenuCard, Footer
│       ├── context/    # CartContext (global state)
│       ├── pages/      # Home, Menu, Checkout, Track, About, Contact
│       └── utils/      # API calls (axios)
└── package.json       # Root scripts
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas URI

### 1. Install All Dependencies

```bash
# From root directory
npm run install-all
```

Or manually:
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install

# Root
npm install
```

### 2. Configure Environment

Edit `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/eggxpress
PORT=5000
JWT_SECRET=your_secret_key
```

For MongoDB Atlas:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/eggxpress
```

### 3. Run the App

```bash
# Run both frontend and backend concurrently (from root)
npm start

# Or run separately:
# Backend → http://localhost:5000
cd backend && npm run dev

# Frontend → http://localhost:3000
cd frontend && npm start
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu` | Get all menu items |
| GET | `/api/menu?category=egg-rolls` | Filter by category |
| GET | `/api/menu?popular=true` | Get popular items |
| GET | `/api/menu/:id` | Get single item |
| POST | `/api/menu` | Add menu item |
| PUT | `/api/menu/:id` | Update menu item |
| DELETE | `/api/menu/:id` | Delete menu item |
| POST | `/api/orders` | Place an order |
| GET | `/api/orders` | Get all orders |
| GET | `/api/orders/:id` | Get order by ID |
| PUT | `/api/orders/:id/status` | Update order status |
| POST | `/api/auth/login` | Admin login |

---

## 🍽 Menu Categories

- 🌯 **Egg Rolls** — Classic, Double, Masala Omelette, Cheese
- 🍗 **Chicken Rolls** — Plain, Spicy
- 🥣 **Egg Bowls** — Egg Bhurji with Pav
- 🍚 **Rice & Biryani** — Egg Biryani, Chicken Biryani, Anda Curry
- 🍔 **Burgers** — Loaded Egg Burger, Chicken Egg Burger

---

## 🎨 Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with hero, categories, popular items |
| Menu | `/menu` | Full menu with search & category filter |
| Checkout | `/checkout` | Order form with delivery details |
| Track Order | `/track` | Live order status tracker |
| About | `/about` | Brand story, values, team |
| Contact | `/contact` | Contact form + info |

---

## 🔑 Admin Login

- **Username**: `admin`
- **Password**: `eggxpress123`

> For production, implement proper JWT auth with bcrypt and a User model.

---

## 🌟 Features

- ✅ Real-time cart with persistent state (Context API)
- ✅ Category filtering & full-text search
- ✅ Order placement & tracking
- ✅ Order status timeline UI
- ✅ Animated hero with floating elements
- ✅ Mobile-responsive design
- ✅ Toast notifications
- ✅ Auto-seeded menu on first run
- ✅ Dark, premium UI (Domino's level)
- ✅ Veg/Non-veg indicators
- ✅ Spice level indicators

---

## 📱 Production Deployment

**Frontend** → Deploy on Vercel or Netlify  
Set `REACT_APP_API_URL` to your backend URL.

**Backend** → Deploy on Render, Railway, or Heroku  
Set `MONGO_URI` to your MongoDB Atlas URI.

---

Made with 🥚❤️ by EggXpress Team
