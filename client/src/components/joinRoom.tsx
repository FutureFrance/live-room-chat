import { useState } from 'react';
import { Link, useNavigate  } from 'react-router-dom';
import { apiService } from '../api';

const JoinRoom = () => {
    const [room, setRoom] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [apiError, setApiError] = useState<string>("");
    const navigate = useNavigate();

    async function joinRoom(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            const response = await apiService.joinRoom(room, password);

            navigate(`/chat/${response.data.room._id}`, { replace: true });
        } catch(err: any) {
            setApiError(`Oops: ${err.response.data.errMessage}`);
        }
    }

    return (
        <form className="formContainer" onSubmit={joinRoom}>
            <h3>Join Room</h3>

            <input type="text" placeholder="Room" onChange={(e) => {setRoom(e.target.value)}}/>
            <input type="password" placeholder="Room password" onChange={(e) => {setPassword(e.target.value)}}/>

            <button type="submit">Join Room</button>
            
            { apiError && <p className='err'>{apiError}</p>}
            <p>Want to create a room?  <Link to="/room/create">Create a room</Link></p>
        </form>
    )
}

export default JoinRoom;