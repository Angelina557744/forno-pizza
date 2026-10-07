(function () {
  const builder = document.querySelector('[data-pizza-builder]');
  if (!builder) return;

  const basePrice = Number(builder.dataset.basePrice);
  const dishId = Number(builder.dataset.dishId);
  const dishName = builder.dataset.dishName;
  const dishImage = builder.dataset.dishImage || null;

  const sizeInputs = builder.querySelectorAll('input[name="pizza-size"]');
  const doughInputs = builder.querySelectorAll('input[name="pizza-dough"]');
  const toppingInputs = builder.querySelectorAll('input[name="pizza-topping"]');
  const priceEl = builder.querySelector('[data-pizza-price]');
  const addBtn = builder.querySelector('[data-pizza-add]');

  let currentPrice = basePrice;

  function getSelected(inputs) {
    return Array.from(inputs).find(i => i.checked);
  }

  function getSelectedToppings() {
    return Array.from(toppingInputs).filter(i => i.checked);
  }

  function updatePrice() {
    const size = getSelected(sizeInputs);
    const dough = getSelected(doughInputs);
    const toppings = getSelectedToppings();

    const sizeMultiplier = { '25': 1, '30': 1.25, '35': 1.5 };
    let price = basePrice * (sizeMultiplier[size ? size.value : '25'] || 1);

    if (dough) {
      if (dough.value === 'thin') price += 50;
      if (dough.value === 'gluten-free') price += 150;
    }

    toppings.forEach(t => {
      price += Number(t.dataset.price);
    });

    currentPrice = Math.round(price);
    priceEl.textContent = currentPrice + ' ₽';

    priceEl.animate([
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1.15)', opacity: 0.7 },
      { transform: 'scale(1)', opacity: 1 }
    ], { duration: 260, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
  }

  sizeInputs.forEach(i => i.addEventListener('change', updatePrice));
  doughInputs.forEach(i => i.addEventListener('change', updatePrice));
  toppingInputs.forEach(i => i.addEventListener('change', updatePrice));



  updatePrice();
})();