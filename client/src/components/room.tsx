import { IRoom } from "../interfaces";
import { useNavigate } from 'react-router-dom';

interface IProp {
    room: IRoom,
}

const Room = ({room}: IProp) => {
    const navigate = useNavigate();

    return (
        <div onClick={() => navigate(`/chat/${room._id}`, { replace: true})} className="room_name">
            <div className="room_profile" tabIndex={0}>      
                <div className="room_profile-content" tabIndex={0}> 
                    {room.image 
                        ? <img src={`http://${process.env.REACT_APP_HOSTNAME}:3003/static/${room.image}`} alt="" />
                        : <img src={`http://${process.env.REACT_APP_HOSTNAME}:3003/static/N.jpg`} alt="" />
                    }
                    <p>{room.name}</p>
                </div>
            </div>
        </div>
    )
}

export default Room;