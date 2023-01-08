import fs from 'fs';
import { ApiError } from "../errorHandlers/apiErrorHandler";
import RoomModel from "../models/RoomModel";

class StaticService {
    async uploadImage(imagePath: string, roomName: string, ownerId: string): Promise<boolean> {
        const room = await RoomModel.findOne({name: roomName, owner: ownerId}, {password: 0})
        .catch(err => {throw ApiError.BadRequest(500, "Fatal error ocurred while trying to search for the room")});

        if (!room) throw ApiError.BadRequest(400, "This room does not exist or you're not the owner");

        if (room.image.length > 2) {
            console.log("Imagepath: ", imagePath)
            const pathToDelete = './static/' + imagePath;
            console.log("WTF")
            fs.unlink(pathToDelete, (err) => {
                if (err) throw ApiError.BadRequest(500, "Fatal error, unable to delete the file");
            });
        }
        room.image = imagePath;

        await room.save();

        return true;
    }

    async removeImage(imagePath: string): Promise<void> {
        const pathToDelete = './static/' + imagePath;

        fs.unlink(pathToDelete, (err) => {
            if (err) throw ApiError.BadRequest(400, "Unable to delete this image");
        });
    }
}

export const staticService = new StaticService();