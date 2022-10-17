import React, { useState, useEffect, useRef } from 'react'
import { Routes, Route, useNavigate } from "react-router-dom";
import io from 'socket.io-client'
import { BACK_URL } from './constants'
import ChatContainer from './components/ChatContainer'
import UsernameInput from './components/UsernameInput'
import Contacts from './components/contacts/Contacts'
import DMChat from './components/dmChat/DMChat'
import TicTacToe from './components/tictactoe/TicTacToe';
import { useCon } from './context'

import './App.css'
// se conecta al socket
const socket = io(BACK_URL)

function App() {
    const logged = useRef(false)
    const myId = useRef(false)
    const [username, setUsername] = useState('')
    const [userTyping, setUserTyping] = useState(false)
    const [message, setMessage] = useState('')
    const [chatBody, setChatBody] = useState([{
        message: 'Welcome to the chat!',
        from: 'system'
    }])
    const navigate = useNavigate()
    const { dispatch, state: { users, inboxes, chats } } = useCon()

    // importante utilizar una cb para setear los mensajes
    //? https://stackoverflow.com/questions/70671831/react-socket-io-not-displaying-latest-message-passed-down-as-prop
    const handleNewMessage = (m) => {
        if (logged.current) {
            setChatBody(prev => [...prev, m])
        }
    }

    const handleNewConnection = (c) => {
        myId.current = c.id
        dispatch({ type: 'usersUpdate', payload: c.usersOnline })
    }

    const handleConnectionsUpdate = (u) => {
        dispatch({ type: 'usersUpdate', payload: u.usersOnline })
    }

    const handleSend = (e) => {
        e.preventDefault()
        if (message.length) {
            socket.emit('newMessage', message)
            socket.emit('isNotTyping')
            setMessage('')
        }
    }

    const handleUsername = (e) => {
        e.preventDefault()
        if (username && username.length < 15) {
            socket.emit('username', username)
            // setUsername('')
            logged.current = true
        }
    }

    const handleUserTyping = (u) => {
        setUserTyping(u || false)
    }

    const handleIsTyping = (e) => {
        setMessage(e.target.value)
        socket.emit('isTyping')
    }

    const handleSendPrivate = (data) => {
        socket.emit('privateMessage', {
            message: data.message,
            to: data.to
        })
    }

    const handleOpenInbox = ({ id, name }) => {
        try {
            let aux = inboxes
            if (!aux.has(id)) aux.set(id, { name, messages: [] })
            dispatch({ type: 'newInbox', payload: aux })

            let newDmChat = chats || {}
            newDmChat[id] = {
                name,
                open: true,
                expanded: true,
                typing: false,
                unseen: false
            }
            console.log(newDmChat);
            dispatch({ type: 'chatUpdate', payload: newDmChat })
        } catch (err) {
            console.log(err);
        }
    }

    // Al ser una callback e intentar acceder al estado mediante el hook useState
    // obtengo el valor por defecto (sin importar que se haya actualizado antes)
    //? https://stackoverflow.com/questions/57847594/react-hooks-accessing-up-to-date-state-from-within-a-callback       
    const handleNewInbox = (m) => {
        try {
            // si el destinatario soy yo, abro el chat
            // y agrego el chat al context
            if (m.to.id === myId.current) {
                let newDmChat = chats
                if (chats[m.from.id]) {
                    newDmChat[m.from.id] = {
                        ...chats[m.from.id],
                        open: true,
                        unseen: true
                    }
                } else {
                    newDmChat[m.from.id] = {
                        name: m.from.name,
                        open: true,
                        expanded: false,
                        unseen: true,
                        typing: false
                    }
                }

                dispatch({ type: 'chatUpdate', payload: newDmChat })
            }

            let aux = inboxes
            // si soy el emisor...
            if (m.from.id === myId.current) {
                aux.get(m.to.id).messages.push(m)
            } else { // si soy el receptor...
                if (aux.has(m.from.id)) {
                    aux.get(m.from.id).messages.push(m)
                } else {
                    aux.set(m.from.id, { messages: [m], name: m.from.name })
                }
            }

            dispatch({ type: 'newInbox', payload: aux })
        } catch (err) {
            console.log(err);
        }
    }

    const handleDMTyping = ({ id, typing }) => {
        try {
            if (chats[id]) {
                let newDmChat = chats
                newDmChat[id] = {
                    ...chats[id],
                    typing
                }
                dispatch({ type: 'chatUpdate', payload: newDmChat })
            }
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        socket.on('newConnection', (c) => handleNewConnection(c))
        socket.on('connectionsUpdate', (u) => handleConnectionsUpdate(u))
        socket.on('newMessage', (m) => handleNewMessage(m, logged))
        socket.on('userTyping', (u) => handleUserTyping(u))
        socket.on('userStopTyping', () => setUserTyping(false))
        socket.on('DMisTyping', (data) => handleDMTyping(data))
        socket.on('DMStopTyping', (data) => handleDMTyping(data))
        socket.on('privateMessage', (d) => handleNewInbox(d))

        return () => {
            socket.off('connectionsUpdate')
            socket.off('newConnection')
            socket.off('newMessage')
            socket.off('userTyping')
            socket.off('userStopTyping')
            socket.off('privateMessage')
            socket.off('DMisTyping')
            socket.off('DMStopTyping')
        }
        // dependencias deben estar vacías según documentación de socket.io
        // eslint-disable-next-line
    }, [])

    return (
        <div className="App">
            <h1>Chat Socket.io</h1>
            <p>Users online: {users.length || 0}</p>
            <p>{username || '---'}</p>
            <p>{myId.current}</p>
            <button onClick={() => console.log(myId.current)}>ID</button>
            <button onClick={() => console.log(inboxes)}>inbox</button>
            <button onClick={() => console.log(chats)}>chats</button>
            <br />
            <button onClick={() => navigate('/')}>home</button>
            <button onClick={() => navigate('/game')}>tictactoe</button>



            <Routes>
                <Route path="/" element={
                    <div>{
                        <>
                            {!logged.current
                                ? <UsernameInput
                                    handleUsername={handleUsername}
                                    username={username}
                                    setUsername={setUsername} />
                                : <div className='container'>
                                    <Contacts myId={myId.current}
                                        handleOpenInbox={handleOpenInbox} />
                                    <ChatContainer myId={myId.current}
                                        chatBody={chatBody}
                                        message={message}
                                        handleSend={handleSend}
                                        handleIsTyping={handleIsTyping}
                                        handleOpenInbox={handleOpenInbox}
                                        userTyping={userTyping} />
                                </div>}

                            {(chats) &&
                                Object.entries(chats).map(([k, v]) => (
                                    v.open &&
                                    <DMChat key={k + myId.current}
                                        user={{ id: k, name: v.name }}
                                        socket={socket}
                                        handleSendPrivate={handleSendPrivate}
                                    />
                                ))
                            }
                        </>
                    }</div>
                } ></Route>
                <Route path='/game' element={<TicTacToe socket={socket} />}></Route>
            </Routes>


        </div>
    )
}

export default App
