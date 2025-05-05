require('dotenv').config(); // Завантажуємо змінні середовища з .env файлу
const express = require('express'); // Імпорт бібліотеки Express
const cors = require('cors'); // Імпорт бібліотеки CORS для обробки крос-доменної політики
const productsRoutes = require('./routes/productsRoutes'); // Імпорт маршруту для продуктів
const receivedItemsRoutes = require('./routes/receivedItemsRoutes'); // Імпорт маршруту для отриманих товарів
const usersRoutes = require('./routes/usersRoutes'); // Імпорт маршруту для користувачів
const authRoutes = require('./routes/authRoutes'); // Маршрут для авторизації
const storageLocationRoutes = require('./routes/storageLocationRoutes');
const placedItemsRoutes = require('./routes/placedItemsRoutes'); // Імпорт маршруту для розміщених товарів
const clientsRoutes = require('./routes/clientsRoutes'); // Імпорт маршруту для клієнтів
const loginClientRoutes = require('./routes/loginClientRoutes'); // Імпорт маршруту для логіну клієнта
const ordersRoutes = require('./routes/ordersRoutes'); // Імпорт маршруту для замовлень
const pickItemRoutes = require('./routes/pickItemRoutes'); // Імпорт маршруту для вибору товару
const checkItemRoutes = require('./routes/checkItemRoutes'); // Імпорт маршруту для перевірки товару
const shippedItemRoutes = require('./routes/shippedItemRoutes'); // Імпорт маршруту для відправлених товарів

const app = express(); // Створюємо екземпляр Express

app.use(cors()); // Додаємо CORS middleware для обробки крос-доменної політики
app.use(express.json()); // Додаємо middleware для парсингу JSON

app.use('/products', productsRoutes); // Додаємо маршрут для продуктів
app.use('/received-items', receivedItemsRoutes); // Додаємо маршрут для отриманих товарів
app.use('/users', usersRoutes); // Додаємо маршрут для користувачів
app.use('/storage-locations', storageLocationRoutes); // Додаємо маршрут для місць зберігання
app.use('/placed-items', placedItemsRoutes);
app.use('/clients', clientsRoutes); // Додаємо маршрут для клієнтів
app.use('/orders', ordersRoutes); // Додаємо маршрут для замовлень
app.use('/pick-item', pickItemRoutes); // Додаємо маршрут для вибору товару
app.use('/check-item', checkItemRoutes); // Додаємо маршрут для перевірки товару
app.use('/ship-item', shippedItemRoutes); // Додаємо маршрут для відправлених товарів

// Маршрут для авторизації
app.use('/auth', authRoutes); // Додаємо маршрут для авторизації

app.use('/login-client', loginClientRoutes); // Додаємо маршрут для логіну клієнта

// Запуск сервера
const PORT = process.env.PORT || 3000; // Визначаємо порт для сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер працює на http://localhost:${PORT}`);
});
