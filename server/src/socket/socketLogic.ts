import { Socket } from "socket.io";
import { IUser, IRoom, IMessage } from "../../interfaces";
import { verifyUser } from "./socketMiddleware";
import SocketService from "./socketService";

export function chat(io: any): void {
    io.on("connection", (socket: Socket) => {
        const authorizationToken = socket.data.authorizationToken;

        let USER: IUser;
        let ROOM: IRoom;
        let MESSAGES: IMessage[];
        let CURRENT_ROOM: string = "empty";

        socket.on("get_info", async(roomId: string) => {
            if ( CURRENT_ROOM !== "empty") socket.leave(CURRENT_ROOM);
            
            const information = await verifyUser(authorizationToken, roomId);
            
            USER = information.USER;
            ROOM = information.ROOM;
            MESSAGES = information.MESSAGES;

            socket.emit("welcome", ({ USER, ROOM, MESSAGES }));
            socket.join(String(ROOM._id));

            CURRENT_ROOM = String(ROOM._id);
        });    

        socket.on("send_message", async(messageContent: string) => {
            const message = await SocketService.createMessage(messageContent, USER._id, String(ROOM._id));

            socket.emit("send_message_response", { returnMessage: message, username: USER.username});
            socket.broadcast.to(String(ROOM._id)).emit("receive_messages", { returnMessage: message, username: USER.username});
        });

        socket.on("disconnect", () => {
            console.log("Client has disconnected");
        });
    });
}