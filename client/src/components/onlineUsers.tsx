import { IUser } from "../interfaces";

interface IProps {
    users: IUser[]
}

const OnlineMembers = ({users}: IProps) => {
    let isOnline = true;

    return (
        <>
            {users.map((user, index) => {
                return <div className="users_container" key={index}>
                    <div className="room_member_info">
                        <img className="room_member_image" src={`http://localhost:3003/images/${user.image}`} alt="" />
                        <p>{user.username}</p>
                    </div>
                    
                    <div className={user.online ? "online" : "offline"}></div>
                </div>
            })}
        </>
    )
}

export default OnlineMembers;