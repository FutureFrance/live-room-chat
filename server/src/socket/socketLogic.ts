import { Socket } from "socket.io";
import { IUser, IRoomSocket, IMessage, IRoom } from "../../interfaces";
import { verifyUser } from "./socketMiddleware";
import SocketService from "./socketService";

let SESSIONS: Array<string> = [];

export function chat(io: any): void {
    io.on("connection", (socket: Socket) => {
        const authorizationToken = socket.data.authorizationToken;

        let USER: IUser;
        let ROOM: IRoomSocket = {} as IRoomSocket;
        let MESSAGES: IMessage[];
        let MEMBERIN: Array<Omit<IRoom, 'password' | 'participants' | 'image'>> = [];
        let sessionRoomConnects: Array<string> = [];
        let isSessionSet = false;
        let isTyping = false;
        
        const getRoomMembers = () => {
            let roomMembersOnline: Array<Omit<IUser, 'password'>> = [];
            let roomMembersOffline: Array<Omit<IUser, 'password'>> = [];

            ROOM.participants.map((member) => SESSIONS.includes(member.username)
            ? roomMembersOnline.push({...member, online: true}) 
            : roomMembersOffline.push({...member, online: false}));

            return [...roomMembersOnline, ...roomMembersOffline];
        }

        const getInfo = async(roomId: string) => {
            try {
                if ( '_id' in ROOM ) socket.leave(String(ROOM._id));
            
                const information = await verifyUser(authorizationToken, roomId);

                [USER, ROOM, MESSAGES, MEMBERIN] = [information.USER, information.ROOM, information.MESSAGES, information.MEMBERIN];
                [socket.data.username, socket.data.image, socket.data.id] = [USER.username, USER.image, USER._id];

                !isSessionSet && SESSIONS.push(USER.username);
                isSessionSet = true;

                socket.emit("welcome", ({ USER, ROOM, MESSAGES }));
                socket.join(String(ROOM._id));

                if (!sessionRoomConnects.includes(String(ROOM._id))) sessionRoomConnects.push(String(ROOM._id));

                const connectedClients = getRoomMembers();

                MEMBERIN.map((room) => {
                    io.sockets.in(String(room._id)).emit("room_members", connectedClients);
                });
            } catch(err: any) {
                err.name === "SocketError"
                    ? socket.emit("on_error", err.message)
                    : socket.emit("on_error", "Server error, please refresh the page");
            }
        }

        const sendMessage = async(data: {messageContent: string, image: string, filename: string, fileSize: number}) => {
            try {
                const imagePath = await SocketService.uploadFile(data.image, data.filename, data.fileSize); 
                const message = await SocketService.createMessage(data.messageContent, USER._id, String(ROOM._id), imagePath);

                socket.emit("send_message_response", { 
                    returnMessage: message, 
                    username: USER.username
                });
                socket.broadcast.to(String(ROOM._id)).emit("receive_messages", { 
                    returnMessage: message, 
                    username: USER.username
                });
            } catch(err: any) {
                err.name === "SocketError"
                    ? socket.emit("on_error", err.message)
                    : socket.emit("on_error", "Server error, please refresh the page");
            }
        }

        const typingActivated = () => {
            isTyping = true;
            socket.broadcast.to(String(ROOM._id)).emit("member_is_typing", USER);
        }

        const typingDeactivated = () => {
            isTyping = false;
            socket.broadcast.to(String(ROOM._id)).emit("member_is_not_typing");
        }
        
        socket.on("get_info", getInfo);    
        socket.on("typing_activated", typingActivated);
        socket.on("typing_deactivated", typingDeactivated);
        socket.on("send_message", sendMessage);

        socket.on("disconnect", () => {
            try {
                const activeSessionCount = SESSIONS.filter(session => session === USER.username).length;

                if (activeSessionCount === 1) {
                    if (isTyping) socket.broadcast.to(String(ROOM._id)).emit("member_is_typing", USER); 

                    MEMBERIN.map((room) => {
                        io.sockets.in(String(room._id)).emit("disconnected_member", {...USER});
                    });
                }
                SESSIONS.splice(SESSIONS.indexOf(USER.username), 1);
            } catch(err: any) {
                socket.emit("on_error", "Could not autorize this user");
            } 
        });
    });
}