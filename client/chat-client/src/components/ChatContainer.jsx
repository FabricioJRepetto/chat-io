import React, { useEffect } from 'react'
import { useState } from 'react'
import { useCon } from '../context'

const ChatContainer = ({ socket, handleOpenInbox }) => {
    const { dispatch, state: { myId, logged, inboxes, chats } } = useCon()

    const [chatBody, setChatBody] = useState([{
        message: 'Welcome to the chat!',
        from: 'system'
    }])
    const [message, setMessage] = useState('')
    const [userTyping, setUserTyping] = useState(false)

    // importante utilizar una cb para setear los mensajes
    //? https://stackoverflow.com/questions/70671831/react-socket-io-not-displaying-latest-message-passed-down-as-prop
    const handleNewMessage = (m) => {
        if (logged) {
            setChatBody(prev => [...prev, m])
        }
    }

    const handleSend = (e) => {
        e.preventDefault()
        if (message.length) {
            socket.emit('newMessage', message)
            socket.emit('isNotTyping')
            setMessage('')
        }
    }

    const handleUserTyping = (u) => {
        setUserTyping(u || false)
    }

    const handleIsTyping = (e) => {
        setMessage(e.target.value)
        socket.emit('isTyping')
    }

    const handlePrivate = (id, name) => {
        handleOpenInbox({ id, name })
    }

    useEffect(() => {
        var element = document.getElementById("chat-container");
        element.scrollTop = element.scrollHeight;
    }, [chatBody])

    useEffect(() => {
        socket.on('newMessage', (m) => handleNewMessage(m))
        socket.on('userTyping', (u) => handleUserTyping(u))
        socket.on('userStopTyping', () => setUserTyping(false))

        return () => {
            socket.off('newMessage')
            socket.off('userTyping')
            socket.off('userStopTyping')
        }
        // eslint-disable-next-line
    }, [])


    return (
        <div>
            <div className='chat-container' id='chat-container'>
                {chatBody.length &&
                    chatBody.map((m, index) => (
                        <p key={index}
                            className={m.from === 'system'
                                ? 'sys-message'
                                : m.id === myId
                                    ? 'user-message'
                                    : 'message'}>
                            <b onClick={() => handlePrivate(m.id, m.from)}
                                style={{ color: m.color }}>
                                {(m.from === 'system' || m.id === myId)
                                    ? ''
                                    : m.from + ': '}</b>
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