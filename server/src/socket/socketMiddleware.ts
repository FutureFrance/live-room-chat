import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { ITokenPayload } from '../../interfaces';
import MessageModel from "../models/MessageModel";
import RoomModel from "../models/RoomModel";
import UserModel from "../models/UserModel";

dotenv.config();

const ACCESSKEY = process.env.ACCESSKEY as string;

export const verifyUser = async (token: string, room_id: string) => {
    try {
        const isValid = jwt.verify(token, ACCESSKEY) as ITokenPayload;

        if (!isValid) throw new Error("Invalid TOKEN");
        
        const clientId = isValid.id;

        const USER = await UserModel.findOne({_id: clientId}, {password: 0})
        .catch(err => {throw new Error("Fatal error when searching for user")});

        if (!USER) throw new Error("This user could not be found");

        const ROOM = await RoomModel.findOne({_id: room_id, participants: clientId}, {password: 0})
        .catch(err => {throw new Error("Fatal error when searching for room")});

        if (!ROOM) throw new Error("User is not a member of this room");

        const MESSAGES = await MessageModel.find({room: ROOM._id}).lean()
        .catch(err => {throw new Error("Fatal error when searching for messages in this room")});
        
        let userIds = MESSAGES.map(message => String(message.owner));

        for (let i = 0; i < userIds.length; i++) {
            const owner = await UserModel.findOne({_id: userIds[i]}, { password: 0 })
            .catch(err => {throw new Error("Fatal error in finding user")});

            if (owner) {
                userIds.map(userId => userIds[i] === userId ? userIds[i] = owner.username : userId);
            }
        }

        MESSAGES.forEach((message: any, index: number) => {
            message.nickname = userIds[index];
        });

        return { USER, ROOM, MESSAGES};
    } catch(err: any) {
        console.log("ERRRRR", err);
        throw new Error(err);
    }
}