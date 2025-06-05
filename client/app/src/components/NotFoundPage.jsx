import { useNavigate } from 'react-router-dom'

import HeaderLogo from './common/headerLogo/HeaderLogo'

import './NotFoundPage.css'

function NotFoundPage() {
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
      </div>
      <section className='main-page-section' id='features'>
        <h2 className='text-big'>404 Page Not Found</h2>
        <ul className='section-list-container'>
          <li className='section-list'>Страница не найдена, проверьте правильность ссылки</li>
        </ul>
      </section>
    </>
  )
}

export default NotFoundPage