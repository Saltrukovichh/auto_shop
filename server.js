const express = require('express');
const pool = require('./db');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5001;
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000', // Укажите адрес фронтенда
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
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
    const result = await pool.query('SELECT id, username, email, created_at FROM users WHERE id = $1', [req.user.userId]);
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
    const token = jwt.sign({ userId: user.id }, 'secret_key', { expiresIn: '1h' });
    res.json({ token });
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
app.get('/api/engines/:engineId/products', async (req, res) => {
  const { engineId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM products WHERE engine_id = $1', [engineId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Ошибка сервера');
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

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
