import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../../api';

const CreateRoom = () => {
    const [roomName, setRoomName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [reapeatedPassword, setRepeatedPassword] = useState("");
    const [file, setFile] = useState<File>();
    const [apiError, setApiError] = useState<string>("");
    const navigate = useNavigate();

    async function createRoomRequest(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            const response = await apiService.createRoom(roomName, password, reapeatedPassword);

            if(file) await apiService.uploadRoomImage(file, roomName);
            
            navigate(`/chat/${response.data.room._id}`, {replace: true});
        } catch(err: any) {
            setApiError(`Oops: ${err.response.data.errMessage}`);
        }
    }

    return (
        <form className="formContainer" onSubmit={createRoomRequest}>
            <h3>Create Room</h3>

            <input type="text" placeholder="room name..." onChange={(e) => {setRoomName(e.target.value)}}/>
            <input type="password" placeholder="password" onChange={(e) => {setPassword(e.target.value)}}/>
            <input type="password" placeholder="repeat password" onChange={(e) => {setRepeatedPassword(e.target.value)}}/>
            <input type="file" id="images" accept=".png,.jpg,.jpeg" onChange={(e) => {setFile(e.target.files?.[0])}}/>

            <button type="submit">Create Room</button>

            { apiError && <p className='err'>{apiError}</p>}
            <p>Want to join a room?  <Link to="/room/join">Join Room</Link></p>
        </form>
    )
}

export default CreateRoom;