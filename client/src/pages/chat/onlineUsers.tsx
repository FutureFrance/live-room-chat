import { IUser } from "../../interfaces";
import "./styles.css";

interface IProps {
    users: IUser[]
}

const OnlineMembers = ({users}: IProps) => {
    return (
        <>
            {users.map((user, index) => {
                return (
                    <div className={user.online ? "user_container" : "user_container user_offline"} key={index}>
                        <div className="room_member_info">
                            <img className="room_member_image" 
                                src={`http://${process.env.REACT_APP_HOSTNAME}:3003/static/${user.image}`} alt="profile_image" />
                            <p>{user.username}</p>
                        </div>
                        
                        <div className={user.online ? "online" : "offline"}></div>
                    </div>
                )  
            })}
        </>
    )
}

export default OnlineMembers;