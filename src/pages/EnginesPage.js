import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import './EnginesPage.css';

function EnginesPage() {
  const { model } = useParams(); // Извлечение параметра model из URL
  const [engines, setEngines] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (model) {
      const fetchEngines = async () => {
        try {
          const response = await axios.get(`http://localhost:5001/api/models/${model}/engines`);
          setEngines(response.data);
        } catch (error) {
          console.error("Ошибка при загрузке двигателей:", error);
          setError("Не удалось загрузить двигатели");
        }
      };

      fetchEngines();
    }
  }, [model]);

  return (
    <div className="engines-page">
      <h1 className="title">Двигатели модели {model}</h1>
      <hr className="polosa" />
      {error && <p className="error">{error}</p>}
      <div className="engine-list">
        {engines.map((engine) => (
          <Link to={`/brand/:brand/model/${model}/engine/${engine.id}`} key={engine.id}>
            <div className="engine-item">{engine.name}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default EnginesPage;
