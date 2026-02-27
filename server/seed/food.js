const mongoose = require("mongoose");
const dotenv = require("dotenv");
const FoodItem = require("../models/FoodItem");

dotenv.config();

const defaultMenu = [
  // Popcorn
  {
    name: "Classic Salted Popcorn",
    description: "Freshly popped golden corn with the perfect amount of salt",
    price: 200,
    category: "Popcorn",
    imageUrl: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=300",
    isVeg: true,
    theatre: null,
  },
  {
    name: "Caramel Popcorn",
    description: "Sweet and crunchy caramel-coated popcorn",
    price: 250,
    category: "Popcorn",
    imageUrl: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=300",
    isVeg: true,
    theatre: null,
  },
  {
    name: "Cheese Popcorn",
    description: "Loaded with melty cheddar cheese flavor",
    price: 280,
    category: "Popcorn",
    imageUrl: "https://images.unsplash.com/photo-1630172927590-59f0e4645e25?w=300",
    isVeg: true,
    theatre: null,
  },

  // Beverages
  {
    name: "Coca-Cola (Large)",
    description: "Ice-cold Coca-Cola to enjoy with your movie",
    price: 180,
    category: "Beverage",
    imageUrl: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=300",
    isVeg: true,
    theatre: null,
  },
  {
    name: "Pepsi (Large)",
    description: "Refreshing chilled Pepsi",
    price: 180,
    category: "Beverage",
    imageUrl: "https://images.unsplash.com/photo-1553456558-aff63285bdd1?w=300",
    isVeg: true,
    theatre: null,
  },
  {
    name: "Mineral Water",
    description: "Pure packaged drinking water (500ml)",
    price: 50,
    category: "Beverage",
    imageUrl: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=300",
    isVeg: true,
    theatre: null,
  },
  {
    name: "Cold Coffee",
    description: "Creamy iced coffee blended to perfection",
    price: 220,
    category: "Beverage",
    imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300",
    isVeg: true,
    theatre: null,
  },

  // Snacks
  {
    name: "Nachos with Cheese Dip",
    description: "Crispy tortilla chips with warm cheese sauce & salsa",
    price: 250,
    category: "Snack",
    imageUrl: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=300",
    isVeg: true,
    theatre: null,
  },
  {
    name: "French Fries",
    description: "Golden crispy fries seasoned with peri-peri",
    price: 180,
    category: "Snack",
    imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300",
    isVeg: true,
    theatre: null,
  },
  {
    name: "Chicken Nuggets",
    description: "6 pieces of tender chicken nuggets with dipping sauce",
    price: 280,
    category: "Snack",
    imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?w=300",
    isVeg: false,
    theatre: null,
  },

  // Combos
  {
    name: "Popcorn + Coke Combo",
    description: "Regular popcorn + Large Coca-Cola — Save ₹80!",
    price: 300,
    category: "Combo",
    imageUrl: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=300",
    isVeg: true,
    theatre: null,
  },
  {
    name: "Couple Combo",
    description: "2 Regular Popcorn + 2 Large drinks — Save ₹160!",
    price: 550,
    category: "Combo",
    imageUrl: "https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=300",
    isVeg: true,
    theatre: null,
  },
  {
    name: "Family Combo",
    description: "2 Large Popcorn + 4 Drinks + Nachos — Save ₹300!",
    price: 900,
    category: "Combo",
    imageUrl: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=300",
    isVeg: true,
    theatre: null,
  },
  {
    name: "Loaded Nachos + Pepsi Combo",
    description: "Nachos with cheese dip + Large Pepsi — Save ₹80!",
    price: 350,
    category: "Combo",
    imageUrl: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=300",
    isVeg: true,
    theatre: null,
  },
];

async function seedFood() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // only insert globals if none exist yet
    const existing = await FoodItem.countDocuments({ theatre: null });
    if (existing > 0) {
      console.log(`${existing} global food items already exist — skipping seed.`);
    } else {
      await FoodItem.insertMany(defaultMenu);
      console.log(`Inserted ${defaultMenu.length} default food items.`);
    }

    await mongoose.disconnect();
    console.log("Done.");
    process.exit(0);
  } catch (err) {
    console.error("Food seed error:", err);
    process.exit(1);
  }
}

seedFood();
