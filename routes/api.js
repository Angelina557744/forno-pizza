const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/dishes', (req, res) => {
  const dishes = db.prepare(`
    SELECT d.*, c.slug AS category_slug
    FROM dishes d
    JOIN categories c ON c.id = d.category_id
    WHERE d.is_available = 1
  `).all();
  res.json(dishes);
});

router.get('/dishes/:slug', (req, res) => {
  const dish = db.prepare('SELECT * FROM dishes WHERE slug = ?').get(req.params.slug);
  if (!dish) return res.status(404).json({ error: 'Not found' });
  res.json(dish);
});

router.get('/toppings', (req, res) => {
  const toppings = db.prepare('SELECT * FROM toppings WHERE is_available = 1').all();
  res.json(toppings);
});

router.get('/categories', (req, res) => {
  const cats = db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
  res.json(cats);
});

router.post('/pizza-price', (req, res) => {
  const { basePrice, size, dough, toppings } = req.body;

  let price = Number(basePrice);

  const sizeMultiplier = { '25': 1, '30': 1.25, '35': 1.5 };
  price = price * (sizeMultiplier[size] || 1);

  if (dough === 'thin') price += 50;
  if (dough === 'gluten-free') price += 150;

  if (Array.isArray(toppings)) {
    for (const id of toppings) {
      const t = db.prepare('SELECT price FROM toppings WHERE id = ?').get(Number(id));
      if (t) price += t.price;
    }
  }

  res.json({ price: Math.round(price) });
});

module.exports = router;