import { io } from 'socket.io-client';

function getTokenFromCookie(name = 'jwt') {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

const token = getTokenFromCookie();

export const socket = io('http://localhost:3000', {
    autoConnect: false,
    auth: { token },
    withCredentials: true,
    transports: ['websocket'],
});