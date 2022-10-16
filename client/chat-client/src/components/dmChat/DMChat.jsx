import React, { useState } from 'react'
import { useCon } from '../../context'

import './DMChat.css'

const DMChat = (props) => {
    const {
        user: { id, name },
        handleSendPrivate,
        socket
    } = props

    const { state: { inboxes, chats } } = useCon()

    const [message, setMessage] = useState('')

    const handleSendDM = (e) => {
        e.preventDefault()
        handleSendPrivate({ message, to: { id, name } })
        socket.emit('DMisNotTyping', id)
        setMessage('')
    }

    const handleChange = (e) => {
        e.preventDefault()
        setMessage(e.target.value)
        socket.emit('DMisTyping', id)
    }

    return (
        <div className='dm-chat-body'>
            <p>{name}</p>

            <div className='dm-chat-content'>{
                inboxes.get(id) &&
                inboxes.get(id).messages.map((m, index) => (
                    <p key={`${m.from.id}${index}`}
                        className={m.to.id === id
                            ? 'user-message'
                            : 'message'}>
                        {m.message}
                    </p>
                ))
            }</div>
            {(chats?.hasOwnProperty(id) && chats[id]) && <p><b>{name}</b> is typing...</p>}

            <form onSubmit={handleSendDM}>
                <input type="text"
                    value={message}
                    onChange={handleChange} />
                <button>send</button>
            </form>
        </div>
    )
}

export default DMChat