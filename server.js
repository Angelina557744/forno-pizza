require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const cartMiddleware = require('./middleware/cart');

const indexRouter = require('./routes/index');
const menuRouter = require('./routes/menu');
const cartRouter = require('./routes/cart');
const checkoutRouter = require('./routes/checkout');
const bookingRouter = require('./routes/booking');
const apiRouter = require('./routes/api');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

const expressLayouts = require('express-ejs-layouts');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));

app.use(cartMiddleware);

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.isAdmin = req.session.isAdmin || false;
  next();
});

app.use('/', indexRouter);
app.use('/menu', menuRouter);
app.use('/cart', cartRouter);
app.use('/checkout', checkoutRouter);
app.use('/booking', bookingRouter);
app.use('/api', apiRouter);
app.use('/admin', adminRouter);

app.use((req, res) => {
  res.status(404).render('pages/404', { title: 'Страница не найдена' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('pages/500', { title: 'Ошибка сервера' });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});