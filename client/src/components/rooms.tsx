import { useState, useEffect, Dispatch } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ScrollToBottom from 'react-scroll-to-bottom';
import { apiService } from '../api';
import { IRoom } from '../interfaces';
import Room from './room';

interface IProps {
    setModal: Dispatch<boolean>
}

const Rooms = ({setModal}: IProps) => {
    const [ rooms, setRooms ] = useState<IRoom[]>([]);
    const [ gotResponse, setGotResponse ] = useState<boolean>(false);
    const [ error, setError ] = useState<string>("");
    const navigate = useNavigate();

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
        <>
        <div className="left_loby_section">
            <div className="chat_header">
                <p>Member in:</p>
                <div className="rooms_action_container">
                    <SettingsIcon onClick={() => setModal(true)} className="rooms_action"></SettingsIcon>
                    <AccountCircleIcon onClick={() => navigate("/profile", {replace: true})} className="profile_icon"/>
                </div>
            </div>
            <div className="rooms_profile">
                <ScrollToBottom className="rooms-container">
                    {gotResponse 
                        ? rooms.map(room => <Room room={room} key={room._id}></Room>)
                        : <p>Loading.....</p>
                    }

                    { error && <p>Error ocurred: {error}</p>}
                </ScrollToBottom>
            </div>
        </div>
        </>
    )
}

export default Rooms;