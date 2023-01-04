import { IMessage } from "../../interfaces";
import MessageModel from "../models/MessageModel";

class SocketService {
    static async createMessage(messageContent: string, owner: string, roomId: string): Promise<IMessage> {
        const message = await MessageModel.create({
            content: messageContent,
            owner: owner,
            room: roomId
        }).catch(err => {throw new Error("Unable to create the message")});

        return message;
    }
}

export default SocketService;