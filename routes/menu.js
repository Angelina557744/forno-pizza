const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all();

  const dishes = db.prepare(`
    SELECT d.*, c.slug AS category_slug, c.name AS category_name
    FROM dishes d
    JOIN categories c ON c.id = d.category_id
    WHERE d.is_available = 1
    ORDER BY c.sort_order ASC, d.id ASC
  `).all();

  const filter = req.query.filter || null;

  let filtered = dishes;
  if (filter === 'vegetarian') filtered = dishes.filter(d => d.is_vegetarian);
  if (filter === 'spicy') filtered = dishes.filter(d => d.is_spicy);
  if (filter === 'gluten-free') filtered = dishes.filter(d => d.is_gluten_free);

  res.render('pages/menu', {
    title: 'Меню — Forno',
    categories,
    dishes: filtered,
    filter,
    allDishes: dishes
  });
});

router.get('/:slug', (req, res) => {
  const dish = db.prepare(`
    SELECT d.*, c.slug AS category_slug, c.name AS category_name
    FROM dishes d
    JOIN categories c ON c.id = d.category_id
    WHERE d.slug = ? AND d.is_available = 1
  `).get(req.params.slug);

  if (!dish) {
    return res.status(404).render('pages/404', { title: 'Блюдо не найдено' });
  }

  let toppings = [];
  if (dish.is_pizza) {
    toppings = db.prepare('SELECT * FROM toppings WHERE is_available = 1 ORDER BY category, id').all();
  }

  const similar = db.prepare(`
    SELECT d.*, c.slug AS category_slug
    FROM dishes d
    JOIN categories c ON c.id = d.category_id
    WHERE d.category_id = ? AND d.id != ? AND d.is_available = 1
    LIMIT 3
  `).all(dish.category_id, dish.id);

  res.render('pages/dish', {
    title: `${dish.name} — Forno`,
    dish,
    toppings,
    similar
  });
});

module.exports = router;