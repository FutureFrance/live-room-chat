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
        let MEMBERIN: Array<Omit<IRoom, 'password' | 'participants' | 'image'>>
        let sessionRoomConnects: Array<string> = [];
        let isSessionSet = false;
        
        const getRoomMembers = async() => {
            let roomMembersOnline: Array<Omit<IUser, 'password'>> = [];
            let roomMembersOffline: Array<Omit<IUser, 'password'>> = [];

            ROOM.participants.map((member) => SESSIONS.includes(member.username)
            ? roomMembersOnline.push({...member, online: true}) 
            : roomMembersOffline.push({...member, online: false}));

            return [...roomMembersOnline, ...roomMembersOffline];
        }

        const getInfo = async(roomId: string) => {
            if ( '_id' in ROOM ) socket.leave(String(ROOM._id));
            
            const information = await verifyUser(authorizationToken, roomId);

            if (information.errorMessage !== "none") return socket.emit("on_error", information.errorMessage);

            [USER, ROOM, MESSAGES, MEMBERIN] = [information.USER, information.ROOM, information.MESSAGES, information.MEMBERIN];

            !isSessionSet && SESSIONS.push(USER.username);
            isSessionSet = true;

            socket.data.username = USER.username;
            socket.data.image = USER.image;
            socket.data.id = USER._id;

            socket.emit("welcome", ({ USER, ROOM, MESSAGES }));
            socket.join(String(ROOM._id));

            if (!sessionRoomConnects.includes(String(ROOM._id))) sessionRoomConnects.push(String(ROOM._id));

            const connectedClients = await getRoomMembers();

            MEMBERIN.map((room) => {
                io.sockets.in(String(room._id)).emit("room_members", connectedClients);
            });
        }

        const sendMessage = async(messageContent: string, isFile: false) => {
            // if were here and he didnt joined i ll get error crash undefined id
            const message = await SocketService.createMessage(messageContent, USER._id, String(ROOM._id), isFile);

            if (message === 'DBUnable to create the message') return socket.emit("on_error", message);

            socket.emit("send_message_response", { 
                returnMessage: message, 
                username: USER.username
            });
            socket.broadcast.to(String(ROOM._id)).emit("receive_messages", { 
                returnMessage: message, 
                username: USER.username
            });
        }

        const typingActivated = async() => {
            socket.broadcast.to(String(ROOM._id)).emit("member_is_typing", USER);
        }

        const typingDeactivated = async() => {
            socket.broadcast.to(String(ROOM._id)).emit("member_is_not_typing");
        }
        
        socket.on("get_info", getInfo);    
        socket.on("typing_activated", typingActivated);
        socket.on("typing_deactivated", typingDeactivated);
        socket.on("send_message", sendMessage);

        socket.on("disconnect", async() => {
            try {
                const activeSessionCount = SESSIONS.filter(session => session === USER.username).length;

                if ( activeSessionCount === 1) {
                    MEMBERIN.map((room) => {
                        io.sockets.in(String(room._id)).emit("disconnected_member", {...USER});
                    });
                } 

                SESSIONS.splice(SESSIONS.indexOf(USER.username), 1);
            } catch(err: unknown) {}
        });
    });
}