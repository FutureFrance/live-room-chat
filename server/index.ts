import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import router from './src/routes';
import cookieParser from 'cookie-parser';
import { verifyUser } from './src/socket/socketMiddleware';
import SocketService from './src/socket/socketService';
import { errorHandler } from './src/middlewares/errorHandler';
import { IMessage, IRoom, IUser } from './interfaces';

dotenv.config();

const DB_URL = process.env.DB_URL as string;

const app = express();
const server = http.createServer(app);

app.use('/images', express.static('static'));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000",
    methods: "*",
    credentials: true
}));
app.use("/api", router);
app.use(errorHandler);

async function connectDB(DB_URL: string) {
    try {
        await mongoose.connect(DB_URL);

        console.log("Successfully connected to DB");
    } catch(err) {
        console.log(`Error connecting with DB\nErr: ${err}`);
    }
} connectDB(DB_URL);

const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
});

io.use((socket, next) => {
    try {
        const authorizationToken = socket.handshake.headers.cookie?.slice(6, socket.handshake.headers.cookie.length) as string;

        if (authorizationToken === undefined) throw new Error("User is unauthorized");

        socket.data = { authorizationToken };
        next();
    } catch(err: any) {
        next(err);
    }
});

io.on("connection", (socket) => {
    const authorizationToken = socket.data.authorizationToken;

    let USER: IUser;
    let ROOM: IRoom;
    let MESSAGES: IMessage[];
    let CURRENT_ROOM: string = "empty";

    socket.on("get_info", async(roomId: string) => {
        if ( CURRENT_ROOM !== "empty") {
            socket.leave(CURRENT_ROOM);
            console.log(`Client left the room ${ROOM.name}`)
        }
        const information = await verifyUser(authorizationToken, roomId);
        
        USER = information.USER;
        ROOM = information.ROOM;
        MESSAGES = information.MESSAGES;

        socket.emit("welcome", ({ USER, ROOM, MESSAGES }));
        socket.join(String(ROOM._id));

        CURRENT_ROOM = String(ROOM._id);
        console.log(`User: ${USER.username} joined the room ${ROOM.name}`);
    });    

    socket.on("send_message", async(messageContent: string) => {
        console.log(`USER: ${USER.username} sent: ${messageContent} in room: ${ROOM.name}`)
        const message = await SocketService.createMessage(messageContent, USER._id, String(ROOM._id));

        socket.emit("send_message_response", { returnMessage: message, username: USER.username});
        socket.broadcast.to(String(ROOM._id)).emit("receive_messages", { returnMessage: message, username: USER.username});
    });

    socket.on("disconnect", () => {
        console.log("Client has disconnected");
    });
});

server.listen(3003, () => console.log("Server is listening on port 3003"));
