import { useState, useEffect } from 'react';
import { IMessage, IMessageToClient } from '../interfaces';
import Message from './message';
import ScrollToBottom from 'react-scroll-to-bottom';
import { socket } from '../socket';

const Chat = () => {
    const [user, setUser] = useState<string>("");
    const [room, setRoom] = useState<string>("");
    const [messageContent, setMessageContent] = useState<string>("");
    const [messagesList, setMessagesList] = useState<IMessage[]>([{} as IMessage]);
    const [messagesLoading, setMessagesLoading] = useState<boolean>(true);

    async function sendMessage() {
        console.log("sending message")
        if (messageContent !== "") socket.emit("send_message", messageContent);    
    }

    useEffect(() => {
        const ReceiveMessages = (data: any): void => {
            console.log("Got data from a member group", data)
            console.log(data.returnMessage)
            data.returnMessage.owner = {username: ""}
            data.returnMessage.owner.username = data.username; 

            setMessagesList(prev => [...prev, {...data.returnMessage}]);  
        };

        const SendMessageResponse = (data: IMessageToClient): void => {
            console.log("received the message from backend");
            console.log(data)
            data.returnMessage.owner = {username: ""}
            data.returnMessage.owner.username = data.username; 

            setMessagesList(prev => [...prev, {...data.returnMessage}]); 
            setMessageContent("");
        };

        const WelcomeMessage = (data: any): void  => {
            setMessagesList(data.messagesHistory); console.log("DATA", data);
            setUser(data.USER.username);
            setRoom(data.ROOM.name); console.log("CONETION SET DATA: ", JSON.stringify(data));
            setMessagesLoading(false);
                        
            socket.emit("join_room");
        }

        socket.on("welcome", WelcomeMessage);
        socket.on("send_message_response", SendMessageResponse); 
        socket.on("receive_messages", ReceiveMessages);

        return () => {
            socket.off("welcome", WelcomeMessage); 
            socket.off("send_message_response", SendMessageResponse);
            socket.off("receive_messages", ReceiveMessages);
        }
    }, [socket]);

    return (
        <>
        <h3>{room}</h3>
        <div className="chat-window">
            <div className="chat-header">
                <p>Live Chat</p>
            </div>

            <div className="chat-body">
                <ScrollToBottom className="message-container">
                    {!messagesLoading 
                    ?   <>
                            {messagesList.map((message) => {
                                return <Message content={message.content} owner={message.owner.username} id={message._id} current_user={user} key={message._id}/>
                            })}
                        </>
                    :   <p>Loading.....</p>
                    }
                </ScrollToBottom>
            </div>
            
            <div className="chat-footer">
                <input type="text" placeholder="Send mesage..." onChange={(e) => {setMessageContent(e.target.value)}}
                onKeyPress={(e) => {e.key === "Enter" && sendMessage()}}
                value={messageContent}
                />
                <button onClick={sendMessage}>&#9658;</button>
            </div>
        </div>
        </>
    )
}

export default Chat;