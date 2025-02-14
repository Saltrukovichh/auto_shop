import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import './HomePage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function HomePage() {
  const [brands, setBrands] = useState([]); // Состояние для хранения списка марок
  const [error, setError] = useState(null); // Состояние для ошибок

  const fetchBrands = async () => {
    try {
      // Удалите /${brandId}/models, так как HomePage получает все бренды
      const response = await axios.get(`${API_URL}/api/brands`);
      setBrands(response.data);
    } catch (err) {
      console.error("Ошибка при загрузке марок:", err);
      if (err.response && err.response.status === 404) {
        setError("Марки не найдены");
      } else {
        setError("Не удалось загрузить марки. Попробуйте позже.");
      }
    }
  };

  useEffect(() => {
    fetchBrands(); // Загружаем марки при монтировании компонента
  }, []);

  return (
    <div className="homepage">
      <h1 className="title">Марки автомобилей</h1>
      <hr className="polosa" />
      {error && <p className="error">{error}</p>}
      <div className="brand-list">
        {brands.length > 0 ? (
          brands.map((brand) => (
            <Link to={`/brand/${brand.id}`} key={brand.id}>
              <div className="brand-item">
              <img src={brand.image_url} alt={brand.name} className="brand-image" />
                <p className="brand-title">{brand.name}</p>
              </div>
            </Link>
          ))
        ) : (
          !error && <p>Нет доступных марок</p>
        )}
      </div>
    </div>
  );
}

export default HomePage;
