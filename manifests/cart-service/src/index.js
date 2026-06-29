const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();

app.use(cors());
app.use(express.json());

// In-memory cart store (Redis in Phase 2)
const carts = {};

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'cart-service' }));

// Get cart by session ID
app.get('/cart/:sessionId', (req, res) => {
  const cart = carts[req.params.sessionId] || { items: [], total: 0 };
  res.json(cart);
});

// Add item to cart
app.post('/cart/:sessionId/items', (req, res) => {
  const { sessionId } = req.params;
  const { productId, name, price, quantity = 1 } = req.body;

  if (!carts[sessionId]) carts[sessionId] = { items: [], total: 0 };
  const cart = carts[sessionId];

  const existing = cart.items.find(i => i.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ productId, name, price, quantity });
  }
  cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  res.json(cart);
});

// Remove item from cart
app.delete('/cart/:sessionId/items/:productId', (req, res) => {
  const { sessionId, productId } = req.params;
  if (!carts[sessionId]) return res.status(404).json({ error: 'Cart not found' });

  const cart = carts[sessionId];
  cart.items = cart.items.filter(i => i.productId !== parseInt(productId));
  cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  res.json(cart);
});

// Clear cart
app.delete('/cart/:sessionId', (req, res) => {
  delete carts[req.params.sessionId];
  res.json({ message: 'Cart cleared' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, '0.0.0.0', () => console.log(`Cart service running on port ${PORT}`));
