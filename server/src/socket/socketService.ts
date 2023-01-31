import fs from 'fs';
import * as cp from 'node:child_process';
import sharp from 'sharp';
const join = require('path').join;
import { IMessage } from "../../interfaces";
import MessageModel from "../models/MessageModel";
import { SocketError } from './errorHandling';

sharp.cache({ files : 0 });

class SocketService {
    static async createMessage(messageContent: string, owner: string, roomId: string, file: string): Promise<Omit<IMessage, 'owner'>> {
        if (messageContent.length === 0 && file === "") throw new SocketError("Cannot create an empty message");
        if (messageContent.length > 1000) throw new SocketError("Message can't be longer than 1000 characters");

        const now = new Date();

        const message = await MessageModel.create({
            content: messageContent,
            file: file,
            owner: owner,
            room: roomId,
            createdAt: now.getHours() + ':' + now.getMinutes()
        }).catch(() => { throw new SocketError("Fatal error, Unable to create the message, please try again") });

        await message.populate('owner', {password: 0});

        return message;
    }

    static async uploadFile(buffer: string, filename: string, fileSize: number): Promise<string> {
        if (filename === undefined) return "";

        const whitelist = ['jpeg', 'png', 'jpg', 'mp4', 'avi'];
        const isImage = ['jpeg', 'png', 'jpg'];
        const isVideo = ['avi', 'mp4'];
        const fileExt = filename.split('.')[1];

        if (!whitelist.includes(fileExt) || filename.split('.').length !== 2) throw new SocketError("Invalid file format");
        
        if (isVideo.includes(fileExt) && fileSize > 21000000) throw new SocketError("Video size can't be larger then 20MB");
        if (isImage.includes(fileExt) && fileSize > 5100000) throw new SocketError("Image size cant be higher then 5MB");
        
        let imagePath = `${Date.now() + filename}`;

        if (isImage.includes(fileExt)) { 
            await sharp(buffer).resize().jpeg({ quality: 69 }).toFile(`./static/${imagePath}`);
        } else { 
            fs.writeFile(`./static/${imagePath}`, buffer, (err) => {
                if (err) throw new SocketError("Unable to upload this file"); 
            });

            const child = cp.fork(join(__dirname, './compressVideo'));

            child.send({ tempFilePath: `./static/${imagePath}`, fileName: filename });

            child.on("message", (message: string) => {      
                if (message === "Compressing Error") throw new Error("Unable to upload the file");
            });
        }
        return imagePath;        
    }
}

export default SocketService;