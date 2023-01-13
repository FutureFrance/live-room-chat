import { Socket } from "socket.io";
import { IUser, IRoom, IMessage } from "../../interfaces";
import { verifyUser } from "./socketMiddleware";
import SocketService from "./socketService";

export function chat(io: any): void {
    io.on("connection", (socket: Socket) => {
        const authorizationToken = socket.data.authorizationToken;

        let USER: IUser;
        let ROOM: IRoom = {} as IRoom;
        let MESSAGES: IMessage[];

        const getInfo = async(roomId: string) => {
            if ( '_id' in ROOM ) socket.leave(String(ROOM._id));
            
            const information = await verifyUser(authorizationToken, roomId);
            
            if (information.errorMessage !== "none") return socket.emit("on_error", information.errorMessage);
            
            [USER, ROOM, MESSAGES] = [information.USER, information.ROOM, information.MESSAGES];

            socket.emit("welcome", ({ USER, ROOM, MESSAGES }));
            socket.join(String(ROOM._id));
        }

        const sendMessage = async(messageContent: string) => {
            const message = await SocketService.createMessage(messageContent, USER._id, String(ROOM._id));

            if (message === 'DBUnable to create the message') return socket.emit("on_error", message);

            socket.emit("send_message_response", { 
                returnMessage: message, 
                username: USER.username
            });
            socket.broadcast.to(String(ROOM._id)).emit("receive_messages", { 
                returnMessage: message, username: USER.username
            });
        }
        
        socket.on("get_info", getInfo);    
        socket.on("send_message", sendMessage);

        socket.on("disconnect", (): void => {
            console.log("Client has disconnected");
        });
    });
}