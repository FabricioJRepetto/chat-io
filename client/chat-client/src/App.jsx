import React, { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'
import { BACK_URL } from './constants'
import ChatContainer from './components/ChatContainer'

import './App.css'
import UsernameInput from './components/UsernameInput'

// se conecta al socket
const socket = io(BACK_URL)

function App() {
    const logged = useRef(false)
    const [myId, setMyId] = useState(null)
    const [username, setUsername] = useState('')
    const [usersOnline, setUsersOnline] = useState([])
    const [userTyping, setUserTyping] = useState(false)
    const [message, setMessage] = useState('')
    const [chatBody, setChatBody] = useState([{
        message: 'Welcome to the chat!',
        from: 'system'
    }])
    
    // importante utilizar una cb para setear los mensajes
    //? https://stackoverflow.com/questions/70671831/react-socket-io-not-displaying-latest-message-passed-down-as-prop
    const handleNewMessage = (m) => {
        if (logged.current) {
            setChatBody(prev => [...prev, m])            
        }
    }

    const handleNewConnection = (c) => {
        setMyId(c.id)
        setUsersOnline(c.usersOnline)
    }

    const handleConnectionsUpdate = (u) => {
        setUsersOnline(u.usersOnline)
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
        if (username && username.length < 10) {
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

    useEffect(() => {
        socket.on('newConnection', (c) => handleNewConnection(c))
        socket.on('connectionsUpdate', (u) => handleConnectionsUpdate(u))
        socket.on('newMessage', (m) => handleNewMessage(m, logged))
        socket.on('userTyping', (u) => handleUserTyping(u))
        socket.on('userStopTyping', () => setUserTyping(false))
        
        return () => {
            socket.off('connectionsUpdate')
            socket.off('newConnection')
            socket.off('newMessage')
            socket.off('userTyping')
            socket.off('userStopTyping')
        }
        // dependencias deben estar vacías según documentación de socket.io
    }, [])

    return (
        <div className="App">
            <h1>Chat Socket.io</h1>
            <p>Users online: {usersOnline.length || 0}</p>

            <ul>
                {usersOnline.length &&
                    usersOnline.map(u => (
                        <li key={u.id}>{u.user}</li>
                    ))
                }
            </ul>

            <div>{
                !logged.current
                ? <UsernameInput 
                    handleUsername={handleUsername}
                    username={username}
                    setUsername={setUsername}/>
                : <ChatContainer 
                    myId={myId}
                    chatBody={chatBody}
                    message={message}
                    handleSend={handleSend}
                    handleIsTyping={handleIsTyping}
                    userTyping={userTyping}/>
            }</div>

        </div>
    )
}

export default App
