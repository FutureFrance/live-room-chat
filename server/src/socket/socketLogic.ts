import { Socket } from "socket.io";
import { IUser, IRoomSocket, IMessage } from "../../interfaces";
import { verifyUser } from "./socketMiddleware";
import SocketService from "./socketService";

let SESSIONS: Array<string> = [];

export function chat(io: any): void {
    io.on("connection", (socket: Socket) => {
        const authorizationToken = socket.data.authorizationToken;

        let USER: IUser;
        let ROOM: IRoomSocket = {} as IRoomSocket;
        let MESSAGES: IMessage[];
        let sessionRoomConnects: Array<string> = [];
        let isSessionSet = false;
        
        const getRoomMembers = async() => {
            let sockets = await io.in(String(ROOM._id)).fetchSockets();

            let OnlineUsernames: Array<string> = [];
            let roomMembersOnline: Array<Omit<IUser, 'password'>> = [];
            let roomMembersOffline: Array<Omit<IUser, 'password'>> = [];

            sockets.map((conn: Socket) => !OnlineUsernames.includes(conn.data.username) && OnlineUsernames.push(conn.data.username));

            ROOM.participants.map((member) => OnlineUsernames.includes(member.username) 
            ? roomMembersOnline.push({...member, online: true}) 
            : roomMembersOffline.push({...member, online: false}));

            return [...roomMembersOnline, ...roomMembersOffline];
        }

        const getInfo = async(roomId: string) => {
            if ( '_id' in ROOM ) socket.leave(String(ROOM._id));
            
            const information = await verifyUser(authorizationToken, roomId);

            if (information.errorMessage !== "none") {
                return socket.emit("on_error", information.errorMessage);
            }

            [USER, ROOM, MESSAGES] = [information.USER, information.ROOM, information.MESSAGES];

            socket.data.username = USER.username;
            socket.data.image = USER.image;
            socket.data.id = USER._id;

            socket.emit("welcome", ({ USER, ROOM, MESSAGES }));
            socket.join(String(ROOM._id));

            if (!sessionRoomConnects.includes(String(ROOM._id))) sessionRoomConnects.push(String(ROOM._id));

            const connectedClients = await getRoomMembers();

            io.sockets.in(String(ROOM._id)).emit("room_members", connectedClients);
            
            !isSessionSet && SESSIONS.push(USER.username);

            isSessionSet = true;
        }

        const sendMessage = async(messageContent: string) => {
            const message = await SocketService.createMessage(messageContent, USER._id, String(ROOM._id));

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
        
        socket.on("get_info", getInfo);    
        socket.on("send_message", sendMessage);

        socket.on("disconnect", async() => {
            try {
                const activeSessionCount = SESSIONS.filter(session => session === USER.username).length;

                if ( activeSessionCount === 1) {
                    for (let i = 0; i < sessionRoomConnects.length; i++) {
                        socket.broadcast.to(sessionRoomConnects[i]).emit("disconnected_member", {...USER});
                    } 
                } 

                activeSessionCount > 1 && SESSIONS.splice(SESSIONS.indexOf(USER.username), 1);
            } catch(err: unknown) {}
        });
    });
}