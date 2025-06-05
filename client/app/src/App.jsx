import { BrowserRouter, Routes, Route } from 'react-router-dom';

import socketIOClient from 'socket.io-client';

import MainPage from './components/MainPage';
import LoginPage from './components/LoginPage';
import BoardPage from './components/BoardPage';
import PersonalAccount from './components/PersonalAccount';
import NotFoundPage from './components/NotFoundPage';

import './App.css'

function App() {
  const socketio = socketIOClient('http://localhost:3001')

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={ <MainPage/> } />
          <Route path="login" element={ <LoginPage/> } />
          <Route path="account" element={ <PersonalAccount/> } />
          <Route path="board/:boardId" element={ <BoardPage/> } />
          <Route path="*" element={ <NotFoundPage/> } />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
