import "./styles.css";
import { useState } from 'react';
import Modal from '../../components/modal';
import RoomActionsModal from '../../components/roomActionsModal';
import Rooms from "../../components/rooms";

const Lobby = () => {
    const [isModal, setIsModal] = useState<boolean>(false);

    return (
        <>
            <div className="lobby_rooms_section">
                <Rooms setModal={setIsModal}/>
            </div>
            
            {isModal &&
                <Modal setModalOn={setIsModal}>
                    <RoomActionsModal />
                </Modal>
            }
        </>
    )
}

export default Lobby;