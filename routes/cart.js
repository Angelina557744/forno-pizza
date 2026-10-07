const express = require('express');
const router = express.Router();


router.get('/state', (req, res) => {
  const cart = req.session.cart || [];
  const count = cart.reduce((s, i) => s + i.quantity, 0);
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  res.json({ cart, cartCount: count, cartTotal: total });
});

router.get('/', (req, res) => {
  res.render('pages/cart', { title: 'Корзина — Forno' });
});

router.post('/add', (req, res) => {
  const { id, name, price, quantity, size, dough, toppings, image } = req.body;

  if (!req.session.cart) req.session.cart = [];

  const key = `${id}-${size || ''}-${dough || ''}-${(toppings || []).join(',')}`;

  const existing = req.session.cart.find(item => item.key === key);

  if (existing) {
    existing.quantity += Number(quantity) || 1;
  } else {
    req.session.cart.push({
      key,
      id: Number(id),
      name,
      price: Number(price),
      quantity: Number(quantity) || 1,
      size: size || null,
      dough: dough || null,
      toppings: toppings || [],
      image: image || null
    });
  }

  res.json({
    success: true,
    cartCount: req.session.cart.reduce((s, i) => s + i.quantity, 0),
    cartTotal: req.session.cart.reduce((s, i) => s + i.price * i.quantity, 0)
  });
});

router.post('/update', (req, res) => {
  const { key, quantity } = req.body;
  if (!req.session.cart) req.session.cart = [];

  const item = req.session.cart.find(i => i.key === key);
  if (item) {
    const q = Number(quantity);
    if (q <= 0) {
      req.session.cart = req.session.cart.filter(i => i.key !== key);
    } else {
      item.quantity = q;
    }
  }

  res.json({
    success: true,
    cartCount: req.session.cart.reduce((s, i) => s + i.quantity, 0),
    cartTotal: req.session.cart.reduce((s, i) => s + i.price * i.quantity, 0)
  });
});

router.post('/remove', (req, res) => {
  const { key } = req.body;
  if (!req.session.cart) req.session.cart = [];
  req.session.cart = req.session.cart.filter(i => i.key !== key);

  res.json({
    success: true,
    cartCount: req.session.cart.reduce((s, i) => s + i.quantity, 0),
    cartTotal: req.session.cart.reduce((s, i) => s + i.price * i.quantity, 0)
  });
});

router.post('/clear', (req, res) => {
  req.session.cart = [];
  res.json({ success: true });
});

module.exports = router;