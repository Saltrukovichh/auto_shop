import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./LoginPage.module.css"; // Измененный импорт

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5001/api/login", { email, password });
      localStorage.setItem("token", response.data.token);
      setIsModalOpen(true);
      navigate("/profile");
    } catch (err) {
      setError("Неправильный email или пароль");
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
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
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