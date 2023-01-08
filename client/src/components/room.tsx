import { Link } from "react-router-dom";
import { IRoom } from "../interfaces";

interface IProp {
    room: IRoom,
}

const Room = ({room}: IProp) => {
    return (
        <Link to={`/chat/${room._id}`} className="room_name">
            <div className="room-profile" tabIndex={0}>      
                <div className="room-profile-content" tabIndex={0}> 
                    {room.image 
                        ? <img src={`http://localhost:3003/images/${room.image}`} alt="" />
                        : <img src={`http://localhost:3003/images/not_found.jpg`} alt="" />
                    }
                    <p>{room.name}</p>
                </div>
            </div>
        </Link>
    )
}

export default Room;