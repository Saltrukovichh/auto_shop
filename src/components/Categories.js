import React from 'react';
import { useNavigate } from 'react-router-dom';

const Categories = () => {
  const navigate = useNavigate();

  const categories = [
    { name: 'Все', path: '/' },
    { name: 'Легковые авто', path: '/brand/cars' },
  ];

  return (
    <div id="OrderForm" className="categories">
      {categories.map((category, index) => (
        <div
          key={index}
          onClick={() => navigate(category.path)}
          className="category-item"
        >
          {category.name}
        </div>
      ))}
    </div>
  );
};

export default Categories;
