import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiEye, FiEyeOff } from "react-icons/fi";
import styles from "./RegisterPage.module.css";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (pass) => {
    const minLength = 8;
    const maxLength = 16;
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    return pass.length >= minLength && pass.length <= maxLength && hasUpperCase && hasLowerCase;
  };

  const validatePhoneNumber = (phone) => /^\+?[0-9]{10,15}$/.test(phone);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!validatePassword(password)) {
      setError("Пароль должен содержать: 8-16 символов, 1 заглавную и 1 строчную буквы");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError("Некорректный номер телефона. Формат: +375XXXXXXXXX");
      return;
    }

    try {
      // Проверка существующего пользователя
      await axios.post("http://localhost:5001/api/check-user", { email, phoneNumber });
      
      // Если проверка пройдена - отправляем код
      await axios.post("http://localhost:5001/api/send-verification-code", { email });
      setIsCodeSent(true);
    } catch (err) {
      if (err.response?.status === 409) {
        setError("Пользователь с таким email или телефоном уже существует");
      } else {
        setError(err.response?.data || "Ошибка при регистрации");
      }
    }
  };

  const handleVerifyCode = async () => {
    try {
      const response = await axios.post("http://localhost:5001/api/verify-code", { email, code: verificationCode });
      
      if (response.status === 200) {
        await axios.post("http://localhost:5001/api/register", {
          username,
          email,
          password,
          phone_number: phoneNumber,
        });
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data || "Ошибка подтверждения кода");
    }
  };

  return (
    <div className={styles.registerPage}>
      <div className={styles.registerForm}>
        <h1>Регистрация</h1>
        {!isCodeSent ? (
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
            <input
              type="tel"
              placeholder="+375(XX) XXX-XX-XX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit">Зарегистрироваться</button>
          </form>
        ) : (
          <div>
            <p>На вашу почту отправлен код подтверждения. Введите его ниже:</p>
            <input
              type="code"
              placeholder="Код подтверждения"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
            {error && <p className={styles.error}>{error}</p>}
            <button onClick={handleVerifyCode}>Подтвердить</button>
          </div>
        )}
        <p>
          Есть аккаунт? <Link className={styles.linkStyle} to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;