import React, { useState, useEffect } from 'react'
import { useRef } from 'react'
import { useCon } from '../../context'

import './DMChat.css'
const DMChat = (props) => {
    const {
        user: { id, name },
        handleSendPrivate,
        socket
    } = props

    const element = useRef(null)
    const { dispatch, state: { myId, chat, chatConfig } } = useCon()
    const unseenShortcut = chatConfig.unseen

    // const [open, setOpen] = useState(true)
    const [expanded, setExpanded] = useState(chatConfig.expanded)
    const [unseen, setUnseen] = useState(chatConfig.unseen)
    const [message, setMessage] = useState('')

    useEffect(() => {
        chatConfig.unseen
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
        let aux = {
            expanded: !expanded,
            unseen: false
        }
        dispatch({ type: 'chatUpdate', payload: aux })
        setExpanded(!expanded)
        setUnseen(false)
    }

    useEffect(() => {
        !element.current && (element.current = document.getElementById("chat-container"))
        if (element.current) {
            console.log(element.current);
            element.current.scrollTop = element.scrollHeight
        }
    }, [chat])

    return (
        <div className={`dm-chat-body ${unseen && 'dm-unseen'} ${expanded && 'dm-expanded'}`}
            onClick={expanded ? undefined : handleClick}>

            <div className={`dm-header ${!expanded && 'dm-pointer'}`}>
                <p>Room chat</p>
                {expanded && <button onClick={handleClick}>_</button>}
            </div>

            {expanded &&
                <>
                    <div className='dm-chat-content' id='chat-container'>{
                        chat.length &&
                        chat.map((m, index) => (
                            <p key={`${m.user}${index}`}
                                className={m.user === myId
                                    ? 'user-message'
                                    : 'message'}>
                                {m.message}
                            </p>
                        ))
                    }</div>

                    {(chatConfig.typing) && <p><b>{name}</b> is typing...</p>}

                    <form onSubmit={handleSendDM}>
                        <input type="text"
                            value={message}
                            onChange={handleChange} />
                        <button>send</button>
                    </form>
                </>}
        </div>
    )
}

export default DMChat