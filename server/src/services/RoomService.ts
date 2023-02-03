import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';
import { ApiError } from "../errorHandlers/apiErrorHandler";
import { IMessage, IRoom } from '../interfaces';
import RoomModel from "../models/RoomModel";
import UserModel from '../models/UserModel';
import MessageModel from '../models/MessageModel';

dotenv.config();

const SALT = process.env.SALT as string;

class RoomService {
    async create(room_name: string, room_password: string, room_repeated_password: string, user: string): Promise<Omit<IRoom, 'password'|'image'>> {
        const isRoom = await RoomModel.findOne({name: room_name}, {password: 0}, {image: 0, nameChanges: 0})
        .catch(() => {throw ApiError.BadRequest(500, "Fatal error trying to find this room")});

        if (isRoom) throw ApiError.BadRequest(400, "This room is already registered");

        if (room_password !== room_repeated_password) throw ApiError.BadRequest(400, "Passwords do not match");

        const passwordHash = await bcrypt.hash(room_password, parseInt(SALT));

        const room = await RoomModel.create({
            name: room_name,
            password: passwordHash,
            owner: new ObjectId(user),
            participants: [new ObjectId(user)]
        }).catch(err => {throw ApiError.BadRequest(500, "Fatal error when trying to create the room")});

        const {password, ...returnRoom} = room.toObject();

        return returnRoom;
    }

    async join(room_name: string, room_password: string, userId: string): Promise<Omit<IRoom, 'password'|'image'>> {
        const room = await RoomModel.findOne({name: room_name}, {image: 0, nameChanges: 0})
        .catch(() => {throw ApiError.BadRequest(500, "Fatal error trying to search for this room")});

        if (!room) throw ApiError.BadRequest(400, "There is no such room");

        const {password, ...returnRoom} = room.toObject();
        
        const user = await UserModel.findOne({_id: userId})
        .catch(() => {throw ApiError.BadRequest(500, "Fatal error could not find this user")});

        if (!user) throw ApiError.BadRequest(400, "This user does not exist");

        if (room.participants.includes(new Types.ObjectId(userId))) return returnRoom;

        const passwordMatches = await bcrypt.compare(room_password, room.password);

        if (!passwordMatches) throw ApiError.BadRequest(400, "Invalid credentials");

        room.participants.push(new Types.ObjectId(userId));

        await room.save();

        return returnRoom;
    }

    async getMemberOf(userId: string): Promise<Omit<IRoom[], 'password'|'participants'>> {
        const rooms = await RoomModel.find({participants: userId}, {password: 0, participants: 0})
        .catch(() => {throw ApiError.BadRequest(500, "Fatal error ocurred when trying to find rooms")});

        return rooms;
    }

    async getFilteredMessages(query: string, roomId: string, userId: string): Promise<IMessage[]> {
        const inRoom = await RoomModel.findOne({
            _id: roomId,
            participants: new ObjectId(userId)
        }).catch(err => { throw ApiError.BadRequest(500, "Fatal error occured while trying to find this room")});

        if (!inRoom) throw ApiError.BadRequest(400, "User is not a member of this room");
  
        const filteredMessages = await MessageModel.find({
            room: new ObjectId(roomId),
            content: { $regex: `.*${query}.*`, $options: 'i'} // should do some character escaping like ?
        }).populate('owner', {password: 0, _id: 0})
        .catch(() => { throw ApiError.BadRequest(500, `Fatal error trying to fetch the messages`)});

        return filteredMessages;
    }

    async updateRoomName(userId: string, newName: string, roomId: string): Promise<string> {
        const room = await RoomModel.findOne({owner: userId, _id: roomId})
        .catch(() => { throw ApiError.BadRequest(500, "Fatal error occurred when trying to update this room")});

        if (!room) throw ApiError.BadRequest(400, "Unable to update this room");
        if (newName === room.name) throw ApiError.BadRequest(400, "This is the current room name");
        if (room.nameChanges === 3) throw ApiError.BadRequest(400, "You cant change the room name anymore");

        room.name = newName;
        room.nameChanges = room.nameChanges! + 1;

        await room.save();

        return room.name;
    }

    async updateRoomPassword(userId: string, roomId: string, current_password: string, roomPassword: string, roomRepeatPassword: string): Promise<void> {
        if (roomPassword !== roomRepeatPassword) throw ApiError.BadRequest(400, "Passwords do not match");

        const room = await RoomModel.findOne({owner: userId, _id: roomId})
        .catch(() => { throw ApiError.BadRequest(500, "Fatal error occurred when searching for this room")});

        if (!room) throw ApiError.BadRequest(400, "Unable to find this room");

        const hashMatches = await bcrypt.compare(current_password, room.password);
        
        if (!hashMatches) throw ApiError.BadRequest(400, "Incorrect password");

        const passwordHash = await bcrypt.hash(roomPassword, parseInt(SALT));

        room.password = passwordHash;

        await room.save();
    }
}

export const roomService = new RoomService();
