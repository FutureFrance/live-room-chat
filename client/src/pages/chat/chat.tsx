import "./styles.css";
import { useState, useEffect } from 'react';
import { useNavigate, useLocation }  from 'react-router-dom';
import ScrollToBottom from 'react-scroll-to-bottom';
import { socket } from '../../socket';
import { IMessage, IMessageToClient, IUser, IVerify } from '../../interfaces';
import useDebounce from '../../hooks/hooks';
import Message from './message';
import Rooms from '../../components/rooms';
import SearchBar from '../../components/searchBar';
import OnlineMembers from './onlineUsers';
import MemberTyping from './memberTyping';
import Modal from '../../components/modal';
import RoomActionsModal from '../../components/roomActionsModal';
import PeopleIcon from '@mui/icons-material/People';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SendIcon from '@mui/icons-material/Send';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import NewReleasesIcon from '@mui/icons-material/NewReleases';

const isImage = ['png', 'jpg', 'jpeg'];
const isVideo = ['mp4', 'avi'];

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
    const [chatErrorModal, setChatErrorModal] = useState<boolean>(false);
    const [socketError, setSocketError] = useState<string>("");
    const debounceAction = useDebounce(messageContent, 1500);
    const location = useLocation();
    const navigate = useNavigate(); 

    function sendMessage() {
        if (messageContent !== "" || file) { 
            let validateResponse: string = "";

            if (file !== undefined) {
                validateResponse = validateMessage(file); 

                if ( validateResponse.length > 1) {
                    setChatErrorModal(true);
                    setSocketError(validateResponse);
                    return;
                }  
            }
            socket.emit("send_message", { messageContent, image: file, filename: file?.name, fileSize: file?.size });     
        }   
    }

    function validateMessage(buffer: File) {
        const fileExtension = buffer.name.split('.')[1];

        if (!isVideo.includes(fileExtension) && !isImage.includes(fileExtension)) return "Invalid file format";
        if (isVideo.includes(fileExtension) && buffer.size > 21000000) return "Video size can't be larger then 20MB";
        if (isImage.includes(fileExtension) && buffer.size > 5100000) return "Image size cant be higher then 5MB";
        if (messageContent.length > 1000) return "Message can't have more than 1000 characters";

        return "";
    }

    function handleActiveTyping(e: React.ChangeEvent<HTMLInputElement>) {
        if (!typingOn && e.target.value.length > 0) {
            socket.emit("typing_activated");
            setTypingOn(true);
        } else if(e.target.value.length === 0 && messageContent.length > 0) {
            socket.emit("typing_deactivated");
            setTypingOn(false);
        }

        setMessageContent(e.target.value); 
    }

    function onSubmitMessage() {
        if (messageContent.length > 0) socket.emit("typing_deactivated");

        if (!file) {
            sendMessage();
            setTypingOn(false); 

            return;
        } 
        sendMessage();
        setFile(undefined);
    }
    
    useEffect(() => {
        if (!socket.connected) socket.connect();
        
        socket.emit("get_info", location.pathname.slice(6, 30)); 
    }, [navigate]);

    useEffect(() => {
        if (typingOn && messageContent.length > 0) socket.emit("typing_activated");
    }, [debounceAction]);

    useEffect(() => {
        const ReceiveMessages = (data: IMessageToClient): void => { // set types and stuff
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

            setMessagesLoading(false);
        }

        const Members = (data: Array<IUser>): void => {
            setMembers(data);
        }

        const DisconnectedMember = (USER: IUser): void => {
            setMembers(prev => [...prev.filter((member) => member.username !== USER.username), USER]);
        }

        const MemberIsTyping = (data: Omit<IUser, 'password'>): void => {
            setMemberIsTyping(true);
            setMemberTypingInfo(data);
        }

        const MemberIsNotTyping = (): void => {
            setMemberIsTyping(false);
        }

        const HandleError = (data: string): void => {
            if (data === "Session Expired") navigate("/login", {replace: true});

            setChatErrorModal(true);
            setSocketError(data);
        }

        socket.on("welcome", WelcomeMessage);
        socket.on("send_message_response", SendMessageResponse); 
        socket.on("receive_messages", ReceiveMessages);
        socket.on("on_error", HandleError);
        socket.on("room_members", Members);
        socket.on("disconnected_member", DisconnectedMember);
        socket.on("member_is_typing", MemberIsTyping);
        socket.on("member_is_not_typing", MemberIsNotTyping);

        socket.on("connect_error", (data) => console.log("connect error:", data));

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
            
            <div className="chat_window">
                <div className="chat_header">
                    <p>{room}</p>
                    <div className="room_header_actions">
                        <PeopleIcon className="members_icon" onClick={() => setShowMembers(prev => !prev)} />
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
                        memberTypingInfo.username !== user && <MemberTyping memberTypingInfo={memberTypingInfo}/>
                    }
                    {file !== undefined && 
                        <div className="upload_file_placeholder_chat">
                            <div className="image_placeholder_overlay">
                                <DeleteForeverIcon className="remove_image_placeholder_chat"
                                    onClick={() => setFile(undefined)} 
                                />
                                
                                {isVideo.includes(file.name.split('.')[1]) 
                                    ?<img src={`http://${process.env.REACT_APP_HOSTNAME}:3003/static/videoIcon.png`} alt="file to upload"/>
                                    :<img src={URL.createObjectURL(file)} alt="file to upload" />
                                }
                                <div className="over"><h5>{file.name}</h5></div>                   
                            </div>
                        </div>
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
                        onKeyPress={(e) => {e.key === "Enter" && onSubmitMessage()}}
                        value={messageContent}
                    />

                    <div className="mobile_send_btn_container">
                        <SendIcon onClick={onSubmitMessage} className="mobile_send_btn"></SendIcon>
                    </div>
                </div>
            </div>
            
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

        {chatErrorModal && 
            <Modal setModalOn={setChatErrorModal}>
                <>
                    <section className="message_submit_error_modal">
                        <NewReleasesIcon className="message_error_icon_modal" sx={{width: "75px", height: "75px"}}/>
                        <h2>Oops Something Happened :|</h2>
                        <p className="message_submit_error">{socketError}</p>
                    </section>
                    <div className="bottom_overlay">
                        <button onClick={() => setChatErrorModal(false)}>I understand</button>
                    </div>
                </>
            </Modal>  
        }
        </section>
    )
}

export default Chat;