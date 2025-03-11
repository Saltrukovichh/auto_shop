const express = require('express');
const pool = require('./db');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const router = require('express').Router();

const app = express();
const PORT = 5001;
app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Для обработки preflight-запросов
app.options('*', cors(corsOptions));
app.use(express.json()); // Для обработки JSON-запросов

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Извлекаем токен из заголовка

  if (!token) return res.status(401).send("Токен отсутствует");

  jwt.verify(token, 'secret_key', (err, user) => {
    if (err) return res.status(403).send("Неверный токен");
    req.user = user;
    next();
  });
};

app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, email, phone_number, created_at FROM users WHERE id = $1', [req.user.userId]);
    if (result.rows.length === 0) return res.status(404).send("Пользователь не найден");

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка при получении данных пользователя:", err.message);
    res.status(500).send("Ошибка сервера");
  }
});


// Регистрация
app.post('/api/register', async (req, res) => {
  const { username, email, password, phone_number } = req.body; // Добавили phone_number

  try {
    // Проверяем, что все поля заполнены
    if (!username || !email || !password || !phone_number) {
      return res.status(400).send('Все поля обязательны для заполнения');
    }

    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Вставляем пользователя в базу данных
    await pool.query(
      'INSERT INTO users (username, email, password_hash, phone_number) VALUES ($1, $2, $3, $4)', // Добавили phone_number
      [username, email, hashedPassword, phone_number]
    );

    res.status(201).send('Пользователь успешно зарегистрирован');
  } catch (err) {
    console.error("Ошибка при регистрации:", err.message);

    // Если ошибка связана с уникальными ограничениями
    if (err.code === '23505') {
      res.status(409).send('Email, имя пользователя или номер телефона уже заняты');
    } else {
      res.status(500).send('Ошибка сервера');
    }
  }
});

// Авторизация
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Ищем пользователя по email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).send('Пользователь не найден');
    }

    const user = result.rows[0];

    // Сравниваем пароли
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).send('Неправильный пароль');
    }

    // Генерируем JWT

    const token = jwt.sign(
      { 
        userId: user.id, 
        isAdmin: user.is_admin 
      }, 
      'secret_key', 
      { expiresIn: '1h' }
    );

    res.json({ 
      token, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.is_admin
      }
    });
  } catch (err) {
    console.error("Ошибка при авторизации:", err.message);
    res.status(500).send('Ошибка сервера');
  }
});
// Получение всех марок
app.get('/api/brands', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM brands');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка сервера');
  }
});

// Получение моделей по id марки
app.get('/api/brands/:brandId', async (req, res) => {
  const { brandId } = req.params; // Извлекаем brandId из параметров пути

  // Проверяем, что brandId существует и является числом
  if (!brandId || isNaN(brandId)) {
    return res.status(400).json({ error: 'Неверный brandId' });
  }

  try {
    const result = await pool.query('SELECT * FROM models WHERE brand_id = $1', [brandId]);
    res.json(result.rows); // Возвращаем массив моделей
  } catch (err) {
    console.error("Ошибка при выполнении запроса:", err.message);
    res.status(500).json({ error: 'Ошибка сервера', details: err.message });
  }
});


// Получение двигателей по id модели
app.get('/api/models/:modelId/engines', async (req, res) => {
  const { modelId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM engines WHERE model_id = $1', [modelId]);
    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при получении двигателей:", err.message);
    res.status(500).send('Ошибка сервера');
  }
});


// Получение продуктов по id двигателя
app.get("/api/engines/:engineId/products", async (req, res) => {
  const { engineId } = req.params;
  try {
    const result = await pool.query(
      "SELECT id, title, price, image_url, download_link FROM products WHERE engine_id = $1",
      [engineId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при получении товаров:", err.message);
    res.status(500).send("Ошибка сервера");
  }
});

app.get("/api/products", async (req, res) => {
  const { search } = req.query;
  try {
    let query = "SELECT * FROM products";
    const params = [];

    if (search) {
      query += " WHERE title LIKE $1";
      params.push(`%${search}%`);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Ошибка сервера");
  }
});

const verificationCodes = {};
//rshh ahcx hgip fvua
// Функция для отправки email
const sendVerificationEmail = async (email, code) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "batushka526@gmail.com", // Укажите ваш email
        pass: "rshh ahcx hgip fvua" // Сгенерируйте "пароль приложения" в Google
      },
      tls: {
        rejectUnauthorized: false
      }
    });


    const mailOptions = {
      from: "batushka526@gmail.com",
      to: email,
      subject: "Код подтверждения",
      text: `Ваш код подтверждения: ${code}`,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email отправлен успешно");
  } catch (error) {
    console.error("Ошибка при отправке email:", error.message);
  }
};

