import { useState } from 'react';
import { IUser } from "../../interfaces";

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
                            <img className="room_member_image" src={`http://${process.env.REACT_APP_HOSTNAME}:3003/images/${user.image}`} alt="" />
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