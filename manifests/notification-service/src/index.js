const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Notification log (in real life, this sends email via Nodemailer/SendGrid)
const notifications = [];

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'notification-service' }));

app.get('/notifications', (req, res) => res.json(notifications));

app.post('/notify', (req, res) => {
  const { email, orderId, amount } = req.body;

  if (!email || !orderId) {
    return res.status(400).json({ error: 'email and orderId required' });
  }

  const notification = {
    id:        notifications.length + 1,
    email,
    orderId,
    amount,
    message:   `Order ${orderId} confirmed! Total: $${amount}`,
    sentAt:    new Date().toISOString(),
    status:    'sent', // would be real email in Phase 3
  };

  notifications.push(notification);
  console.log(`📧 Notification sent to ${email} for order ${orderId}`);
  res.status(201).json({ success: true, notification });
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, '0.0.0.0', () => console.log(`Notification service running on port ${PORT}`));
