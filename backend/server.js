const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/menu',    require('./routes/menu'));
app.use('/api/orders',  require('./routes/orders'));
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/promo',   require('./routes/promo'));

// Connect to MongoDB — server only starts AFTER DB is connected
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/eggxpress';

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // fail fast if Atlas unreachable (10s)
      socketTimeoutMS: 45000,          // drop idle sockets after 45s
      maxPoolSize: 10,                  // keep up to 10 connections open
    });

    console.log('✅ MongoDB connected');

    // Log connection drops so you know when they happen
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected — retrying automatically...');
    });
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err.message);
    });

    // Seed menu items
    const MenuItem = require('./models/MenuItem');
    await seedMenu(MenuItem);

    // Only start listening AFTER DB is ready
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1); // crash hard so process manager/nodemon restarts cleanly
  }
}

startServer();

async function seedMenu(MenuItem) {
  const count = await MenuItem.countDocuments();
  if (count === 0) {
    await MenuItem.insertMany([
      {
        name: 'Classic Egg Roll',
        description: 'Crispy paratha roll filled with spiced scrambled eggs, fresh onions, chillies and tangy chutney.',
        price: 149,
        category: 'egg-rolls',
        image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500',
        isVeg: true,
        isPopular: true,
        spiceLevel: 'medium',
        rating: 4.8,
        reviews: 320
      },
      {
        name: 'Double Egg Roll',
        description: 'Double the eggs, double the taste! Two eggs wrapped in a flaky paratha with special EggXpress masala.',
        price: 189,
        category: 'egg-rolls',
        image: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=500',
        isVeg: true,
        isPopular: true,
        spiceLevel: 'hot',
        rating: 4.9,
        reviews: 450
      },
      {
        name: 'Chicken Roll',
        description: 'Tender grilled chicken strips with egg, lettuce, and our signature sauce in a soft paratha.',
        price: 229,
        category: 'chicken-rolls',
        image: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=500',
        isVeg: false,
        isPopular: true,
        spiceLevel: 'medium',
        rating: 4.7,
        reviews: 280
      },
      {
        name: 'Spicy Chicken Egg Roll',
        description: 'Fiery combination of spiced chicken and egg with jalapeños and hot sauce. Not for the faint-hearted!',
        price: 259,
        category: 'chicken-rolls',
        image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500',
        isVeg: false,
        isPopular: false,
        spiceLevel: 'extra-hot',
        rating: 4.6,
        reviews: 195
      },
      {
        name: 'Egg Bhurji Bowl',
        description: 'Street-style scrambled eggs cooked with tomatoes, onions, and aromatic spices. Served with pav.',
        price: 129,
        category: 'egg-bowls',
        image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500',
        isVeg: true,
        isPopular: true,
        spiceLevel: 'medium',
        rating: 4.5,
        reviews: 210
      },
      {
        name: 'Masala Omelette Wrap',
        description: 'Fluffy masala omelette with sautéed veggies wrapped in a toasted wheat tortilla.',
        price: 169,
        category: 'egg-rolls',
        image: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=500',
        isVeg: true,
        isPopular: false,
        spiceLevel: 'mild',
        rating: 4.4,
        reviews: 155
      },
      {
        name: 'Cheese Egg Roll',
        description: 'Gooey melted cheese with egg and veggies in a golden crispy paratha. Kids favourite!',
        price: 199,
        category: 'egg-rolls',
        image: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=500',
        isVeg: true,
        isPopular: false,
        spiceLevel: 'mild',
        rating: 4.6,
        reviews: 178
      },
      {
        name: 'Egg Biryani',
        description: 'Fragrant basmati rice cooked with whole boiled eggs, saffron, and fried onions. A royal treat.',
        price: 199,
        category: 'rice',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500',
        isVeg: true,
        isPopular: true,
        spiceLevel: 'medium',
        rating: 4.8,
        reviews: 390
      },
      {
        name: 'Chicken Biryani',
        description: 'Classic Hyderabadi-style chicken biryani with tender chicken pieces and aromatic spices.',
        price: 269,
        category: 'rice',
        image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500',
        isVeg: false,
        isPopular: true,
        spiceLevel: 'medium',
        rating: 4.9,
        reviews: 520
      },
      {
        name: 'Anda Curry + Rice',
        description: 'Rich egg curry in spiced gravy served with steamed basmati rice. Home-style comfort food.',
        price: 159,
        category: 'rice',
        image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500',
        isVeg: true,
        isPopular: false,
        spiceLevel: 'medium',
        rating: 4.3,
        reviews: 120
      },
      {
        name: 'Loaded Egg Burger',
        description: 'Stacked burger with fried egg, cheddar cheese, lettuce, tomato and chipotle mayo.',
        price: 219,
        category: 'burgers',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
        isVeg: true,
        isPopular: false,
        spiceLevel: 'mild',
        rating: 4.5,
        reviews: 165
      },
      {
        name: 'Chicken Egg Burger',
        description: 'Juicy chicken patty topped with fried egg, bacon-style chicken strips, and our special sauce.',
        price: 279,
        category: 'burgers',
        image: 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=500',
        isVeg: false,
        isPopular: true,
        spiceLevel: 'medium',
        rating: 4.7,
        reviews: 230
      },
      // ── Drinks ────────────────────────────────────────────────────────────
      {
        name: 'Masala Chai',
        description: 'Strong, spiced Indian tea brewed with ginger, cardamom, and cinnamon. The perfect companion to your roll.',
        price: 39,
        category: 'drinks',
        image: 'https://images.unsplash.com/photo-1556742031-c6961e8560b0?w=500',
        isVeg: true,
        isPopular: true,
        spiceLevel: 'mild',
        rating: 4.7,
        reviews: 410
      },
      {
        name: 'Fresh Lime Soda',
        description: 'Zingy fresh lime squeezed over chilled soda with a pinch of salt and sugar. Sweet or salted — your choice.',
        price: 59,
        category: 'drinks',
        image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500',
        isVeg: true,
        isPopular: false,
        spiceLevel: 'mild',
        rating: 4.5,
        reviews: 185
      },
      {
        name: 'Cold Coffee',
        description: 'Thick, creamy blended cold coffee made with chilled milk and a generous scoop of vanilla ice cream.',
        price: 89,
        category: 'drinks',
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500',
        isVeg: true,
        isPopular: true,
        spiceLevel: 'mild',
        rating: 4.6,
        reviews: 260
      },
      {
        name: 'Mango Lassi',
        description: 'Thick and refreshing yoghurt-based mango shake, lightly sweetened and garnished with a pinch of cardamom.',
        price: 79,
        category: 'drinks',
        image: 'https://images.unsplash.com/photo-1574349930230-cb2e9b4e4b3a?w=500',
        isVeg: true,
        isPopular: false,
        spiceLevel: 'mild',
        rating: 4.4,
        reviews: 142
      }
    ]);
    console.log('Menu seeded — 16 items including drinks!');
  }
}

// (server start moved into startServer() above)
