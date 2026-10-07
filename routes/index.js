const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/', (req, res) => {
  const hits = db.prepare(`
    SELECT d.*, c.slug AS category_slug, c.name AS category_name
    FROM dishes d
    JOIN categories c ON c.id = d.category_id
    WHERE d.is_available = 1
    ORDER BY d.id ASC
    LIMIT 6
  `).all();

  const reviews = [
    { name: 'Анна', text: 'Лучшая пицца в городе. Тесто тонкое, начинка свежая. Заказываем каждую пятницу.', rating: 5 },
    { name: 'Дмитрий', text: 'Атмосфера как в Неаполе. Печь на дровах, всё видно. Пицца готова за 5 минут.', rating: 5 },
    { name: 'Мария', text: 'Ходим всей семьёй. Дети обожают Маргариту, а я беру Тартюфо. Отличное место.', rating: 5 }
  ];

  res.render('pages/index', {
    title: 'Forno — дровяная пиццерия',
    hits,
    reviews
  });
});

router.get('/about', (req, res) => {
  res.render('pages/about', { title: 'О ресторане — Forno' });
});

router.get('/contacts', (req, res) => {
  res.render('pages/contacts', { title: 'Контакты — Forno' });
});

router.get('/delivery', (req, res) => {
  res.render('pages/delivery', { title: 'Доставка и оплата — Forno' });
});

module.exports = router;