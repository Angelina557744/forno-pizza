const db = require('./database');

const categories = [
  { name: 'Пицца', slug: 'pizza', sort_order: 1 },
  { name: 'Паста', slug: 'pasta', sort_order: 2 },
  { name: 'Антипасти', slug: 'antipasti', sort_order: 3 },
  { name: 'Салаты', slug: 'salads', sort_order: 4 },
  { name: 'Десерты', slug: 'desserts', sort_order: 5 },
  { name: 'Напитки', slug: 'drinks', sort_order: 6 }
];

const dishes = [
  { category: 'pizza', name: 'Маргарита', slug: 'margherita', description: 'Классика Неаполя: томаты, моцарелла, базилик', composition: 'Томатный соус, моцарелла фиор ди латте, базилик, оливковое масло', price: 590, is_pizza: 1, is_vegetarian: 1 },
  { category: 'pizza', name: 'Пепперони', slug: 'pepperoni', description: 'Острая пепперони и моцарелла', composition: 'Томатный соус, моцарелла, пепперони, орегано', price: 690, is_pizza: 1, is_spicy: 1 },
  { category: 'pizza', name: 'Диавола', slug: 'diavola', description: 'Двойная острота: пепперони и чили', composition: 'Томатный соус, моцарелла, пепперони, перец чили, орегано', price: 750, is_pizza: 1, is_spicy: 1 },
  { category: 'pizza', name: 'Кватро формаджи', slug: 'quattro-formaggi', description: 'Четыре сыра на тонком тесте', composition: 'Моцарелла, горгонзола, пармезан, фонтина', price: 790, is_pizza: 1, is_vegetarian: 1 },
  { category: 'pizza', name: 'Прошутто э рукола', slug: 'prosciutto-rucola', description: 'Сыровяленый прошутто и свежая рукола', composition: 'Томатный соус, моцарелла, прошутто, рукола, пармезан', price: 850, is_pizza: 1 },
  { category: 'pizza', name: 'Вегетариана', slug: 'vegetariana', description: 'Овощи на дровяной печи', composition: 'Томатный соус, моцарелла, кабачок, баклажан, перец, черри', price: 690, is_pizza: 1, is_vegetarian: 1 },
  { category: 'pizza', name: 'Бьянка', slug: 'bianca', description: 'Белая пицца без томатов', composition: 'Сливки, моцарелла, чеснок, тимьян, пармезан', price: 690, is_pizza: 1, is_vegetarian: 1 },
  { category: 'pizza', name: 'Тартюфо', slug: 'tartufo', description: 'С трюфельным кремом и шампиньонами', composition: 'Трюфельный крем, моцарелла, шампиньоны, пармезан, рукола', price: 890, is_pizza: 1, is_vegetarian: 1 },

  { category: 'pasta', name: 'Карбонара', slug: 'carbonara', description: 'Классическая римская паста', composition: 'Спагетти, гуанчале, яйцо, пекорино, чёрный перец', price: 690 },
  { category: 'pasta', name: 'Болоньезе', slug: 'bolognese', description: 'Паста с мясным рагу', composition: 'Тальятелле, говяжий фарш, томаты, морковь, сельдерей, пармезан', price: 720 },
  { category: 'pasta', name: 'Песто', slug: 'pesto', description: 'С соусом песто и черри', composition: 'Лингвини, песто, черри, пармезан, кедровые орехи', price: 650, is_vegetarian: 1 },
  { category: 'pasta', name: 'Четыре сыра', slug: 'pasta-quattro-formaggi', description: 'Сливочная паста с четырьмя сырами', composition: 'Феттучине, сливки, моцарелла, горгонзола, пармезан, фонтина', price: 740, is_vegetarian: 1 },

  { category: 'antipasti', name: 'Брускетта с томатами', slug: 'bruschetta', description: 'Хрустящий хлеб с томатами и базиликом', composition: 'Чиабатта, томаты, базилик, чеснок, оливковое масло', price: 320, is_vegetarian: 1 },
  { category: 'antipasti', name: 'Тартар из говядины', slug: 'tartare', description: 'Свежая говядина с каперсами', composition: 'Говядина, каперсы, лук, горчица, желток, тосты', price: 690 },
  { category: 'antipasti', name: 'Сырная тарелка', slug: 'cheese-board', description: 'Ассорти итальянских сыров', composition: 'Пармезан, горгонзола, пекорино, моцарелла, мёд, орехи', price: 790, is_vegetarian: 1 },

  { category: 'salads', name: 'Капрезе', slug: 'caprese', description: 'Томаты, моцарелла, базилик', composition: 'Томаты, моцарелла фиор ди латте, базилик, оливковое масло', price: 490, is_vegetarian: 1 },
  { category: 'salads', name: 'Руккола с пармезаном', slug: 'rucola-parmesan', description: 'Свежая рукола и пармезан', composition: 'Руккола, пармезан, черри, кедровые орехи, бальзамик', price: 450, is_vegetarian: 1 },
  { category: 'salads', name: 'Цезарь с курицей', slug: 'caesar', description: 'Классический цезарь', composition: 'Романо, курица, пармезан, гренки, соус цезарь', price: 590 },

  { category: 'desserts', name: 'Тирамису', slug: 'tiramisu', description: 'Классический итальянский десерт', composition: 'Маскарпоне, савоярди, кофе, какао', price: 390, is_vegetarian: 1 },
  { category: 'desserts', name: 'Панна котта', slug: 'panna-cotta', description: 'Сливочный десерт с ягодным соусом', composition: 'Сливки, ваниль, ягодный соус', price: 350, is_vegetarian: 1 },
  { category: 'desserts', name: 'Шоколадный фондан', slug: 'fondant', description: 'Тёплый шоколадный фондан с мороженым', composition: 'Шоколад, сливочное масло, яйцо, ванильное мороженое', price: 450, is_vegetarian: 1 },

  { category: 'drinks', name: 'Лимонад домашний', slug: 'lemonade', description: 'Свежий лимонад с мятой', composition: 'Лимон, мята, сахар, газированная вода', price: 290, is_vegetarian: 1 },
  { category: 'drinks', name: 'Эспрессо', slug: 'espresso', description: 'Двойной эспрессо', composition: 'Кофе арабика', price: 190, is_vegetarian: 1 },
  { category: 'drinks', name: 'Капучино', slug: 'cappuccino', description: 'Классический капучино', composition: 'Эспрессо, молоко', price: 250, is_vegetarian: 1 },
  { category: 'drinks', name: 'Чай', slug: 'tea', description: 'Чёрный, зелёный или травяной', composition: 'Чайный лист', price: 200, is_vegetarian: 1 }
];

