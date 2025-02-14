import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../CartContext";
import "./CheckoutPage.css";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems: contextCartItems, totalAmount: contextTotalAmount } = useCart();

  const { cartItems = contextCartItems, totalAmount = contextTotalAmount } =
    location.state || {};

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false); // Состояние для модального окна

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone || !email) {
      setError("Пожалуйста, заполните все поля.");
      return;
    }

    setError("");
    setShowModal(true); // Показываем модальное окно
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate("/"); // Возвращаемся на главную страницу
  };

  return (
    <div className="checkout-page">
      <h1>Оформление заказа</h1>
      <div className="cart-summary">
        <h2>Ваш заказ</h2>
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <p>{item.title}</p>
              <p>
                {item.quantity} шт. × {item.price} BYN ={" "}
                {item.quantity * item.price} BYN
              </p>
            </div>
          ))
        ) : (
          <p>Корзина пуста</p>
        )}
        <p className="total-amount">Итого: {totalAmount} BYN</p>
      </div>

      <div className="checkout-form">
        <h2>Получатель</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Имя:*</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Телефон:*</label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">E-mail:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group-checkbox">
            <input type="checkbox" id="agreement" required />
            <label htmlFor="agreement">
              Я согласен на обработку персональных данных
            </label>
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="submit-button">
            Оформить заказ
          </button>
        </form>
      </div>

      {/* Модальное окно */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Спасибо за заказ!</h2> 
            <p classname ="thanks">Мы скоро свяжемся с вами для подтверждения.</p>
            <button onClick={handleCloseModal} className="close-modal-button">
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
