import React, { useContext, useState, useEffect } from "react";
import { FiShoppingCart, FiSearch, FiX, FiUser } from "react-icons/fi";
import { IoCarSportOutline } from "react-icons/io5";
import { CartContext } from "../CartContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Header.css";

export default function Header() {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const { cartItems, addToCart, removeFromCart } = useContext(CartContext);
  
  const [user, setUser] = useState(null); // Данные пользователя
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:5001/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem("token"); // Очистить токен, если он недействителен
          setUser(null);
        });
    }
  }, []);

  // Обработчик клика по иконке пользователя
  const handleIconClick = () => {
    if (user) {
      navigate("/profile"); // Если есть пользователь — переход в профиль
    } else {
      navigate("/login"); // Если нет — переход на авторизацию
    }
  };

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  useEffect(() => {
    let isMounted = true;
    const fetchSearchResults = async () => {
      if (searchTerm.trim() === "") {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5001/api/products?search=${searchTerm}`
        );
        if (isMounted) {
          setSearchResults(response.data);
          setShowResults(true);
        }
      } catch (error) {
        console.error("Ошибка при поиске товаров:", error);
      }
    };

    fetchSearchResults();

    return () => {
      isMounted = false;
    };
  }, [searchTerm]);

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <header>
      <div className="header-container">
        <div className="header-top">
          <span className="logo">
            Auto Dom <IoCarSportOutline />
          </span>

          <div className="search-bar-container">
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="clear-search-button" onClick={clearSearch}>
                <FiX />
              </button>
            )}
            <button className="search-button">
              <FiSearch />
            </button>
          </div>
        </div>

        <ul className="nav">
          <li>Каталог</li>
          <li>Информация</li>
          <li>Контакты</li>
          <li>
            <FiShoppingCart
              onClick={() => setCartOpen(!cartOpen)}
              className={`shop-cart-button ${cartOpen && "active"}`}
            />
          </li>
          <li>
            <FiUser
              className="icon"
              onClick={handleIconClick}
              title="Личный кабинет"
            />
          </li>
        </ul>

        {showResults && (
          <div className="search-results-container">
            <p className="results-header">ТОВАРЫ:</p>
            {searchResults.length > 0 ? (
              searchResults.map((product) => (
                <div key={product.id} className="search-result-item">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="result-image"
                  />
                  <div className="result-details">
                    <p className="result-title">{product.title}</p>
                    <p className="result-price">{product.price} BYN</p>
                  </div>
                  <button
                    className="buy-button"
                    onClick={() => addToCart(product)}
                  >
                    Купить
                  </button>
                </div>
              ))
            ) : (
              <p className="no-results">Товары не найдены</p>
            )}
          </div>
        )}

        {cartOpen && (
          <div className="shop-cart">
            {cartItems.length > 0 ? (
              <>
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <div key={item.id} className="cart-item">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="cart-item-image"
                      />
                      <div className="cart-item-details">
                        <p className="cart-item-title">{item.title}</p>
                        <p>
                          {item.quantity} шт. × {item.price} BYN ={" "}
                          {item.quantity * item.price} BYN
                        </p>
                      </div>
                      <button
                        className="remove-item-button"
                        onClick={() => removeFromCart(item.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="cart-total">
                  <strong>Итого: {totalAmount} BYN</strong>
                </div>
                <button
                  className="view-cart-button"
                  onClick={() => {
                    document
                      .getElementById("OrderForm")
                      .scrollIntoView({ behavior: "smooth" });
                    navigate("/checkout");
                    setCartOpen(false);
                  }}
                >
                  Перейти к оформлению
                </button>
              </>
            ) : (
              <p className="pusto">Корзина пуста</p>
            )}
          </div>
        )}
      </div>
      <div className="presentation"></div>
    </header>
  );
}
