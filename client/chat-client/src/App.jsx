import React, { useState, useEffect } from 'react'
import io from 'socket.io-client'
import { BACK_URL } from './constants'
import ChatContainer from './components/ChatContainer'

import './App.css'
import UsernameInput from './components/UsernameInput'

// se conecta al socket
const socket = io(BACK_URL)

function App() {
    const [logged, setLogged] = useState(false)
    const [myId, setMyId] = useState(null)
    const [username, setUsername] = useState('')
    const [usersOnline, setUsersOnline] = useState(0)
    const [message, setMessage] = useState('')
    const [chatBody, setChatBody] = useState([{
        message: 'Welcome to the chat!',
        from: 'system'
    }])

    // importante utilizar una cb para setear los mensajes
    //? https://stackoverflow.com/questions/70671831/react-socket-io-not-displaying-latest-message-passed-down-as-prop
    const handleNewMessage = (m) => {
        console.log(m);
        setChatBody(prev => [...prev, m])
    }

    const handleNewConnection = (c) => {
        setMyId(c.id)
        setUsersOnline(c.connections)
    }

    const handleUserUpdate = (u) => {
        setChatBody(prev => [...prev, u.update])
        setUsersOnline(u.connections)
    }

    const handleSend = (e) => { 
        e.preventDefault()
        if (message.length) {
            socket.emit('newMessage', message)
            setMessage('')
        }
    }

    const handleUsername = (e) => { 
        e.preventDefault()
        if (username && username.length < 10) {
            socket.emit('username', username)
            setUsername('')
            setLogged(true)
        }
    }

    useEffect(() => {
        socket.on('newConnection', (c) => handleNewConnection(c))
        socket.on('userUpdate', (u) => handleUserUpdate(u))
        socket.on('newMessage', (m) => handleNewMessage(m))
        
        return () => {
            socket.off('userUpdate')
            socket.off('newConnection')
            socket.off('newMessage')
        }
        // dependencias deben estar vacías según documentación de socket.io
    }, [])

    return (
        <div className="App">
            <h1>Chat Socket.io</h1>
            <p>users online: {usersOnline}</p>
            
            <div>{
                !logged
                ? <UsernameInput 
                    handleUsername={handleUsername}
                    username={username}
                    setUsername={setUsername}/>
                : <ChatContainer 
                    myId={myId}
                    chatBody={chatBody}
                    message={message}
                    handleSend={handleSend}
                    setMessage={setMessage}/>
            }</div>

        </div>
    )
}

export default App
