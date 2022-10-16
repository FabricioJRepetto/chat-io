import React, { useState, useEffect } from 'react'
import { useCon } from '../../context'

import './DMChat.css'

const DMChat = (props) => {
    const {
        user: { id, name },
        handleSendPrivate,
        socket
    } = props

    const { dispatch, state: { inboxes, chats } } = useCon()
    const messagesShortcut = inboxes.get(id).messages
    const unseenShortcut = chats[id].unseen

    // const [open, setOpen] = useState(true)
    const [expanded, setExpanded] = useState(chats[id].expanded)
    const [unseen, setUnseen] = useState(unseenShortcut)
    const [message, setMessage] = useState('')

    useEffect(() => {
        chats[id].unseen
            ? setUnseen(!expanded)
            : setUnseen(false)
        // eslint-disable-next-line
    }, [unseenShortcut])


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

    const handleClick = () => {
        let aux = chats
        aux[id] = {
            ...chats[id],
            expanded: !expanded,
            unseen: false
        }
        dispatch({ type: 'chatUpdate', payload: aux })
        setExpanded(!expanded)
        setUnseen(false)
    }

    return (
        <div className={`dm-chat-body ${unseen && 'dm-unseen'} ${expanded && 'dm-expanded'}`}
            onClick={expanded ? undefined : handleClick}>
            <p>{name}</p>

            {expanded && <div>
                <button onClick={handleClick}>_</button>
                <button>x</button>
                <div className='dm-chat-content'>{
                    inboxes.get(id) &&
                    messagesShortcut.map((m, index) => (
                        <p key={`${m.from.id}${index}`}
                            className={m.to.id === id
                                ? 'user-message'
                                : 'message'}>
                            {m.message}
                        </p>
                    ))
                }</div>
                {(chats?.hasOwnProperty(id) && chats[id].typing) && <p><b>{name}</b> is typing...</p>}

                <form onSubmit={handleSendDM}>
                    <input type="text"
                        value={message}
                        onChange={handleChange} />
                    <button>send</button>
                </form>
            </div>}
        </div>
    )
}

export default DMChat