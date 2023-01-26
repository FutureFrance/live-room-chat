import { useState, useEffect } from 'react';
import { useNavigate, useLocation }  from 'react-router-dom';
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
import Modal from '../../components/modal';
import RoomActionsModal from '../../components/roomActionsModal';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const Chat = () => {
    const [file, setFile] = useState<File>();
    const [isModal, setIsModal ] = useState<boolean>(false); 
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
    const [socketError, setSocketError] = useState<string>("");
    const debounceAction = useDebounce(messageContent, 1500);
    const location = useLocation();
    const navigate = useNavigate(); 
    // const [roomMembers, setRoomMembers] = useState<Array<IUser>>([]);

    async function sendMessage(image: any) {
        if (messageContent !== "" || image !== "nothing") {
            console.log(image)
            socket.emit("send_message", { messageContent, image, filename: file?.name }); 
        }   
    }

    async function handleActiveTyping(e: React.ChangeEvent<HTMLInputElement>) {
        if (!typingOn && e.target.value.length > 0) {
            socket.emit("typing_activated");
            setTypingOn(true);
        } else if(e.target.value.length === 0 && messageContent.length > 0) {
            socket.emit("typing_deactivated");
            setTypingOn(false);
        }

        setMessageContent(e.target.value); 
    }

    async function onSubmitMessage(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            if (messageContent.length > 0) socket.emit("typing_deactivated");

            if (!file) {
                sendMessage("nothing");
                setTypingOn(false); 
                setFile(undefined);

                return;
            } 
            sendMessage(file);
            setFile(undefined);
        }
    }
    
    useEffect(() => {
        if (!socket.connected) socket.connect();
        
        socket.emit("get_info", location.pathname.slice(6, 30)); // change from react hooks
    }, [navigate]);

    useEffect(() => {
        if (typingOn && messageContent.length > 0) socket.emit("typing_activated");
    }, [debounceAction]);

    useEffect(() => {
        const ReceiveMessages = (data: any): void => { // set types and stuff
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
            // setRoomMembers(data.ROOM.participants);

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
                <Rooms setModal={setIsModal}></Rooms>
            </div>
            
            <div className="chat-window">
                <div className="chat_header">
                    <p>Room: {room}</p>
                    <div className="room_header_actions">
                        <PeopleIcon onClick={() => {
                            setShowMembers(prev => !prev)}} className="members_icon" style={{ color: "black" }} 
                        />
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
                                        return <Message message={message} current_user={user} key={message._id}/>
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
                
                <div className="chat_footer">
                    <div id="chat_file_upload">
                        <label htmlFor="chat_uploader" className="chat_uploader_container">
                            <input id="chat_uploader" 
                                onChange={(e) => {setFile(e.target.files?.[0])}} type="file" 
                                accept=".jpeg,.png.,.jpg,.mp4,.avi" 
                            />
                        </label>
                        <AddCircleIcon className="chat_icon_upload"/>
                    </div>
                    <input className="message_input" type="text" placeholder={`Message in | ${room}`} 
                        onChange={handleActiveTyping}
                        onKeyPress={onSubmitMessage}
                        value={messageContent}
                    />
                </div>
            </div>
            
            { socketError !== "" && <p className="err">{socketError}</p> }
            
            { showMembers && 
                <div className="online_users">
                    <div className="chat_header">
                        <p>Members</p>
                    </div>

                    <div className="online_users_container">
                        <ScrollToBottom className="members_container">
                            {members.length > 0 &&
                                <OnlineMembers users={members}></OnlineMembers>
                            }
                        </ScrollToBottom>
                    </div>
                </div>
            }

        {isModal && 
            <Modal setModalOn={setIsModal}> 
                <RoomActionsModal />
            </Modal>
        }
        </section>
    )
}

export default Chat;