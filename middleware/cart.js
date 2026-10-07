function cartMiddleware(req, res, next) {
  if (!req.session.cart) {
    req.session.cart = [];
  }

  req.cartCount = req.session.cart.reduce((sum, item) => sum + item.quantity, 0);
  req.cartTotal = req.session.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  res.locals.cartCount = req.cartCount;
  res.locals.cartTotal = req.cartTotal;
  res.locals.cart = req.session.cart;

  next();
}

module.exports = cartMiddleware;