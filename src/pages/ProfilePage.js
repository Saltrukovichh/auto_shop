import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [modalOrder, setModalOrder] = useState(null); // Состояние модального окна
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userResponse = await axios.get("http://localhost:5001/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userResponse.data);

        const ordersResponse = await axios.get("http://localhost:5001/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrders(Array.isArray(ordersResponse.data) ? ordersResponse.data : []);
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
        if (err.response?.status === 404) {
          setOrders([]);
        } else {
          navigate("/login");
        }
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Открытие модального окна
  const openModal = (order) => {
    setModalOrder(order);
  };

  // Закрытие модального окна
  const closeModal = () => {
    setModalOrder(null);
  };

  // Функция изменения статуса заказа
  const handleDownload = async (orderId) => {
    try {
      await axios.put(`http://localhost:5001/api/orders/${orderId}/complete`);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: "completed successfully" } : order
        )
      );
      closeModal();
    } catch (error) {
      console.error("Ошибка при обновлении статуса:", error);
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        <div className="profile-card">
          <h1>Личный кабинет</h1>
          <div className="user-info">
            <p><span>Имя пользователя:</span> {user?.username}</p>
            <p><span>Email:</span> {user?.email}</p>
            <p><span>Телефон:</span> {user?.phone_number}</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Выйти</button>
        </div>

        <div className="orders-section">
          <h2>История заказов</h2>
          {orders.length === 0 ? (
            <p className="no-orders">У вас пока нет заказов</p>
          ) : (
            <div className="orders-grid">
              {orders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <span>Заказ #{order.id}</span>
                    <span className="order-status">{order.status}</span>
                  </div>
                  <div className="order-body">
                    <p><span>Дата:</span> {new Date(order.created_at).toLocaleString()}</p>
                    <p><span>Сумма:</span> {order.total_amount} BYN</p>
                    <div className="products-list">
                      <span>Товары:</span>
                      {order.products.map((product, idx) => (
                        <div key={idx} className="product-item" onClick={() => openModal(order)}>
                          <span>{product.title}</span>
                          <span>{product.quantity} × {product.price} BYN</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Модальное окно */}
        {modalOrder && (
          <div className="modalOverlay">
            <div className="modalContent">
              <h2>Скачать товары</h2>
              <p>Ваш заказ #{modalOrder.id}</p>
              <ul>
                {modalOrder.products.map((product, idx) => (
                  <li key={idx}>
                    {product.title} —{" "}
                    <a
                      href={product.download_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleDownload(modalOrder.id)}
                    >
                      Скачать
                    </a>
                  </li>
                ))}
              </ul>
              <button onClick={closeModal}>Закрыть</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
