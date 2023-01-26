import fs from 'fs';
import { ApiError } from "../errorHandlers/apiErrorHandler";
import MessageModel from '../models/MessageModel';
import RoomModel from "../models/RoomModel";
import UserModel from '../models/UserModel';

class StaticService {
    async uploadRoomImage(imagePath: string, roomName: string, ownerId: string): Promise<boolean> {
        const room = await RoomModel.findOne({name: roomName, owner: ownerId}, {password: 0})
        .catch(err => {throw ApiError.BadRequest(500, "Fatal error ocurred while trying to search for the room")});

        if (!room) throw ApiError.BadRequest(400, "This room does not exist or you're not the owner");

        if (room.image.length > 5) {
            const pathToDelete = './static/' + imagePath;

            fs.unlink(pathToDelete, (err) => {
                if (err) throw ApiError.BadRequest(500, "Fatal error, unable to delete the file");
            });
        }
        room.image = imagePath;

        await room.save();

        return true;
    }

    async uploadProfileImage(userId: string, imagePath: string): Promise<boolean> {
        const user = await UserModel.findOne({_id: userId})
        .catch(err => {throw ApiError.BadRequest(500, "Fatal error while trying to find user")});

        if (!user) throw ApiError.BadRequest(400, "There is no such user");

        if (user.image.length > 5) {
            const pathToDelete = './static/' + user.image; 

            fs.unlink(pathToDelete, (err) => {
                if (err) throw ApiError.BadRequest(500, "Fatal error, unable to delete the file");
            })
        }
        user.image = imagePath;

        await user.save();

        return true;
    }

    async removeImage(imagePath: string): Promise<void> {
        const pathToDelete = `./static/` + imagePath;

        fs.unlink(pathToDelete, (err) => {
            if (err) throw ApiError.BadRequest(400, "Unable to delete this image");
        });
    }
}

export const staticService = new StaticService();