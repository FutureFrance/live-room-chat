import { Types } from 'mongoose';
import { Request } from 'express';

export interface IUser {
    _id: string
    username: string,
    password: string
}

export interface IRoom {
    _id: Types.ObjectId,
    name: string,
    owner: Types.ObjectId,
    password: string,
    participants: Array<Types.ObjectId>,
    image: string
}

export interface IMessage {
    _id: Types.ObjectId,
    owner: Types.ObjectId,
    room: Types.ObjectId
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