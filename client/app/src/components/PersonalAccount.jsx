import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import HeaderLogo from './common/headerLogo/HeaderLogo';

import './PersonalAccount.css'

function PersonalAccount() {
    const [ boards, setBoards ] = useState([]);
    const [ newBoardName, setNewBoardName ] = useState("");
    const [ statusLoading, setStatusLoading ] = useState(true);
    const navigate = useNavigate();

    const handleLinkMainPage = () => {
        navigate("/");
    }

    const getAllBoards = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/board', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error("An error ", response.status);
            }

            const data = await response.json();
            setBoards(data);
        } catch(error) {
            console.log("Ошибка при получении данных");
        }
    };

    const createNewBoard = async () => {
        const newBoardData = {
            title: newBoardName
        }
        try {
            const response = await fetch('http://localhost:3000/api/board', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                  },
                body: JSON.stringify(newBoardData)
            });

            if (!response.ok) {
                throw new Error("An error ", response.status);
            }

            getAllBoards();
            setNewBoardName('');
        } catch(error) {
            console.log("Ошибка при создании доски");
        }
    };

    const handleRedirectToBoard = (boardId) => {
        navigate(`/board/${boardId}`);
    };

    const handleInputChange = (event) => {
        setNewBoardName(event.target.value);
    }

    useEffect(() => {
        getAllBoards();
    }, []);

  return (
    <>
        <div className='account-header'>
            <HeaderLogo onClick={handleLinkMainPage}/>
        </div>
        <div className='account-container'>
            <div className='account-container_header'>
                <h2 className='login-form-header text-no-margin'>Ваши доски</h2>
                <div className='form_create-board'>
                    <input className='form_input-name' type='text' placeholder='Название доски' onChange={(event) => handleInputChange(event)}/>
                    <button className='form-create_btn' onClick={createNewBoard}>Создать</button>
                </div>
            </div>
            <div className='account-board-card-container'>
                {boards.length == 0 && <p className='text-medium'>Вы еще не создали ни одной доски</p>}
                {boards.map(board => (
                    <div key={board._id} className='account-board-card'>
                        <div className='account-card-img' onClick={() => handleRedirectToBoard(board._id)}></div>
                        <h3 className='account-card-name'>{board.title}</h3>
                        <p className='account-card-date'>{new Date(board.createdAt).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>
        </div>
    </>
  )
}

export default PersonalAccount