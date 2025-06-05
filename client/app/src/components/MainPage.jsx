import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import HeaderLogo from './common/headerLogo/HeaderLogo'

import './MainPage.css'

function MainPage() {
  const navigate = useNavigate();

  const handleLinkMainPage = () => {
    navigate("/");
  }

  return (
    <>
      <div className='main-page-header'>
        <div className='main-page-logo'>
          <HeaderLogo onClick={handleLinkMainPage}/>
        </div>
        <div className='main-page_nav'>
          <ul className='nav-container'>
            <li className='nav-container_element'><a className='main-page_nav-link' href='#features'>возможности</a></li>
            <li className='nav-container_element'><a className='main-page_nav-link' href='#howtouse'>как пользоваться</a></li>
            <li className='nav-container_element'><a className='main-page_nav-link' href='#links'>полезные ссылки</a></li>
          </ul>
        </div>
        <div className='main-page-login'>
          <Link className='main-page_login' to="/login">Войти</Link>
        </div>
      </div>
      <section className='main-page-section' id='features'>
        <h2 className='text-big'>Инструмент для работы и учебы</h2>
        <ul className='section-list-container'>
          <li className='section-list'>Личный кабинет</li>
          <li className='section-list'>Создание схем</li>
          <li className='section-list'>Совместная работа</li>
        </ul>
      </section>
      <section className='main-page-section' id='howtouse'>
        <div className='main-page-section-title'>
          <h2 className='text-big'>Инструкция по работе с приложением</h2>
        </div>
        <div>
          <h3 className='text-big-section'>Инструмент выделение</h3>
          <div className='section-card-container'>
            <div className='section-card'>
              <h4 className='text-medium'>Выделенный элемент</h4>
              <div className='section-img-container'>
                <img 
                  className='main-page-image'
                  src='/src/assets/main_page/mainpage_select.png'
                  alt='Работа с инструментом выделение'/>
              </div>
            </div>
            <div className='section-card'>
              <h4 className='text-medium'>Перемещение</h4>
              <div className='section-img-container'>
                <img 
                  className='main-page-image'
                  src='/src/assets/main_page/mainpage_move_graphics.png'
                  alt='Работа с инструментом выделение'/>
              </div>
            </div>
            <div className='section-card'>
              <h4 className='text-medium'>Масштабирование</h4>
              <div className='section-img-container'>
                <img 
                  className='main-page-image'
                  src='/src/assets/main_page/mainpage_scale_graphics.png'
                  alt='Работа с инструментом выделение'/>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h3 className='text-big'>Инструменты графики</h3>
          <div className='section-card-container'>
            <div className='section-card'>
              <h4 className='text-medium'>Перо</h4>
              <div className='section-img-container'>
                <img 
                  className='main-page-image'
                  src='/src/assets/main_page/mainpage_pen.png'
                  alt='Работа с инструментом выделение'/>
              </div>
            </div>
            <div className='section-card'>
              <h4 className='text-medium'>Стрелка</h4>
              <div className='section-img-container'>
                <img 
                  className='main-page-image'
                  src='/src/assets/main_page/mainpage_arrow.png'
                  alt='Работа с инструментом выделение'/>
              </div>
            </div>
            <div className='section-card'>
              <h4 className='text-medium'>Прямоугольник/Квадрат</h4>
              <div className='section-img-container'>
                <img 
                  className='main-page-image'
                  src='/src/assets/main_page/mainpage_rectangle.png'
                  alt='Работа с инструментом выделение'/>
              </div>
            </div>
            <div className='section-card'>
              <h4 className='text-medium'>Эллипс/Круг</h4>
              <div className='section-img-container'>
                <img 
                  className='main-page-image'
                  src='/src/assets/main_page/mainpage_ellipse.png'
                  alt='Работа с инструментом выделение'/>
              </div>
            </div>
            <div className='section-card'>
              <h4 className='text-medium'>Текст</h4>
              <div className='section-img-container'>
                <img 
                  className='main-page-image'
                  src='/src/assets/main_page/mainpage_text.png'
                  alt='Работа с инструментом выделение'/>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h3 className='text-big'>Навигация по доске</h3>
          <div className='section-card-container'>
            <div className='section-card'>
              <h4 className='text-medium'>Масштабирование</h4>
              <div className='section-img-container'>
                <img 
                  className='main-page-image'
                  src='/src/assets/main_page/mainpage_scale_canvas.png'
                  alt='Работа с инструментом выделение'/>
              </div>
            </div>
            <div className='section-card'>
              <h4 className='text-medium'>Перемещение</h4>
              <div className='section-img-container'>
                <img 
                  className='main-page-image'
                  src='/src/assets/main_page/mainpage_move_canvas.png'
                  alt='Работа с инструментом выделение'/>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className='main-page-section' id='links'>
        <div>
        <div>
          <h3 className='text-big'>Полезные ссылки</h3>
          <div className='section-card-container'>
            <div className='section-card'>
              <h4 className='text-medium'>GitHub проекта</h4>
              <div className='section-img-container'></div>
            </div>
            <div className='section-card'>
              <h4 className='text-medium'>GitHub автора</h4>
              <div className='section-img-container'></div>
            </div>
          </div>
        </div>
        </div>
      </section>
    </>
  )
}

export default MainPage