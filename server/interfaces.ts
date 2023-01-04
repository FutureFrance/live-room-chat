import { LeanDocument, Types } from "mongoose"

export interface IUser {
    username: string,
    password: string
}

export interface IRoom {
    _id: Types.ObjectId,
    name: string,
    owner: Types.ObjectId,
    password: string,
    participants: Array<Types.ObjectId>
}

export interface IMessage {
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
