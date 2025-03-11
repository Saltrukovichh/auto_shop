import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useUser } from "../UserContext"; 
import axios from "axios";
import styles from "./LoginPage.module.css"; // Измененный импорт

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { fetchUserData } = useUser();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Очищаем предыдущие ошибки

    try {
      // Отправляем запрос на сервер для авторизации
      const response = await axios.post("http://localhost:5001/api/login", {
        email,
        password
      });

      // Сохраняем токен в localStorage
      localStorage.setItem("token", response.data.token);
      await fetchUserData();
      // Проверяем, является ли пользователь администратором
      if (response.data.user.isAdmin) {
        navigate("/admin/dashboard"); // Перенаправляем на админ-панель
      } else {
        setIsModalOpen(true); // Показываем модальное окно для обычных пользователей
        setTimeout(() => {
          setIsModalOpen(false); // Закрываем модальное окно через 2 секунды
          navigate("/profile"); // Перенаправляем на профиль
        }, 2000);
      }
    } catch (err) {
      // Обрабатываем ошибки
      if (err.response?.status === 404) {
        setError("Пользователь не найден");
      } else if (err.response?.status === 401) {
        setError("Неправильный пароль");
      } else {
        setError("Ошибка при авторизации. Попробуйте снова.");
      }
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginForm}>
        <h1>Войти</h1>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className={styles.passwordInputContainer}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEye /> : <FiEyeOff />}
            </span>
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit">Войти</button>
        </form>
        <p>
          Нет аккаунта? <Link className={styles.linkStyle} to="/register">Регистрация</Link>
        </p>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <p>Авторизация прошла успешно</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;