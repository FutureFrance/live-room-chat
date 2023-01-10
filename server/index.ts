import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import router from './src/routes';
import cookieParser from 'cookie-parser';
import { errorHandler } from './src/middlewares/errorHandler';
import { chat } from './src/socket/socketLogic';

dotenv.config();

const DB_URL = process.env.DB_URL as string;
const PORT = process.env.PORT as string;

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

chat(io);

server.listen(PORT, () => console.log(`Server is listening on port: ${PORT}`));
