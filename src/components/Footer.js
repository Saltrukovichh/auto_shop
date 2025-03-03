import React from 'react';
import "./Footer.css";
import { IoCallOutline, IoMailOutline } from "react-icons/io5";

export default function Footer() {
  return (
    <footer>
      <div className='footer-wrapper'>
        <ul className='footer-nav'>
          <li>
            <div className='logo-div'>

            </div>
          </li>
          <li>
            Auto Dom.
            Все права защищены
          </li>
        </ul>
        <div className='kompany-div'>
          <ul className='footer-nav'>
            <li><p>КОМПАНИЯ</p></li>
            <li>О компании</li>
            <li>Лицензии</li>
            <li>Партнеры</li>
            <li>Отзывы клиентов</li>
          </ul>
        </div>
        <div className='katalog-div'>
          <ul className='footer-nav'>
            <li><p>КАТАЛОГ</p></li>
            <li>Все марки</li>
            <li>Легковые авто</li>
            <li>Мотоциклы</li>
          </ul>
        </div>
        <div className='info-div'>
          <ul className='footer-nav'>
            <li><p>ИНФОРМАЦИЯ</p></li>
            <li>Акции</li>
            <li>Новости</li>
            <li>Статьи</li>
          </ul>
        </div>
        <div className='contact-div'>
          <ul className='footer-nav'>
            <li>
              <p>
                <IoCallOutline className="icon" /> {/* Иконка телефона */}
                +375-25-624-04-73
              </p>
            </li>
            <li>
              <p>
                <IoMailOutline className="icon" /> {/* Иконка почты */}
                vladsaltrukovic@gmail.com
              </p>
            </li>
            <li>
              <button className="call-button"> {/* Кнопка */}
                Заказать звонок
              </button>
            </li>
          </ul>
        </div>
    </div>
    </footer >
  );
}