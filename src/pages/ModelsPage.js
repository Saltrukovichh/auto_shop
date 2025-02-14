import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import './ModelsPage.css';

function ModelsPage() {
  const { brand } = useParams(); // Извлечение параметра brand из URL
  const [models, setModels] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("brand from useParams:", brand); // Для отладки
    if (brand) {
      const fetchModels = async () => {
        try {
          const response = await axios.get(`http://localhost:5001/api/brands/${brand}`); // Корректный путь
          setModels(response.data);
        } catch (error) {
          console.error("Ошибка при загрузке моделей:", error);
          setError("Не удалось загрузить модели");
        }
      };

      fetchModels();
    }
  }, [brand]);

  return (
    <div className="models-page">
      <h1 className="title">Модели марки {brand.name}</h1>
      <hr className="polosa" />
      {error && <p className="error">{error}</p>}
      <div className="model-list">
        {models.map((model, index) => (
          <Link to={`/brand/${brand}/model/${model.id}`} key={index}>
            <div className="model-item">{model.name}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ModelsPage;
