import { useState, useEffect } from 'react';
import { useNavigate }  from 'react-router-dom';
import { IMessage, IMessageToClient } from '../interfaces';
import Message from './message';
import ScrollToBottom from 'react-scroll-to-bottom';
import { socket } from '../socket';
import Rooms from '../components/rooms';

const Chat = () => {
    const [user, setUser] = useState<string>("");
    const [room, setRoom] = useState<string>("");
    const [messageContent, setMessageContent] = useState<string>("");
    const [messagesList, setMessagesList] = useState<IMessage[]>([{} as IMessage]);
    const [messagesLoading, setMessagesLoading] = useState<boolean>(true);
    const [socketError, setSocketError] = useState<string>("");
    const navigate = useNavigate();

    async function sendMessage() {
        console.log(`User: ${user} is sending the message: ${messageContent}`);
        if (messageContent !== "") socket.emit("send_message", messageContent);    
    }
    
    useEffect(() => {
        if (!socket.connected) socket.connect();

        socket.emit("get_info", window.location.pathname.slice(6, 30));
    }, [navigate]);

    useEffect(() => {
        const ReceiveMessages = (data: any): void => {
            console.log(`Receiving messages from other users data:`, data)
            data.returnMessage.owner = {username: data.username}

            setMessagesList(prev => [...prev, {...data.returnMessage}]);  
        };

        const SendMessageResponse = (data: IMessageToClient): void => {
            data.returnMessage.owner = {username: data.username}

            setMessagesList(prev => [...prev, {...data.returnMessage}]); 
            setMessageContent("");
        };

        const WelcomeMessage = (data: any): void  => {
            setMessagesList(data.MESSAGES); 
            setUser(data.USER.username);
            setRoom(data.ROOM.name); 

            setMessagesLoading(false);
        }

        const HandleError = (data: any) => {
            navigate("/lobby", { replace: true })
            setSocketError(data.errorMessage);
        }

        socket.on("welcome", WelcomeMessage);
        socket.on("send_message_response", SendMessageResponse); 
        socket.on("receive_messages", ReceiveMessages);
        socket.on("on_error", HandleError);

        socket.on("connect_error", () => navigate("/login", { replace: true }));

        return () => {
            socket.off("welcome", WelcomeMessage); 
            socket.off("send_message_response", SendMessageResponse);
            socket.off("receive_messages", ReceiveMessages);
            socket.off("on_error", HandleError);
            socket.off("connect_error");
        }
    }, [socket]);

    return (
        <section className="lobby">
            <div className='rooms-layout'>
                <Rooms></Rooms>
            </div>
            
            <div className="chat-window">
                <div className="chat-header">
                    <p>Room: {room}</p>
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
                                                        owner={message.owner.username} 
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
                    </ScrollToBottom>
                </div>
                
                <div className="chat-footer">
                    <input className="message_input" type="text" placeholder="Send mesage..." 
                        onChange={(e) => {setMessageContent(e.target.value)}}
                        onKeyPress={(e) => {e.key === "Enter" && sendMessage()}}
                        value={messageContent}
                    />
                </div>
            </div>
            
            { socketError !== "" ? <p className="err">{socketError}</p> : ""}

            <div className="online_users"></div>
        </section>
    )
}

export default Chat;