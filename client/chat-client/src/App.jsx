import React, { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'
import { BACK_URL } from './constants'
import ChatContainer from './components/ChatContainer'
import UsernameInput from './components/UsernameInput'
import Contacts from './components/contacts/Contacts'
import { useCon } from './context'

import './App.css'

// se conecta al socket
const socket = io(BACK_URL)

function App() {
    const logged = useRef(false)
    const [myId, setMyId] = useState(null)
    const [username, setUsername] = useState('')
    const [userTyping, setUserTyping] = useState(false)
    const [message, setMessage] = useState('')
    const [chatBody, setChatBody] = useState([{
        message: 'Welcome to the chat!',
        from: 'system'
    }])
    const [privateMessage, setPrivateMessage] = useState('')
    const [selectedUser, setSelectedUser] = useState(false)
    const [inboxes, setInboxes] = useState(new Map())

    const { dispatch, state: { users } } = useCon()

    // importante utilizar una cb para setear los mensajes
    //? https://stackoverflow.com/questions/70671831/react-socket-io-not-displaying-latest-message-passed-down-as-prop
    const handleNewMessage = (m) => {
        if (logged.current) {
            setChatBody(prev => [...prev, m])
        }
    }

    const handleNewConnection = (c) => {
        setMyId(c.id)
        dispatch({ type: 'update', payload: c.usersOnline })
    }

    const handleConnectionsUpdate = (u) => {
        dispatch({ type: 'update', payload: u.usersOnline })
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
            setUsername('')
            logged.current = true
        }
    }

    const handleUserTyping = (u) => {
        setUserTyping(u || false);
    }

    const handleIsTyping = (e) => {
        setMessage(e.target.value)
        socket.emit('isTyping')
    }

    const handleSendPrivate = (e) => {
        e.preventDefault()
        socket.emit('privateMessage', {
            message: privateMessage,
            to: selectedUser.id
        })
        setPrivateMessage('')
    }

    const handleOpenInbox = (payload) => {
        setSelectedUser({ name: payload.name, id: payload.id })
    }

    const handleNewInbox = (d) => {
        // Al ser una callback e intentar acceder al estado mediante el hook useState
        // obtengo el valor por defecto
        // (sin importar que se haya actualizado antes)
        // Si utilizamos setState obtenemos el valor actualizado...
        // También se podría utilizar useRef en su lugar
        //? https://stackoverflow.com/questions/57847594/react-hooks-accessing-up-to-date-state-from-within-a-callback
        setInboxes(current => {
            let aux = current

            if (d.id === myId) { // si soy el emisor, utilizo 'to' para crear la conversación
                if (aux.has(d.to)) aux.get(d.to).push(d)
                else aux.set(d.to, [d])
            } else { // si soy el receptor...
                if (aux.has(d.id)) aux.get(d.id).push(d)
                else aux.set(d.id, [d])
            }
            return aux
        })
    }

    useEffect(() => {
        socket.on('newConnection', (c) => handleNewConnection(c))
        socket.on('connectionsUpdate', (u) => handleConnectionsUpdate(u))
        socket.on('newMessage', (m) => handleNewMessage(m, logged))
        socket.on('userTyping', (u) => handleUserTyping(u))
        socket.on('userStopTyping', () => setUserTyping(false))
        socket.on('privateMessage', (d) => handleNewInbox(d))

        return () => {
            socket.off('connectionsUpdate')
            socket.off('newConnection')
            socket.off('newMessage')
            socket.off('userTyping')
            socket.off('userStopTyping')
            socket.off('privateMessage')
        }
        // dependencias deben estar vacías según documentación de socket.io
        // eslint-disable-next-line
    }, [])

    return (
        <div className="App">
            <h1>Chat Socket.io</h1>
            <p>Users online: {users.length || 0}</p>
            <p>{myId}</p>

            <div>{
                !logged.current
                    ? <UsernameInput
                        handleUsername={handleUsername}
                        username={username}
                        setUsername={setUsername} />
                    : <div className='container'>
                        <Contacts myId={myId} />
                        <ChatContainer
                            myId={myId}
                            chatBody={chatBody}
                            message={message}
                            handleSend={handleSend}
                            handleIsTyping={handleIsTyping}
                            handleOpenInbox={handleOpenInbox}
                            userTyping={userTyping} />
                    </div>
            }</div>

            {selectedUser && <div className='inboxes'>
                <p>Private chat with: {selectedUser.name}</p>
                {/* {inboxes.has(selectedUser.id) && 
                    <div>{
                        inboxes.get(selectedUser.id).map(m => (
                                <p><b>{m.name}: </b>{m.message}</p>
                            ))
                    }</div>} */}
                <form onSubmit={handleSendPrivate}>
                    <input type="text"
                        onChange={(e) => setPrivateMessage(e.target.value)}
                        value={privateMessage} />
                    <button>@SEND</button>
                </form>
            </div>}

            <button onClick={() => console.log(myId)}>ID</button>
            <button onClick={() => console.log(inboxes)}>inbox</button>

        </div>
    )
}

export default App
