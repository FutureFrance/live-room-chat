import fs from 'fs';
import sharp from 'sharp';
import { ApiError } from "../errorHandlers/apiErrorHandler";
import RoomModel from "../models/RoomModel";
import UserModel from '../models/UserModel';

sharp.cache({ files : 0 });

class StaticService {
    async uploadRoomImage(imagePath: string, roomName: string, ownerId: string, buffer: Buffer): Promise<boolean> {
        const currentPath = './static/' + imagePath;  

        const room = await RoomModel.findOne({name: roomName, owner: ownerId}, {password: 0})
        .catch(() => {throw ApiError.BadRequest(500, "Fatal error ocurred while trying to search for the room")});

        if (!room) throw ApiError.BadRequest(400, "This room does not exist or you're not the owner");

        await sharp(buffer).resize().jpeg({ quality: 69 }).toFile(currentPath);

        if (room.image.length > 5) { // look for handling errors maybe better here
            fs.unlink(`./static/${room.image}`, (err: any) => {
                if (err) console.log("Unable to delete file", err);
            });
        }
        room.image = imagePath;

        await room.save();
        
        return true;
    }

    async uploadProfileImage(userId: string, imagePath: string, buffer: Buffer): Promise<boolean> {
        const currentPath = './static/' + imagePath;

        const user = await UserModel.findOne({_id: userId})
        .catch(() => {throw ApiError.BadRequest(500, "Fatal error while trying to find user")});

        if (!user) throw ApiError.BadRequest(400, "There is no such user");

        await sharp(buffer).resize().jpeg({ quality: 69 }).toFile(currentPath);

        if (user.image.length > 5) { // look for handling errors maybe better here
            fs.unlink(`./static/${user.image}`, (err: any) => {
                if (err) console.log("Unable to delete file", err);
            });
        }
        user.image = imagePath;

        await user.save();
        
        return true;
    }

    async removeImage(imagePath: string): Promise<void> {
        if (fs.existsSync(`./static/${imagePath}`)) {
            const pathToDelete = `./static/` + imagePath;

            fs.unlink(pathToDelete, (err) => {
                if (err) throw ApiError.BadRequest(400, "Unable to delete this image");
            });
        }   
    }
}

export const staticService = new StaticService();