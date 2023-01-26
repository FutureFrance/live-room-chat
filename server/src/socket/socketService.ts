import { IMessage } from "../../interfaces";
import MessageModel from "../models/MessageModel";
import fs from 'fs';

class SocketService {
    static async createMessage(messageContent: string, owner: string, roomId: string, file: string): Promise<Omit<IMessage, 'owner'> | string> {
        //if (messageContent.length === 0 && file === "none") // gotta not create this cause message is empty
        
        const now = new Date();

        const message = await MessageModel.create({
            content: messageContent,
            file: file,
            owner: owner,
            room: roomId,
            createdAt: now.getHours() + ':' + now.getMinutes()
        }).catch(err => {return `DBUnable to create the message` });

        if (typeof message === 'string') return `DBUnable to create the message`;

        await message.populate('owner', {password: 0}); // gotta remove password

        return message;
    }

    static uploadFile(file: string, filename: string): string {
        const whitelist = ['jpeg', 'png', 'jpg', 'mp4', 'avi']; // do file sanitization size 

        try {
            if (!whitelist.includes(filename.split('.')[1]) || filename.split('.').length !== 2) {
                console.log("invalid file format"); // gotta throw error here
                return "none";
            }
    
            let imagePath = `${Date.now() + filename}`;
    
            fs.writeFile('./static/' + imagePath, file, (err) => {
                if (err) console.log("Error occurred while trying to write the file to disk");
                
                console.log("The file has been saved!");
            });
    
            return imagePath;
        } catch(err) {
            return "none";
        }
        
    }
}

export default SocketService;