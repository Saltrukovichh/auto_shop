import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './ProfilePage.css';

function ProfilePage({ onLogout }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5001/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (err) {
        console.error("Ошибка при получении данных пользователя:", err);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    window.location.reload(); // Принудительное обновление страницы
  };

  if (!user) return <p>Загрузка...</p>;

  return (
    <div className="profile-wrapper">
      <div className="profile-page">
        <h1>Личный кабинет</h1>
        <p><strong>Имя пользователя:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Дата регистрации:</strong> {new Date(user.created_at).toLocaleString()}</p>
        <div className="button-container">
          <button className="log-out-button" onClick={handleLogout}>Выйти</button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;