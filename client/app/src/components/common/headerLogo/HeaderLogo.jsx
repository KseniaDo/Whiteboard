import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'

import './HeaderLogo.css'

function HeaderLogo({onClick}) {
  return (
    <>
      <div className='header-logo' onClick={onClick}>
        <img
            className='header-logo-image'
            src='/src/assets/logo/logo_big.svg'
            alt='Whiteboard'
            />
      </div>
    </>
  )
}

export default HeaderLogo