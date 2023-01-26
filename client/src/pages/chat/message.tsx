import '../../App.css';
import { IMessage } from '../../interfaces';

interface IProps {
    message: IMessage,
    current_user: string
}

const Message = ({message, current_user}: IProps) => {
    const isVideo = ['mp4', 'avi'];

    return (
        <div id={message._id} className={current_user === message.owner.username ? `message you` : `message other`}>
            <img className={current_user === message.owner.username ? 'message_owner_image': 'message_owner_image other'} 
                src={`http://${process.env.REACT_APP_HOSTNAME}:3003/static/${message.owner.image}`} alt="" 
            />
            
            <div className="message_container">
                <div className="message-meta">
                    <p className="message-user">
                        <span className="message_username">{message.owner.username}</span> 
                        <span className="message_createdAt">{message.createdAt}</span>
                    </p>
                </div>
                <div className={current_user === message.owner.username 
                    ? message.file !== "none" 
                        ? `message-content you file_on` 
                        : 'message-content you'
                    : message.file !== "none"
                        ? `message-content file_on` 
                        : `message-content other`}>
                    {message.file !== "none" 
                    
                    ?  isVideo.includes(message.file.split('.')[1]) 
                        ?
                        <div className="message_with_file_container">
                            <video width="169" height="300" 
                                className={message.content.length < 1 ? "file_round" : ""} 
                                src={`http://${process.env.REACT_APP_HOSTNAME}:3003/static/${message.file}`} controls>
                            </video> 

                            <div className={current_user === message.owner.username ? "message_content_file you" : "message_content_file other"}>
                                {message.content.length > 0 && <p className="message-text">{message.content}</p>}
                            </div>
                        </div>
                        :   
                        <div className="message_with_file_container">
                            <img className={message.content.length < 1 ? "file_round" : ""}  
                                src={`http://${process.env.REACT_APP_HOSTNAME}:3003/static/${message.file}`} alt="" 
                            />
                            
                            <div className={current_user === message.owner.username ? "message_content_file you" : "message_content_file other"}>
                                {message.content.length > 0 && <p className="message-text">{message.content}</p>}
                            </div>  
                        </div>
            
                    : <p>{message.content}</p>
                    }
                </div>
            </div>
        </div>
    )
}

export default Message;