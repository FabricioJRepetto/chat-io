import React, { useState, useEffect } from 'react'
import { useRef } from 'react'
import Send from '../../assets/Send'
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
    const chatShortcut = chat.length

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
        if (element.current) {
            element.current.scrollTop = element.current.scrollHeight
        }
    }, [chatShortcut])
    // onClick={handleClick}
    return (
        <div className={`dm-chat-body ${unseen && 'dm-unseen'} ${expanded && 'dm-expanded'}`}
            /* onClick={expanded ? undefined : handleClick}*/>

            <div className={`dm-header dm-pointer`} onClick={handleClick}>
                <p>Room chat</p>
                <div onClick={handleClick}>{expanded ? '-' : '+'}</div>
            </div>

            {expanded &&
                <div className='chat-expanded'>
                    <div className='dm-chat-content' ref={element}>{
                        chat.length > 0 &&
                        chat.map((m, index) => (
                            <p key={`${m.user}${index}`}
                                className={`message ${m.user === myId
                                    ? 'user-m'
                                    : 'notuser-m'}`}>
                                {m.message}
                            </p>
                        ))
                    }</div>

                    <div className='chat-bottom'>
                        {chatConfig.typing && <p><b>{name}</b> is typing...</p>}

                        <form onSubmit={handleSendDM}>
                            <input type="text"
                                placeholder='type a message'
                                value={message}
                                onChange={handleChange} />
                            <button>
                                <Send />
                            </button>
                        </form>
                    </div>
                </div>}
        </div>
    )
}

export default DMChat