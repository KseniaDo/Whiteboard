import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'

import HeaderLogo from './common/headerLogo/HeaderLogo'

import './LoginPage.css'

function LoginPage() {
  const { register, handleSubmit, setError, formState: { errors } } = useForm();
  const [ formType, setFormType ] = useState('login');
  const [ actionBtnName, setActionBtnName ] = useState('Войти');
  const navigate = useNavigate();

  const handleChangeAction = (actionName) => {
    setFormType(actionName);
    if (actionName == 'login') {
      setActionBtnName('Войти');
    } else {
      setActionBtnName('Регистрация');
    }
  }

  const handleLinkMainPage = () => {
    navigate("/");
  }

  const onSubmit = async (data) => {
    try {
      const endpoint = formType === 'register' ? 'http://localhost:3000/api/auth/register' : 'http://localhost:3000/api/auth/login';

      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();
      if (response.ok) {
        localStorage.setItem('wbusername', data.username);
        navigate("/account");
      } else {
        setError("checkError", {
          type: "server",
          message: responseData.error,
        });
      }
    } catch (error) {
      setError("checkError", {
        type: "server",
        message: "Ошибка сети, попробуйте позже",
      });
    }
  };

  return (
    <>
      <div className='header-login'>
        <HeaderLogo onClick={handleLinkMainPage}/>
      </div>
      <div className='login-form-container'>
        <h1 className='login-form-header'>Личный кабинет</h1>
        <div className='login-form-button-switch'>
          <button className={formType == 'login' ? 'login-form-button' : 'login-form-button text_transparent'} onClick={() => handleChangeAction('login')}>
            Вход
          </button>
          <button className={formType == 'register' ? 'login-form-button' : 'login-form-button text_transparent'} onClick={() => handleChangeAction('register')}>
            Регистрация
          </button>
        </div>
        <form className='login-form' onSubmit={handleSubmit(onSubmit)}>
          <label className='text_small' htmlFor='login'>Логин</label>
          <input className='login-form-input' placeholder='example' autoComplete='on' id='login' type='text' {...register("username", { required: true })} />
          {errors.name && <p className='error-text'>Обязательное поле логин!</p>}
          <label className='text_small' htmlFor='password'>Пароль</label>
          <input className='login-form-input' placeholder='введите пароль' autoComplete='on' id='password' type='password' {...register("password", { required: true })} />
          {errors.password && <p className='error-text'>Обязательное поле пароль!</p>}
          {errors.checkError && <p className='error-text'>{errors.checkError.message}</p>}
          <button className='login-form-submit' type={'submit'}>{actionBtnName}</button>
        </form>
      </div>
    </>
  )
}

export default LoginPage