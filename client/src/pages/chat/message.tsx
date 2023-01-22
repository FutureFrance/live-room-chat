import '../../App.css';
import { IUser } from '../../interfaces';

interface IProps {
    content: string, 
    owner: IUser, 
    id: string, 
    current_user: string, 
    date: string
}

const Message = ({content, owner, id, current_user, date}: IProps) => {
    return (
        <div id={id} className={current_user === owner.username ? `message you` : `message other`}>
            <img className={current_user === owner.username ? 'message_owner_image': 'message_owner_image other'} 
                src={`http://${process.env.REACT_APP_HOSTNAME}:3003/images/${owner.image}`} alt="" 
            />
            <div>
                <div className="message-content">
                    <p className="message-text">{content}</p>
                </div>
                <div className="message-meta">
                    <p className="message-user">{owner.username} | {date}</p>
                </div>
            </div>
        </div>
    )
}

export default Message;