import { Socket } from "socket.io-client"

export interface IMessage {
    content: string,
    owner: any, // IUser or string
    _id: string
}

export interface IData {
    _id: string 
    user: string
}

export interface IUser {
    id: string,
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
    participants: Array<string>
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