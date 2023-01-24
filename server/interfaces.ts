import { Types } from 'mongoose';
import { Request } from 'express';

export interface IUser {
    _id: string,
    image: string, 
    username: string,
    password: string,
    online?: boolean,
    usernameChanges?: number
}

export interface IRoom {
    _id: Types.ObjectId | string,
    name: string,
    owner: Types.ObjectId,
    password: string,
    participants: Array<Types.ObjectId>,
    image: string,
    nameChanges?: number
}

export interface IMessage {
    _id: Types.ObjectId,
    owner: Types.ObjectId,
    room: Types.ObjectId,
    isFIle?: string
}

export interface ITokenPayload {
    id: string
}

export interface IRegister {
    user: Omit<IUser, 'password'>, 
    token: string
}

export interface DocumentResult<T> {
    _doc: T;
}

export interface ISendMessage {
    messageContent: string,
    roomName: string
}

export interface IRequest extends Request {
    file?: any
}

export interface IVerify {
    USER: IUser, 
    ROOM: IRoomSocket, 
    MESSAGES: IMessage[], 
    MEMBERIN: Array<Omit<IRoom, 'password' | 'image' | 'participants'>>
    errorMessage: string,
}

export interface IGetInfo {
    roomId: string,
    needOnlineMembers: boolean
}

export interface IRoomSocket extends Omit<IRoom, 'participants'>{
    participants: Array<Omit<IUser, 'password'>>
}

export interface IPopulateParticipants {
    participants: Array<Omit<IUser, 'password'>>
}

export interface IUpdateProfile {
    username: string;
    password: string; 
    repeat_password: string;
}