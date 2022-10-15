import React, { useEffect } from 'react'

const ChatContainer = (props) => {
    const {
        chatBody,
        message,
        myId,
        handleSend,
        handleIsTyping,
        handleOpenInbox,
        userTyping
    } = props

    useEffect(() => {
        var element = document.getElementById("chat-container");
        element.scrollTop = element.scrollHeight;
    }, [chatBody])

    const handlePrivate = (id, name) => {
        handleOpenInbox({ id, name })
    }

    return (
        <div>
            <div className='chat-container' id='chat-container'>
                {chatBody.length &&
                    chatBody.map((m, index) => (
                        <p key={index} className={`${m.from === 'system'
                            ? 'sys-message'
                            : m.id === myId
                                ? 'user-message'
                                : 'message'}
                            ${m.private && 'private-message'}`}>
                            <b onClick={() => handlePrivate(m.id, m.from)} style={{ color: m.color }}>{(m.from === 'system' || m.id === myId)
                                ? ''
                                : `${m.private ? 'dm from ' : ''} ${m.from}: `}</b>
                            {m.message}
                        </p>
                    ))
                }
            </div>

            {userTyping && <p>{userTyping} is typing...</p>}

            <form onSubmit={handleSend}>
                <input type="text"
                    placeholder='type a message'
                    onChange={handleIsTyping}
                    value={message} />
                <button onClick={handleSend}>send</button>
            </form>
        </div>
    )
}

export default ChatContainer