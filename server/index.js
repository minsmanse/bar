const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors()); // Allow all origins for simplicity in this demo
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"]
  }
});

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3001;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));


// Define Schemas
const schemaOptions = {
  strict: false,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
      delete ret._id;
    }
  }
};

const ingredientSchema = new mongoose.Schema({}, schemaOptions);
const menuSchema = new mongoose.Schema({}, schemaOptions);
const orderSchema = new mongoose.Schema({
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
}, schemaOptions);

const Ingredient = mongoose.model('Ingredient', ingredientSchema);
const Menu = mongoose.model('Menu', menuSchema);
const Order = mongoose.model('Order', orderSchema);


io.on('connection', async (socket) => {
  console.log('User connected:', socket.id);
  
  try {
    const orders = await Order.find({}); // Fetch orders from MongoDB
    socket.emit('initialData', { orders });
  } catch (error) {
    console.error('Error fetching initial orders for socket:', error);
  }

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Ingredients API
app.get('/api/ingredients', async (req, res) => {
  try {
    const ingredients = await Ingredient.find({});
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/ingredients', async (req, res) => {
  try {
    const newIngredient = await Ingredient.create(req.body);
    res.status(201).json(newIngredient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/ingredients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Ingredient.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ message: 'Ingredient not found' });
    }
    res.json({ message: 'Ingredient deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Menu API
app.get('/api/menu', async (req, res) => {
  try {
    const menu = await Menu.find({});
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/menu', async (req, res) => {
  try {
    const newMenu = await Menu.create(req.body);
    res.status(201).json(newMenu);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Menu.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
);

app.put('/api/menu/reorder', async (req, res) => {
  try {
    const { menu } = req.body;
    if (!Array.isArray(menu)) {
      return res.status(400).json({ message: 'Invalid data: menu must be an array' });
    }
    
    // Clear existing menu and insert new one
    await Menu.deleteMany({});
    await Menu.insertMany(menu);

    res.json({ message: 'Menu reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Orders API
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find({});
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    // Mongoose schema handles default status and createdAt
    const newOrder = await Order.create(req.body); 
    io.emit('newOrder', newOrder);
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/orders/batch', async (req, res) => {
  try {
    const { orderIds } = req.body;
    if (!Array.isArray(orderIds)) {
      return res.status(400).json([]);
    }
    const myOrders = await Order.find({ _id: { $in: orderIds } });
    // 최신순 정렬
    myOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(myOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true } // Return the updated document
    );
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    io.emit('orderUpdated', updatedOrder);
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
