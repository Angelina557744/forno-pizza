const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/', (req, res) => {
  if (!req.session.cart || req.session.cart.length === 0) {
    return res.redirect('/cart');
  }
  res.render('pages/checkout', { title: 'Оформление заказа — Forno' });
});

router.post('/', (req, res) => {
  const cart = req.session.cart || [];
  if (cart.length === 0) {
    return res.redirect('/cart');
  }

  const {
    customer_name,
    customer_phone,
    customer_email,
    delivery_type,
    address,
    comment,
    payment_method
  } = req.body;

  if (!customer_name || !customer_phone || !delivery_type || !payment_method) {
    return res.redirect('/checkout');
  }

  if (delivery_type === 'delivery' && !address) {
    return res.redirect('/checkout');
  }

  const deliveryPrice = delivery_type === 'delivery' ? 200 : 0;
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0) + deliveryPrice;

  const orderNumber = 'F-' + Date.now().toString().slice(-6);

  const insertOrder = db.prepare(`
    INSERT INTO orders (order_number, customer_name, customer_phone, customer_email,
      delivery_type, address, comment, payment_method, total, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')
  `);

  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, dish_id, dish_name, size, dough, toppings, price, quantity)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const createOrder = db.transaction(() => {
    const result = insertOrder.run(
      orderNumber,
      customer_name,
      customer_phone,
      customer_email || null,
      delivery_type,
      address || null,
      comment || null,
      payment_method,
      total
    );

    const orderId = result.lastInsertRowid;

    for (const item of cart) {
      insertItem.run(
        orderId,
        item.id,
        item.name,
        item.size || null,
        item.dough || null,
        (item.toppings || []).join(', ') || null,
        item.price,
        item.quantity
      );
    }

    return orderId;
  });

  const orderId = createOrder();

  req.session.cart = [];
  req.session.lastOrderId = orderId;

  res.redirect('/checkout/success');
});

router.get('/success', (req, res) => {
  const orderId = req.session.lastOrderId;

  if (!orderId) {
    return res.redirect('/');
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

  res.render('pages/order-success', {
    title: 'Заказ оформлен — Forno',
    order,
    items
  });
});

module.exports = router;