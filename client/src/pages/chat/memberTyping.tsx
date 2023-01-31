import { IUser } from "../../interfaces";

interface IProps {
    memberTypingInfo: Omit<IUser, 'password'>;
}

const MemberTyping = ({memberTypingInfo}: IProps) => {
    return (
        <div className='message other'>
            <img className='message_owner_image other' 
                src={`http://${process.env.REACT_APP_HOSTNAME}:3003/static/${memberTypingInfo.image}`} alt="" 
            />
            <div>
                <div className="message-content typing_blink_message">
                    <div className="blinking"></div>
                    <div className="blinking_second"></div>
                    <div className="blinking_third"></div>
                </div>
            </div>
        </div>
    )
}

export default MemberTyping;