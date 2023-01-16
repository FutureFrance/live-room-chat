import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { ITokenPayload, IPopulateParticipants } from '../../interfaces';
import MessageModel from "../models/MessageModel";
import RoomModel from "../models/RoomModel";
import UserModel from "../models/UserModel";
import { IVerify } from "../../interfaces";

dotenv.config();

const ACCESSKEY = process.env.ACCESSKEY as string;

export const verifyUser = async (token: string, room_id: string): Promise<IVerify> => {
    try {
        const isValid = jwt.verify(token, ACCESSKEY) as ITokenPayload;

        if (!isValid) throw { errorMessage: "Invalid TOKEN" }
        
        const clientId = isValid.id;

        const USER = await UserModel.findOne({_id: clientId}, {password: 0}).lean()
        .catch(err => { throw { errorMessage: "Fatal error when searching for user" }});
        
        if (!USER) throw { errorMessage: "This user could not be found" };

        const ROOM = await RoomModel.findOne({_id: room_id, participants: clientId}, {password: 0})
        .populate<IPopulateParticipants>('participants', {password: 0}).lean()
        .catch(err => { throw { errorMessage: "Fatal error when searching for room" }});
        
        if (!ROOM) throw { errorMessage: "User is not a member of this room" }
        
        const MESSAGES = await MessageModel.find({room: ROOM._id}).populate('owner', {password: 0, _id: 0})
        .catch(err => { throw { errorMessage: "Fatal error when searching for messages in this room" }});

        return { USER, ROOM, MESSAGES, errorMessage: "none" }
    } catch(err: any) {
        return {    
            USER: {_id: "", username: "", password: "", image: ""}, 
            ROOM: {_id: "", name: "", owner: new Types.ObjectId(), password: "", participants: [], image: ""}, 
            MESSAGES: [{_id: new Types.ObjectId(), owner: new Types.ObjectId(), room: new Types.ObjectId()}], 
            errorMessage: err, 
        }
    }
}