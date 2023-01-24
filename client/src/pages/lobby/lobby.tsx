import { useState } from 'react';
import Modal from '../../components/modal';
import RoomActionsModal from '../../components/roomActionsModal';
import Rooms from "../../components/rooms";

const Lobby = () => {
    const [isModal, setIsModal] = useState<boolean>(false);

    return (
        <>
            <Rooms setModal={setIsModal}/>
            {isModal &&
                <Modal setModalOn={setIsModal}>
                    <RoomActionsModal />
                </Modal>
            }
        </>
    )
}

export default Lobby;