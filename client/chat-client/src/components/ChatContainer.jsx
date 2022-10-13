import React, { useEffect } from 'react'

const ChatContainer = (props) => {
    const {
        chatBody, 
        message, 
        myId, 
        handleSend, 
        setMessage
    } = props

    useEffect(() => {
        var element = document.getElementById("chat-container");
        element.scrollTop = element.scrollHeight;
    }, [chatBody])

    return (
        <div>
            <div className='chat-container' id='chat-container'>
                {chatBody.length &&
                    chatBody.map((m, index) => (
                        <p key={index} className={m.from === 'system'
                            ? 'sys-message'
                            : m.id === myId
                            ? 'user-message'
                            : 'message'}>
                            <b>{(m.from === 'system' || m.id === myId) 
                                ? '' 
                                : `${m.from}: `}</b>
                            {m.message}
                        </p>
                    ))                
                }
            </div>

            <form onSubmit={handleSend}>
                <input type="text" placeholder='type a message' onChange={e => setMessage(e.target.value)} value={message}/>
                <button onClick={handleSend}>send</button>
            </form>
        </div>
    )
}

export default ChatContainer