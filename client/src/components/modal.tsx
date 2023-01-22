import { Dispatch } from "react";

interface IProps {
    setModalOn: Dispatch<boolean>
    children: JSX.Element
}

const Modal = ({setModalOn, children}: IProps) => {
    return (
        <div className="overlay" onClick={() => setModalOn(false)}>
            <div className="modal_container" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    )
}

export default Modal;