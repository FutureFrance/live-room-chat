import { Socket } from "socket.io-client"

export interface IMessage {
    content: string,
    owner: IUser, 
    _id: string,
    createdAt: string
}

export interface IData {
    _id: string 
    user: string
}

export interface IUser {
    id?: string,
    username: string
}

export interface IRegisterResponse {
    user: IUser,
    token: string 
}

export interface ILoginResponse {
    token: string
}

export interface IRoom {
    _id: string,
    name: string,
    owner: string,
    participants: Array<string>,
    image: string
}

export interface IRoomResponse {
    room: IRoom
}

export interface ISocketProp {
    socket: Socket;
}

export interface IMessageToClient {
    returnMessage: IMessage,
    username: string
}