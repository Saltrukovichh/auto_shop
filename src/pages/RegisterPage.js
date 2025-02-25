import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './Auth.css';

function RegisterPage() {
  const [username, setUsername] = useState(""); // Добавлено состояние для имени пользователя
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Отправляем запрос с username, email и password
      await axios.post("http://localhost:5001/api/register", {
        username,
        email,
        password,
      });
      navigate("/login"); // Перенаправляем на страницу авторизации
    } catch (err) {
      if (err.response?.status === 409) {
        setError("Email или имя пользователя уже заняты.");
      } else {
        setError("Ошибка при регистрации. Попробуйте снова.");
      }
    }
  };

  return (
    <div className="auth-page">
      <h1>Регистрация</h1>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
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
        {error && <p className="error">{error}</p>}
        <button type="submit">Зарегистрироваться</button>
      </form>
    </div>
  );
}

export default RegisterPage;
 