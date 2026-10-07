const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db/database');
const { requireAdmin } = require('../middleware/auth');

router.get('/login', (req, res) => {
  if (req.session.isAdmin) return res.redirect('/admin');
  res.render('admin/login', { title: 'Вход — Админ', error: null });
});

router.post('/login', async (req, res) => {
  const { login, password } = req.body;

  const loginOk = login === process.env.ADMIN_LOGIN;
  const passOk = loginOk && await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);

  if (!loginOk || !passOk) {
    return res.render('admin/login', {
      title: 'Вход — Админ',
      error: 'Неверный логин или пароль'
    });
  }

  req.session.isAdmin = true;
  res.redirect('/admin');
});

router.get('/logout', (req, res) => {
  req.session.isAdmin = false;
  res.redirect('/admin/login');
});

router.get('/', requireAdmin, (req, res) => {
  const ordersCount = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
  const newOrders = db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'new'").get().c;
  const bookingsCount = db.prepare('SELECT COUNT(*) as c FROM bookings').get().c;
  const newBookings = db.prepare("SELECT COUNT(*) as c FROM bookings WHERE status = 'new'").get().c;
  const dishesCount = db.prepare('SELECT COUNT(*) as c FROM dishes').get().c;
  const revenue = db.prepare("SELECT COALESCE(SUM(total), 0) as s FROM orders WHERE status != 'cancelled'").get().s;

  const recentOrders = db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 5').all();

  res.render('admin/dashboard', {
    title: 'Панель управления',
    ordersCount,
    newOrders,
    bookingsCount,
    newBookings,
    dishesCount,
    revenue,
    recentOrders
  });
});

router.get('/orders', requireAdmin, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY id DESC').all();
  res.render('admin/orders', { title: 'Заказы', orders });
});

router.get('/orders/:id', requireAdmin, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.redirect('/admin/orders');
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  res.render('admin/order-view', { title: `Заказ ${order.order_number}`, order, items });
});

router.post('/orders/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.redirect(`/admin/orders/${req.params.id}`);
});

router.get('/bookings', requireAdmin, (req, res) => {
  const bookings = db.prepare('SELECT * FROM bookings ORDER BY id DESC').all();
  res.render('admin/bookings', { title: 'Бронирования', bookings });
});

router.post('/bookings/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, req.params.id);
  res.redirect('/admin/bookings');
});

router.get('/dishes', requireAdmin, (req, res) => {
  const dishes = db.prepare(`
    SELECT d.*, c.name AS category_name
    FROM dishes d
    JOIN categories c ON c.id = d.category_id
    ORDER BY c.sort_order, d.id
  `).all();
  res.render('admin/dishes', { title: 'Блюда', dishes });
});

router.get('/dishes/:id/edit', requireAdmin, (req, res) => {
  const dish = db.prepare('SELECT * FROM dishes WHERE id = ?').get(req.params.id);
  if (!dish) return res.redirect('/admin/dishes');
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
  res.render('admin/dish-edit', { title: 'Редактирование блюда', dish, categories });
});

router.post('/dishes/:id/edit', requireAdmin, (req, res) => {
  const { name, description, composition, price, is_available, is_vegetarian, is_spicy, is_gluten_free } = req.body;

  db.prepare(`
    UPDATE dishes SET name = ?, description = ?, composition = ?, price = ?,
      is_available = ?, is_vegetarian = ?, is_spicy = ?, is_gluten_free = ?
    WHERE id = ?
  `).run(
    name,
    description || null,
    composition || null,
    Number(price),
    is_available ? 1 : 0,
    is_vegetarian ? 1 : 0,
    is_spicy ? 1 : 0,
    is_gluten_free ? 1 : 0,
    req.params.id
  );

  res.redirect('/admin/dishes');
});

router.get('/categories', requireAdmin, (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
  res.render('admin/categories', { title: 'Категории', categories });
});

module.exports = router;