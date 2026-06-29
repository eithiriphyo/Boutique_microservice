const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// In-memory products (no DB needed for Phase 1)
const products = [
  { id: 1, name: 'Wireless Headphones', price: 79.99, stock: 50, image: '🎧' },
  { id: 2, name: 'Mechanical Keyboard', price: 129.99, stock: 30, image: '⌨️' },
  { id: 3, name: 'USB-C Hub',           price: 49.99,  stock: 100, image: '🔌' },
  { id: 4, name: 'Webcam HD',           price: 89.99,  stock: 20, image: '📷' },
  { id: 5, name: 'Desk Lamp LED',       price: 34.99,  stock: 75, image: '💡' },
];

app.get('/health',        (req, res) => res.json({ status: 'ok', service: 'product-service' }));
app.get('/products',      (req, res) => res.json(products));
app.get('/products/:id',  (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => console.log(`Product service running on port ${PORT}`));// pipeline test
