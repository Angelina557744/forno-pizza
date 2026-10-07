(function () {
  const drawer = document.querySelector('[data-cart-drawer]');
  const openBtns = document.querySelectorAll('[data-cart-open]');
  const closeBtns = document.querySelectorAll('[data-cart-close]');
  const countEls = document.querySelectorAll('[data-cart-count]');
  const totalEls = document.querySelectorAll('[data-cart-total]');
  const body = document.querySelector('[data-cart-body]');

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
  }

  openBtns.forEach(btn => btn.addEventListener('click', openDrawer));
  closeBtns.forEach(btn => btn.addEventListener('click', closeDrawer));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  function formatCount(n) {
    if (n > 99) return '99+';
    return String(n);
  }

  function updateHeader(data) {
    countEls.forEach(el => {
      el.textContent = formatCount(data.cartCount);
      el.classList.add('is-bump');
      setTimeout(() => el.classList.remove('is-bump'), 300);
    });
    totalEls.forEach(el => {
      el.textContent = data.cartTotal + ' ₽';
    });
  }

  function fetchCart() {
    return fetch('/cart/state')
      .then(r => r.json())
      .catch(() => null);
  }

  function renderCart(items) {
    if (!body) return;

    if (!items || items.length === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 60 60" fill="none" aria-hidden="true">
            <circle cx="30" cy="30" r="24" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 4"/>
            <path d="M20 30h20M30 20v20" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          <p>Корзина пока пуста</p>
          <a href="/menu" class="btn btn--ghost">Перейти в меню</a>
        </div>`;
      return;
    }

    body.innerHTML = items.map(item => `
      <div class="cart-item" data-cart-item="${item.key}">
        <div class="cart-item__body">
          <div class="cart-item__name">${item.name}</div>
          ${(item.size || item.dough || (item.toppings && item.toppings.length)) ? `
            <div class="cart-item__meta">
              ${item.size ? `<span>${item.size} см</span>` : ''}
              ${item.dough ? `<span>${item.dough}</span>` : ''}
              ${item.toppings && item.toppings.length ? `<span>+ ${item.toppings.length}</span>` : ''}
            </div>
          ` : ''}
          <div class="cart-item__price">${item.price * item.quantity} ₽</div>
        </div>
        <div class="cart-item__qty">
          <button type="button" data-cart-dec>−</button>
          <span data-cart-qty>${item.quantity}</span>
          <button type="button" data-cart-inc>+</button>
        </div>
        <button class="cart-item__remove" type="button" data-cart-remove aria-label="Удалить">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    `).join('');
  }

  function updateItem(key, quantity) {
    fetch('/cart/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, quantity })
    })
      .then(r => r.json())
      .then(data => {
        updateHeader(data);
        return fetchCart();
      })
      .then(data => {
        if (data) {
          renderCart(data.cart);
          updateHeader(data);
        }
      });
  }

  function removeItem(key) {
    fetch('/cart/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key })
    })
      .then(r => r.json())
      .then(data => {
        updateHeader(data);
        return fetchCart();
      })
      .then(data => {
        if (data) {
          renderCart(data.cart);
          updateHeader(data);
        }
      });
  }

  function clearCart() {
    fetch('/cart/clear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(r => r.json())
      .then(() => {
        updateHeader({ cartCount: 0, cartTotal: 0 });
        renderCart([]);
      });
  }

  function addToCart(payload) {
    return fetch('/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
          return null;
        }
        updateHeader(data);
        openDrawer();
        return fetchCart();
      })
      .then(data => {
        if (data) renderCart(data.cart);
      });
  }

  window.addToCart = addToCart;

  document.addEventListener('click', (e) => {
    const simpleBtn = e.target.closest('[data-add-simple]');
    if (simpleBtn) {
      e.preventDefault();
      const id = Number(simpleBtn.dataset.id);
      const name = simpleBtn.dataset.name;
      const price = Number(simpleBtn.dataset.price);

      if (!id || !name || !price) {
        alert('Не удалось добавить товар. Обновите страницу.');
        return;
      }

      addToCart({ id, name, price, quantity: 1, size: null, dough: null, toppings: [] });
      return;
    }

    const pizzaBtn = e.target.closest('[data-pizza-add]');
    if (pizzaBtn) {
      e.preventDefault();
      const builder = pizzaBtn.closest('[data-pizza-builder]');
      if (!builder) return;

      const dishId = Number(builder.dataset.dishId);
      const dishName = builder.dataset.dishName;
      const dishImage = builder.dataset.dishImage || null;

      const sizeInput = builder.querySelector('input[name="pizza-size"]:checked');
      const doughInput = builder.querySelector('input[name="pizza-dough"]:checked');
      const toppingInputs = builder.querySelectorAll('input[name="pizza-topping"]:checked');

      const basePrice = Number(builder.dataset.basePrice);
      const sizeMultiplier = { '25': 1, '30': 1.25, '35': 1.5 };
      let price = basePrice * (sizeMultiplier[sizeInput ? sizeInput.value : '25'] || 1);

      if (doughInput) {
        if (doughInput.value === 'thin') price += 50;
        if (doughInput.value === 'gluten-free') price += 150;
      }

      const toppingNames = [];
      toppingInputs.forEach(t => {
        price += Number(t.dataset.price);
        toppingNames.push(t.dataset.name);
      });

      addToCart({
        id: dishId,
        name: dishName,
        price: Math.round(price),
        quantity: 1,
        size: sizeInput ? sizeInput.value : '25',
        dough: doughInput ? doughInput.dataset.label : 'Классическое',
        toppings: toppingNames,
        image: dishImage
      });
      return;
    }

    const incBtn = e.target.closest('[data-cart-inc]');
    if (incBtn) {
      e.preventDefault();
      const item = incBtn.closest('[data-cart-item]');
      const qtyEl = item.querySelector('[data-cart-qty]');
      updateItem(item.dataset.cartItem, Number(qtyEl.textContent) + 1);
      return;
    }

    const decBtn = e.target.closest('[data-cart-dec]');
    if (decBtn) {
      e.preventDefault();
      const item = decBtn.closest('[data-cart-item]');
      const qtyEl = item.querySelector('[data-cart-qty]');
      const newQty = Number(qtyEl.textContent) - 1;
      if (newQty <= 0) {
        removeItem(item.dataset.cartItem);
      } else {
        updateItem(item.dataset.cartItem, newQty);
      }
      return;
    }

    const removeBtn = e.target.closest('[data-cart-remove]');
    if (removeBtn) {
      e.preventDefault();
      const item = removeBtn.closest('[data-cart-item]');
      if (item) removeItem(item.dataset.cartItem);
      return;
    }

    const clearBtn = e.target.closest('[data-cart-clear]');
    if (clearBtn) {
      e.preventDefault();
      if (confirm('Очистить корзину?')) clearCart();
      return;
    }
  });

  if (drawer) {
    fetchCart().then(data => {
      if (data) {
        renderCart(data.cart);
        updateHeader(data);
      }
    });
  }
})();