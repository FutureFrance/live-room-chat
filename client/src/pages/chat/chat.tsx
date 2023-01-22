import { useState, useEffect } from 'react';
import { useNavigate }  from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import { IMessage, IMessageToClient, IUser, IVerify } from '../../interfaces';
import Message from './message';
import ScrollToBottom from 'react-scroll-to-bottom';
import { socket } from '../../socket';
import Rooms from '../../components/rooms';
import SearchBar from '../../components/searchBar';
import OnlineMembers from './onlineUsers';
import MemberTyping from './memberTyping';
import useDebounce from '../../hooks';

const Chat = () => {
    const [typingOn, setTypingOn] = useState<boolean>(false);
    const [memberIsTyping, setMemberIsTyping] = useState<boolean>(false);
    const [memberTypingInfo, setMemberTypingInfo] = useState<Omit<IUser, 'password'>>({} as Omit<IUser, 'password'>);
    const [user, setUser] = useState<string>("");
    const [room, setRoom] = useState<string>("");
    const [messageContent, setMessageContent] = useState<string>("");
    const [messagesList, setMessagesList] = useState<IMessage[]>([{} as IMessage]);
    const [members, setMembers] = useState<Array<IUser>>([]);
    const [messagesLoading, setMessagesLoading] = useState<boolean>(true);
    const [showMembers, setShowMembers] = useState<boolean>(false);
    const [roomMembers, setRoomMembers] = useState<Array<IUser>>([]);
    const [socketError, setSocketError] = useState<string>("");
    const navigate = useNavigate();
    const debounceAction = useDebounce(messageContent, 1500); 

    async function sendMessage() {
        if (messageContent !== "") socket.emit("send_message", messageContent);    
    }

    async function handleActiveTyping(e: React.ChangeEvent<HTMLInputElement>) {
        setMessageContent(e.target.value); 

        if (!typingOn && e.target.value.length > 0) {
            socket.emit("typing_activated");
            setTypingOn(true);
        } else if(e.target.value.length === 0) {
            socket.emit("typing_deactivated");
            setTypingOn(false);
        }
    }

    async function onSubmitMessage(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            sendMessage();
            setTypingOn(false); 
            socket.emit("typing_deactivated");
        }
    }
    
    useEffect(() => {
        if (!socket.connected) socket.connect();
        
        socket.emit("get_info", window.location.pathname.slice(6, 30));
    }, [navigate]);

    useEffect(() => {
        if (typingOn && messageContent.length > 0) socket.emit("typing_activated");
    }, [debounceAction]);

    useEffect(() => {
        const ReceiveMessages = (data: any): void => {
            setMessagesList(prev => [...prev, data.returnMessage]);  
        };

        const SendMessageResponse = (data: IMessageToClient): void => {
            setMessagesList(prev => [...prev, data.returnMessage]); 
            setMessageContent("");
        };

        const WelcomeMessage = (data: IVerify): void  => {
            setMessagesList(data.MESSAGES); 
            setUser(data.USER.username);
            setRoom(data.ROOM.name); 
            setRoomMembers(data.ROOM.participants);

            setMessagesLoading(false);
        }

        const Members = (data: Array<IUser>): void => {
            setMembers(data);
        }

        const DisconnectedMember = (USER: IUser) => {
            setMembers(prev => [...prev.filter((member) => member.username !== USER.username), USER]);
        }

        const HandleError = (data: any) => {
            navigate("/lobby", { replace: true });
            setSocketError(data.errorMessage);
        }

        const MemberIsTyping = (data: Omit<IUser, 'password'>) => {
            setMemberIsTyping(true);
            setMemberTypingInfo(data);
        }

        const MemberIsNotTyping = () => {
            setMemberIsTyping(false);
        }

        socket.on("welcome", WelcomeMessage);
        socket.on("send_message_response", SendMessageResponse); 
        socket.on("receive_messages", ReceiveMessages);
        socket.on("on_error", HandleError);
        socket.on("room_members", Members);
        socket.on("disconnected_member", DisconnectedMember);
        socket.on("member_is_typing", MemberIsTyping);
        socket.on("member_is_not_typing", MemberIsNotTyping);

        socket.on("connect_error", () => navigate("/login", { replace: true }));

        return () => {
            socket.off("welcome"); 
            socket.off("send_message_response");
            socket.off("receive_messages");
            socket.off("member_is_typing");
            socket.off("disconnected_member");
            socket.off("room_members");
            socket.off("member_is_not_typing");
            socket.off("on_error");
            
            socket.off("connect_error");
        }
    }, [socket]);

    return (
        <section className={showMembers ? "lobby" : "lobby_members_off"}>
            <div className='rooms-layout'>
                <Rooms></Rooms>
            </div>
            
            <div className="chat-window">
                <div className="chat_header">
                    <p>Room: {room}</p>
                    <div className="room_header_actions">
                        <PeopleIcon onClick={() => {setShowMembers(prev => !prev)}} className="members_icon" style={{ color: "black" }} />
                        <SearchBar />
                    </div>
                </div>

                <div className="chat-body">
                    <ScrollToBottom className="message-container">
                    { !messagesLoading && messagesList.length === 0
                    ? <p className="chat_info">No message yet in this room be you the first who does it</p>
                    :   <>
                            {!messagesLoading 
                            ?   <>
                                    {messagesList.map((message) => {
                                        return <Message 
                                                    content={message.content} 
                                                    owner={message.owner} 
                                                    id={message._id} current_user={user} 
                                                    date={message.createdAt} 
                                                    key={message._id}
                                                />
                                    })}
                                </>
                            :   <p className="chat_info">Messages are Loading.....</p>
                            }
                        </>
                    }

                    {memberIsTyping && 
                        <MemberTyping memberTypingInfo={memberTypingInfo}/>
                    }
                    </ScrollToBottom>
                </div>
                
                <div className="chat-footer">
                    <input className="message_input" type="text" placeholder="Send mesage..." 
                        onChange={handleActiveTyping}
                        onKeyPress={onSubmitMessage}
                        value={messageContent}
                    />
                </div>
            </div>
            
            { socketError !== "" ? <p className="err">{socketError}</p> : ""}
            
            { showMembers && 
                <div className="online_users">
                    <div className="chat_header">
                        <p>Members</p>
                    </div>

                    <div className="online_users_container">
                        <ScrollToBottom className="members_container">
                            {members.length > 0 
                            ? <OnlineMembers users={members}></OnlineMembers>
                            : ""}
                        </ScrollToBottom>
                    </div>
                </div>
            }
        </section>
    )
}

export default Chat;