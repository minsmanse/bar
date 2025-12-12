const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

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

const DATA_FILE = path.join(__dirname, 'db.json');

// Default Data
const defaultData = {
  ingredients: [],
  menu: [],
  orders: []
};

let db = { ...defaultData };

// Load Data
if (fs.existsSync(DATA_FILE)) {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    db = JSON.parse(data);
    console.log('Data loaded from db.json');
  } catch (err) {
    console.error('Error loading db.json:', err);
  }
} else {
  saveData(); // Create file with defaults
}

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.emit('initialData', { orders: db.orders });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Ingredients API
app.get('/api/ingredients', (req, res) => {
  res.json(db.ingredients);
});

app.post('/api/ingredients', (req, res) => {
  const newIngredient = { id: Date.now().toString(), ...req.body };
  db.ingredients.push(newIngredient);
  saveData();
  res.json(newIngredient);
});

app.delete('/api/ingredients/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = db.ingredients.length;
  db.ingredients = db.ingredients.filter(ing => ing.id !== id);
  
  if (db.ingredients.length < initialLength) {
    saveData();
    res.json({ message: 'Ingredient deleted' });
  } else {
    res.status(404).json({ message: 'Ingredient not found' });
  }
});

// Menu API
app.get('/api/menu', (req, res) => {
  res.json(db.menu);
});

app.post('/api/menu', (req, res) => {
  const newMenu = { id: Date.now().toString(), ...req.body };
  db.menu.push(newMenu);
  saveData();
  res.json(newMenu);
});

// Orders API
app.get('/api/orders', (req, res) => {
  res.json(db.orders);
});

app.post('/api/orders', (req, res) => {
  const newOrder = { 
    id: Date.now().toString(), 
    status: 'pending', 
    createdAt: new Date(),
    ...req.body 
  };
  db.orders.push(newOrder);
  saveData();
  io.emit('newOrder', newOrder);
  res.json(newOrder);
});

app.post('/api/orders/batch', (req, res) => {
  const { orderIds } = req.body;
  if (!Array.isArray(orderIds)) return res.status(400).json([]);
  const myOrders = db.orders.filter(o => orderIds.includes(o.id));
  // 최신순 정렬
  myOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(myOrders);
});

app.put('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = db.orders.find(o => o.id === id);
  if (order) {
    order.status = status;
    saveData();
    io.emit('orderUpdated', order);
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});