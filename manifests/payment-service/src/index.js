const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());

// In-memory order store (PostgreSQL in Phase 2)
const orders = [];

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'payment-service' }));

app.get('/orders', (req, res) => res.json(orders));

// Process payment (Stripe mock)
app.post('/payments/process', async (req, res) => {
  const { sessionId, cardNumber, amount, customerEmail } = req.body;

  if (!sessionId || !amount || !customerEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Simulate payment processing (mock Stripe logic)
  // Card ending in 0000 = decline, everything else = success
  const last4 = cardNumber?.slice(-4);
  const success = last4 !== '0000';

  if (!success) {
    return res.status(402).json({ error: 'Payment declined', code: 'card_declined' });
  }

  const order = {
    orderId:       uuidv4(),
    sessionId,
    amount:        parseFloat(amount).toFixed(2),
    customerEmail,
    status:        'paid',
    last4:         last4 || '4242',
    createdAt:     new Date().toISOString(),
  };
  orders.push(order);

  // Fire event to notification service (async, non-blocking)
  const notifyUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004';
  axios.post(`${notifyUrl}/notify`, {
    email:   customerEmail,
    orderId: order.orderId,
    amount:  order.amount,
  }).catch(err => console.warn('Notification service unreachable:', err.message));

  res.status(201).json({ success: true, order });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, '0.0.0.0', () => console.log(`Payment service running on port ${PORT}`));