import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { ITokenPayload, IPopulateParticipants } from '../interfaces';
import MessageModel from "../models/MessageModel";
import RoomModel from "../models/RoomModel";
import UserModel from "../models/UserModel";
import { IVerify } from "../interfaces";
import { SocketError } from './errorHandling';

dotenv.config();

const ACCESSKEY = process.env.ACCESSKEY as string;

export const verifyUser = async (token: string, room_id: string): Promise<IVerify> => {
    try {
        const isValid = jwt.verify(token, ACCESSKEY) as ITokenPayload;

        if (!isValid) throw new SocketError("Session Expired");
        
        const clientId = isValid.id;

        const USER = await UserModel.findOne({_id: clientId}, {password: 0}).lean()
        .catch(() => { throw new SocketError("Fatal error occurred when searching this user") });
        
        if (!USER) throw new SocketError("This user could not be found");

        const ROOM = await RoomModel.findOne({_id: room_id, participants: clientId}, {password: 0})
        .populate<IPopulateParticipants>('participants', {password: 0}).lean()
        .catch(() => { throw new SocketError("Fatal error occurred when searching for room") });
        
        if (!ROOM) throw new SocketError("User is not a member of this room");

        const MEMBERIN = await RoomModel.find({participants: USER._id}, {password: 0, participants: 0, image: 0}).lean()
        .catch(() => { throw new SocketError("Fatal error, unable to find rooms in which this is user is in") });
        
        const MESSAGES = await MessageModel.find({room: ROOM._id}).populate('owner', {password: 0, _id: 0})
        .catch(() => { throw new SocketError("Fatal error occurred when searching for messages in this room") });

        return { USER, ROOM, MESSAGES, MEMBERIN }
    } catch(err: any) {
        return {    
            USER: {_id: "", username: "", password: "", image: ""}, 
            ROOM: {_id: "", name: "", owner: new Types.ObjectId(), password: "", participants: [], image: ""}, 
            MESSAGES: [{_id: new Types.ObjectId(), owner: new Types.ObjectId(), room: new Types.ObjectId()}], 
            MEMBERIN: [{_id: new Types.ObjectId(), name: "", owner: new Types.ObjectId()}],
        }
    }
}