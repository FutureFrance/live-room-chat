import { IMessage } from "../../interfaces";
import MessageModel from "../models/MessageModel";

class SocketService {
    static async createMessage(messageContent: string, owner: string, roomId: string): Promise<IMessage | string> {
        const now = new Date();

        const message = await MessageModel.create({
            content: messageContent,
            owner: owner,
            room: roomId,
            createdAt:  now.getHours() + ':' + now.getMinutes()
        }).catch(err => {return `DBUnable to create the message` });

        if (typeof message === 'string') return `DBUnable to create the message`

        await message.populate('owner');

        return message;
    }
}

export default SocketService;