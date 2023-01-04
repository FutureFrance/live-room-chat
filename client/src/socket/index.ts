import { io, Socket } from 'socket.io-client';

export const socket: Socket = io("http://localhost:3003", {
    query: {
        'room': window.location.pathname.slice(6, 30)
    },
    withCredentials: true
});

