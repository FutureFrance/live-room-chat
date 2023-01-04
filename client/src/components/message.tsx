import '../App.css'

const Message = ( props: {content: string, owner: string, id: string, current_user: string}) => {
    return (
        <div id={props.id} className={props.current_user === props.owner ? `message you` : `message other`}>
            <div>
                <div className="message-content">
                    <p className="message-text">{props.content}</p>
                </div>
                <div className="message-meta">
                    <p className="message-user">{props.owner}</p>
                </div>
            </div>
        </div>
    )
}

export default Message;