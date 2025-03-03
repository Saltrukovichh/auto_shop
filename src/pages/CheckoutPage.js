import React, { useState } from "react";
import "./CheckoutPage.css";
import { useCart } from "../CartContext";
import { useLocation } from "react-router-dom";

const CheckoutPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    agreeToTerms: false,
  });
  const location = useLocation();
  const { cartItems: contextCartItems, totalAmount: contextTotalAmount, updateQuantity } = useCart();

  const { cartItems = contextCartItems, totalAmount = contextTotalAmount } =
    location.state || {};

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Имя обязательно для заполнения";
    }

    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Введите корректный email";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Адрес обязателен для заполнения";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "Необходимо согласие с условиями";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Возвращает true, если ошибок нет
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // Если форма валидна, отправляем данные
      console.log("Форма отправлена:", formData);
      setIsSubmitted(true);
    } else {
      console.log("Форма содержит ошибки");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) return; // Минимальное количество - 1
    updateQuantity(id, newQuantity);
  };

  return (
    <div className="checkout-page">
      <h1>Оформление заказа</h1>
      <div className="cart-summary">
        <h2>Ваш заказ</h2>
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <img
                src={item.image_url}
                className="product-image"
                alt={item.title || "Изображение товара"}
              />
              <p>{item.title}</p>

              <p>
                {item.quantity} шт. × {item.price} BYN ={" "}
                {item.quantity * item.price} BYN
              </p>
              <div className="quantity-control">
                <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>
                  &lt;
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>
                  &gt;
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>Корзина пуста</p>
        )}
        <p className="total-amount">Итого: {totalAmount} BYN</p>
      </div>
      {isSubmitted ? (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="thanks">Спасибо за заказ!</h2>
            <button
              className="close-modal-button"
              onClick={() => setIsSubmitted(false)}
            >
              Закрыть
            </button>
          </div>
        </div>
      ) : (
        <form id="checkoutForm" className="checkout-form" onSubmit={handleSubmit}>
          {/* Поле "Имя" */}
          <div className={`form-group ${errors.name ? "has-error" : ""}`}>
            <label>Имя:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "error-field" : ""}
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          {/* Поле "Email" */}
          <div className={`form-group ${errors.email ? "has-error" : ""}`}>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "error-field" : ""}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          {/* Поле "Адрес" */}
          <div className={`form-group ${errors.address ? "has-error" : ""}`}>
            <label>Адрес:</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={errors.address ? "error-field" : ""}
            />
            {errors.address && <span className="error">{errors.address}</span>}
          </div>

          {/* Чекбокс "Согласие с условиями" */}
          <div className={`form-group-checkbox ${errors.agreeToTerms ? "has-error" : ""}`}>
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className={errors.agreeToTerms ? "error-field" : ""}
            />
            <label>Согласен с обработкой личных данных</label>
            {errors.agreeToTerms && <span className="error">{errors.agreeToTerms}</span>}
          </div>

          {/* Кнопка отправки */}
          <button type="submit" className="submit-button">
            Оформить заказ
          </button>
        </form>
      )}
    </div>
  );
};

export default CheckoutPage;