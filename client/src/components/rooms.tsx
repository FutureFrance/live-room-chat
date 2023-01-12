import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ScrollToBottom from 'react-scroll-to-bottom';
import { apiService } from '../api';
import { IRoom } from '../interfaces';
import Room from './room';

const Rooms = () => {
    const [ rooms, setRooms ] = useState<IRoom[]>([]);
    const [ gotResponse, setGotResponse ] = useState<boolean>(false);
    const [ error, setError ] = useState<string>("");

    async function getRooms() {
        try {
            const response = await apiService.getRooms();

            setRooms(response.data);
            setGotResponse(true);
        } catch(err: any) {
            setError(err);
        }
    }

    useEffect(() => {
        getRooms();
    }, []);

    return (
        <div className="left_loby_section">
            <div className="chat-header">
                <p>Member in:</p>
            </div>
            <div className="rooms-profile">
                <ScrollToBottom className="rooms-container">
                    {gotResponse 
                        ? rooms.map(room => <Room room={room} key={room._id}></Room>)
                        : <p>Loading.....</p>
                    }

                    { error && <p>Error ocurred: {error}</p>}
                </ScrollToBottom>
            </div>

            <div className="room-action-buttons">
                <Link to="/room/join"><button className='action-button'>Join a room</button></Link><br/><br/>
                <Link to="/room/create"><button className='action-button'>Create a new room</button></Link>
            </div>
        </div>
    )
}

export default Rooms;