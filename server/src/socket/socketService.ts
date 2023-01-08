import { IMessage } from "../../interfaces";
import MessageModel from "../models/MessageModel";

class SocketService {
    static async createMessage(messageContent: string, owner: string, roomId: string): Promise<IMessage> {
        const now = new Date();

        const message = await MessageModel.create({
            content: messageContent,
            owner: owner,
            room: roomId,
            createdAt:  now.getHours() + ':' + now.getMinutes()
        }).catch(err => {throw new Error(`Unable to create the message ${err}`)});

        return message;
    }
}

export default SocketService;