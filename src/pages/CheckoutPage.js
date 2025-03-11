import React, { useState, useEffect } from "react";
import "./CheckoutPage.css";
import { useCart } from "../CartContext";
import { useUser } from "../UserContext";
import axios from "axios";

const CheckoutPage = () => {
  const { user, loading } = useUser();
  const { cartItems, totalAmount, updateQuantity, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: user?.username || "",
    email: user?.email || "",
    phone: user?.phone_number || "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [orderData, setOrderData] = useState(null); // Состояние для хранения данных заказа

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.username,
        email: user.email,
        phone: user.phone_number,
      });
    }
  }, [user, loading]);

  if (loading) return <div>Загрузка данных...</div>;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Имя обязательно";
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Неверный email";
    if (!user && !formData.phone.trim()) newErrors.phone = "Телефон обязателен";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5001/api/orders",
        {
          userId: user?.id || null,
          email: formData.email,
          phone_number: formData.phone,
          cartItems,
          totalAmount,
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      console.log("✅ Заказ оформлен:", response.data);
      setOrderData(response.data); // Сохраняем данные заказа для показа в модальном окне
      setIsSubmitted(true);
      clearCart();
    } catch (error) {
      console.error("❌ Ошибка при оформлении заказа:", error);
    }
  };

  return (
    <div className="checkout-container">
      <h1 className="checkout-title">Оформление заказа</h1>

      <div className="checkout-content">
        <div className="cart-section">
          <h2>Ваша корзина</h2>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image_url} alt={item.title} className="product-image" />
                <div className="item-details">
                  <h3>{item.title}</h3>
                  <p>{item.price} BYN × {item.quantity}</p>
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-total">
            <span>Итого:</span>
            <span>{totalAmount} BYN</span>
          </div>
        </div>

        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2>Данные для оформления</h2>

          <div className={`form-group ${errors.name ? "error" : ""}`}>
            <label htmlFor="name">Имя</label>
            <input id="name" type="text" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={!!user} />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className={`form-group ${errors.email ? "error" : ""}`}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" name="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={!!user} />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {!user && (
            <div className={`form-group ${errors.phone ? "error" : ""}`}>
              <label htmlFor="phone">Телефон</label>
              <input id="phone" type="tel" name="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
          )}

          <button type="submit" className="submit-button">Подтвердить заказ</button>
        </form>
      </div>

      {isSubmitted && (
        <div className="modalOverlay">
          <div className="modalContent">
            {user ? (
              <>
                <h2>Спасибо за покупку!</h2>
                <p>Ваш заказ успешно оформлен. Вы можете просмотреть его в личном кабинете.</p>
              </>
            ) : (
              <>
                <h2>Скачивание продуктов</h2>
                <p>Ваш заказ успешно оформлен. Вы можете скачать продукты прямо сейчас.</p>
                <ul>
                  {orderData?.products.map((product, index) => (
                    <li key={index}>
                      <a
                        href={product.download_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={async () => {
                          try {
                            await axios.put(`http://localhost:5001/api/orders/${orderData.id}/complete`);
                            console.log("✅ Статус заказа обновлен");
                          } catch (error) {
                            console.error("❌ Ошибка при обновлении статуса заказа:", error);
                          }
                        }}
                      >
                        {product.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <button onClick={() => setIsSubmitted(false)} className="close-button">Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
