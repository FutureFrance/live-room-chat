import { io, Socket } from 'socket.io-client';

export const socket: Socket = io(`http://${process.env.REACT_APP_HOSTNAME}:3003`, {
    withCredentials: true,
    // reconnection: false
});

socket.disconnect();