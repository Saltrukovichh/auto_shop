import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { CartContext } from "../CartContext";
import './ProductsPage.css';

function ProductsPage() {
  const { engineId } = useParams(); // Получаем engineId из параметров маршрута
  const [products, setProducts] = useState([]);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/engines/${engineId}/products`); // Используем engineId
        setProducts(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке товаров:", error);
      }
    };

    fetchProducts();
  }, [engineId]);

  return (
    <div className="products-page">
      <h1>Товары для двигателя {engineId}</h1>
      <div className="product-list">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <img src={product.image_url} alt={product.title} className="product-image" />
            <div className="product-info">
              <p className="product-sku">SKU: {product.sku}</p>
              <h2 className="product-title">{product.title}</h2>
              <p className="product-price">{product.price} BYN</p>
            </div>
            <div className="product-buttons">
              <button className="btn-buy" onClick={() => addToCart(product)}>
                Купить
              </button>
              <button className="btn-buy-one-click">Купить в 1 клик</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductsPage;
