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
// do get all rooms and click on it to join the room if in
dotenv.config();

const DB_URL = process.env.DB_URL as string;

const app = express();
const server = http.createServer(app);

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

io.use(async(socket, next) => {
    console.log("USER is trying to connect to socket")
    try {
        const accessToken = socket.handshake.headers.cookie?.slice(6, socket.handshake.headers.cookie.length) as string;
        const roomId =  socket.handshake.query.room as string;

        socket.data = await verifyUser(accessToken, roomId);
        next();
    } catch(err: any) {
        next(err);
    }
});

io.on("connection", (socket) => {
    const USER = socket.data.USER;
    const ROOM = socket.data.ROOM;
    const messagesHistory = socket.data.MESSAGES;

    console.log(socket.data);

    socket.emit("welcome", ({ USER, ROOM, messagesHistory}));

    socket.on("join_room", () => {
        console.log(`User: ${USER.username} joined the room: ${ROOM._id}`);
        socket.join(String(ROOM._id));
    })

    socket.on("send_message", async(messageContent: string) => {
        console.log(`Received message: ${messageContent} from ${USER.username} in room: ${ROOM._id} message: ${messageContent}`)
        const message = await SocketService.createMessage(messageContent, USER._id, ROOM._id);
        console.log(message)
        socket.emit("send_message_response", { returnMessage: message, username: USER.username});
        console.log(`USER: ${USER.username} is sending a message to everyone in room:${ROOM._id}`)
        socket.broadcast.to(String(ROOM._id)).emit("receive_messages", { returnMessage: message, username: USER.username});
    });
});

server.listen(3003, () => console.log("Server is listening on port 3003"));