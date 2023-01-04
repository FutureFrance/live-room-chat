import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../api';

const CreateRoom = () => {
    const [roomName, setRoomName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [reapeatedPassword, setRepeatedPassword] = useState("");
    const navigate = useNavigate();

    async function createRoomRequest(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        try {
            const response = await apiService.createRoom(roomName, password, reapeatedPassword);

            navigate(`/chat/${response.data.room._id}`, {replace: true});
        } catch(err) {
            console.log(err);
        }
    }

    return (
        <form onSubmit={createRoomRequest}>
            <input type="text" placeholder="room name..." onChange={(e) => {setRoomName(e.target.value)}}/>
            <input type="password" placeholder="password" onChange={(e) => {setPassword(e.target.value)}}/>
            <input type="password" placeholder="repeat password" onChange={(e) => {setRepeatedPassword(e.target.value)}}/>
            <button type="submit">Create Room</button>

            <p>Want to join a room?<Link to="/room/join">Join Room</Link></p>
        </form>
    )
}

export default CreateRoom;