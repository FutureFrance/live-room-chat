import GroupsIcon from '@mui/icons-material/Groups';
import { useNavigate } from 'react-router-dom';

const RoomActionsModal = () => {
    const navigate = useNavigate();

    return (
        <>
        <GroupsIcon id="room_action_icon"/>
            <div className="room_action_modal">
                <button onClick={() => navigate("/room/create", {replace: true})}>Create Room</button>
                <button onClick={() => navigate("/room/join", {replace: true})}>Join Room</button>
            </div>
        </>
    )
}

export default RoomActionsModal;