const toppings = [
  { name: 'Моцарелла', price: 90, category: 'cheese' },
  { name: 'Пармезан', price: 110, category: 'cheese' },
  { name: 'Горгонзола', price: 130, category: 'cheese' },
  { name: 'Пепперони', price: 120, category: 'meat' },
  { name: 'Прошутто', price: 180, category: 'meat' },
  { name: 'Курица', price: 120, category: 'meat' },
  { name: 'Бекон', price: 130, category: 'meat' },
  { name: 'Шампиньоны', price: 90, category: 'veggies' },
  { name: 'Перец болгарский', price: 80, category: 'veggies' },
  { name: 'Черри', price: 90, category: 'veggies' },
  { name: 'Рукола', price: 90, category: 'veggies' },
  { name: 'Оливки', price: 80, category: 'veggies' },
  { name: 'Перец чили', price: 70, category: 'veggies' },
  { name: 'Трюфельный крем', price: 150, category: 'sauce' },
  { name: 'Соус барбекю', price: 70, category: 'sauce' }
];

const insertCategory = db.prepare('INSERT INTO categories (name, slug, sort_order) VALUES (?, ?, ?)');
const insertDish = db.prepare(`
  INSERT INTO dishes (category_id, name, slug, description, composition, price, is_pizza, is_vegetarian, is_spicy, is_gluten_free)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const insertTopping = db.prepare('INSERT INTO toppings (name, price, category) VALUES (?, ?, ?)');

const categoryMap = {};

const seed = db.transaction(() => {
  db.prepare('DELETE FROM order_items').run();
  db.prepare('DELETE FROM orders').run();
  db.prepare('DELETE FROM bookings').run();
  db.prepare('DELETE FROM toppings').run();
  db.prepare('DELETE FROM dishes').run();
  db.prepare('DELETE FROM categories').run();

  for (const cat of categories) {
    const result = insertCategory.run(cat.name, cat.slug, cat.sort_order);
    categoryMap[cat.slug] = result.lastInsertRowid;
  }

  for (const dish of dishes) {
    insertDish.run(
      categoryMap[dish.category],
      dish.name,
      dish.slug,
      dish.description || null,
      dish.composition || null,
      dish.price,
      dish.is_pizza || 0,
      dish.is_vegetarian || 0,
      dish.is_spicy || 0,
      dish.is_gluten_free || 0
    );
  }

  for (const t of toppings) {
    insertTopping.run(t.name, t.price, t.category);
  }
});

seed();

console.log('База заполнена');
console.log('Категорий:', categories.length);
console.log('Блюд:', dishes.length);
console.log('Топпингов:', toppings.length);

db.close();