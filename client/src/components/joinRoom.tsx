import { useState } from 'react';
import { useNavigate  } from 'react-router-dom';
import { apiService } from '../api';

const JoinRoom = () => {
    const [room, setRoom] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<boolean>(false);
    const navigate = useNavigate();

    async function joinRoom(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            const response = await apiService.joinRoom(room, password);

            navigate(`/chat/${response.data.room._id}`, { replace: true });
        } catch(err) {
            console.log(err);
            setError(true);
        }
    }

    return (
        <form className="joinChatContainer" onSubmit={joinRoom}>
            <h3>Join Room</h3>
            <input type="text" placeholder="Room" onChange={(e) => {setRoom(e.target.value)}}/>
            <input type="password" placeholder="Room password" onChange={(e) => {setPassword(e.target.value)}}/>

            <button type="submit">Join Room</button>
            { error && <p>Room and password don't match</p> }
        </form>
    )
}

export default JoinRoom;