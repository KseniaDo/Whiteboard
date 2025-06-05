import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './HeaderControlPanel.css'

function HeaderControlPanel({ onClick }) {
    const [ successCopy, setSuccessCopy ] = useState(false);
    const [ viewScale, setViewScale ] = useState(100);
    const navigate = useNavigate();

    const handleCopyLink = () => {
        const currentURL = window.location.href;
        navigator.clipboard.writeText(currentURL)
            .then(() => {
                setSuccessCopy(true);
                setTimeout(() => {
                    setSuccessCopy(false);
                }, 2000);
            })
            .catch(() => {
                console.log("An error due copying the link");
            });
    }

    const handleLinkToAccount = () => {
        navigate('/account');
    }

    const handleClick = (event) => {
        const scaleID = event.target.id;
        setViewScale()
        let newViewScale = viewScale;
        switch(scaleID) {
            case 'downScale':
                if (viewScale > 20) {
                    newViewScale -= 10;
                } else {
                    newViewScale = 10;
                }
                break;
            case 'upScale':
                if (viewScale < 200) {
                    newViewScale += 10;
                } else {
                    newViewScale = 200;
                }
                break;
        }
        setViewScale(newViewScale);
        onClick(scaleID);
    }

    return (
        <>
            <div className='header'>
                <div className='scale'>
                    <div className='scale__down' id='downScale' onClick={handleClick}>
                    </div>
                    <div className='scale__text'>
                        <p className='text text_small text_light'>{viewScale}</p>
                    </div>
                    <div className='scale__up' id='upScale' onClick={handleClick}>
                    </div>
                </div>
                <div className='control'>
                    <div className='control__link' style={{
                        backgroundColor: successCopy ? '#9DFFA0' : 'white'
                    }} onClick={handleCopyLink}></div>
                    <div className='control__user' onClick={handleLinkToAccount}></div>
                </div>
            </div>
        </>
    )
}

export default HeaderControlPanel