// Эндпоинт для отправки кода подтверждения
app.post("/api/send-verification-code", (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).send("Email обязателен");

  const code = Math.floor(100000 + Math.random() * 900000);
  verificationCodes[email] = code;

  console.log("Новый код отправлен:", code);

  sendVerificationEmail(email, code);
  res.status(200).send("Код подтверждения отправлен");
});
// Эндпоинт для проверки кода
app.post("/api/verify-code", (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).send("Email и код обязательны");
  }

  console.log("Код в базе:", verificationCodes[email], "Код введен:", code);

  if (String(verificationCodes[email]) === String(code)) { // Приводим к строкам
    delete verificationCodes[email]; // Удаляем код после успешного ввода
    console.log("Код удален")
    res.status(200).send("Код подтвержден");
  } else {
    res.status(400).send("Неверный код");
  }
});
app.post('/api/check-user', async (req, res) => {
  const { email, phoneNumber } = req.body;
  
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR phone_number = $2',
      [email, phoneNumber]
    );

    if (result.rows.length > 0) {
      return res.status(409).send("Пользователь уже существует");
    }
    res.status(200).send("OK");
  } catch (err) {
    console.error("Ошибка проверки пользователя:", err);
    res.status(500).send("Ошибка сервера");
  }
});

//админские дела
const requireAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).send('Требуется авторизация');
  }

  try {
    const decoded = jwt.verify(token, 'secret_key');
    if (!decoded.isAdmin) {
      return res.status(403).send('Доступ запрещен');
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).send('Недействительный токен');
  }
};

// Получение списка всех пользователей
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, created_at, phone_number, is_admin FROM users'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

// Обновление прав пользователя
app.put('/api/admin/users/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { isAdmin } = req.body;

  try {
    await pool.query(
      'UPDATE users SET is_admin = $1 WHERE id = $2',
      [isAdmin, id]
    );
    res.send('Права обновлены');
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

// API для создания заказа
app.post("/api/orders", async (req, res) => {
  const { userId, email, phone_number, cartItems, totalAmount } = req.body;

  console.log("📩 Пришел запрос на создание заказа:", req.body);

  try {
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Корзина пуста" });
    }

    // Формируем JSON-структуру товаров
    const products = cartItems.map(({ id, title, price, quantity, download_link }) => ({
      id,
      title,
      price,
      quantity,
      download_link,
    }));

    // Если userId пустой, создаем заказ без привязки к пользователю
    const result = await pool.query(
      `INSERT INTO orders (user_id, email, phone_number, products, total_amount) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, email, phone_number, JSON.stringify(products), totalAmount]
    );

    console.log("✅ Заказ успешно создан:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Ошибка при создании заказа:", err.message);
    res.status(500).json({ error: "Ошибка сервера", details: err.message });
  }
});



// API для получения заказов пользователя
app.get('/api/orders', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  console.log("Получение заказов пользователя ID:", userId);

  try {
    const result = await pool.query(
      "SELECT id, user_id, products::text, status, total_amount, created_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    console.log("Заказы из БД:", result.rows);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "У вас пока нет заказов" });
    }

    // Парсим JSONB (products)
    const formattedOrders = result.rows.map(order => ({
      ...order,
      products: JSON.parse(order.products), // Преобразуем JSONB в объект
      created_at: new Date(order.created_at).toISOString(), // Форматируем дату
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error("Ошибка при получении заказов:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});


//обновление статуса заказов
app.put("/api/orders/:orderId", authenticateToken, async (req, res) => {
  const { status } = req.body;
  const { orderId } = req.params;

  if (!["processing", "shipped", "delivered"].includes(status)) {
    return res.status(400).json({ error: "Неверный статус" });
  }

  try {
    const result = await pool.query(
      `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND user_id = $3 RETURNING *`,
      [status, orderId, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Заказ не найден" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка при обновлении статуса:", err.message);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.put("/api/orders/:orderId/complete", async (req, res) => {
  const { orderId } = req.params;
  try {
    await pool.query("UPDATE orders SET status = 'completed successfully' WHERE id = $1", [orderId]);
    res.status(200).json({ message: "Статус заказа обновлен" });
  } catch (error) {
    console.error("Ошибка при обновлении статуса заказа:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
