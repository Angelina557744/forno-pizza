const express = require('express');
const router = express.Router();
const db = require('../db/database');

router.get('/', (req, res) => {
  res.render('pages/booking', { title: 'Бронирование столика — Forno' });
});

router.post('/', (req, res) => {
  const { name, phone, date, time, guests, comment } = req.body;

  const errors = [];

  if (!name || name.trim().length < 2) errors.push('Введите имя');
  if (!phone || phone.replace(/\D/g, '').length < 10) errors.push('Введите корректный телефон');
  if (!date) errors.push('Укажите дату');
  if (!time) errors.push('Укажите время');
  if (!guests) errors.push('Укажите количество гостей');

  if (date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDate = new Date(date);
    if (bookingDate < today) errors.push('Дата не может быть в прошлом');
  }

  if (time && (time < '12:00' || time > '22:00')) {
    errors.push('Время брони с 12:00 до 22:00');
  }

  if (errors.length) {
    return res.render('pages/booking', {
      title: 'Бронирование столика — Forno',
      error: errors.join('. ')
    });
  }

  db.prepare(`
    INSERT INTO bookings (name, phone, date, time, guests, comment, status)
    VALUES (?, ?, ?, ?, ?, ?, 'new')
  `).run(name.trim(), phone.trim(), date, time, Number(guests), (comment || '').trim() || null);

  res.render('pages/booking', {
    title: 'Бронирование столика — Forno',
    success: true
  });
});

module.exports = router;