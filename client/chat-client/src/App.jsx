import React, { useState, useEffect } from 'react'
import io from 'socket.io-client'
import { BACK_URL } from './constants'

import './App.css'

// se conecta al socket
const socket = io(BACK_URL)

function App() {
    const [myId, setMyId] = useState(null)
    const [usersOnline, setUsersOnline] = useState(0)
    const [newUser, setNewUser] = useState('')
    const [message, setMessage] = useState('')
    const [chatBody, setChatBody] = useState([{
        message: 'Welcome to the chat!',
        from: 'system'
    }])

    const handleNewMessage = (m) => {
        // importante utilizar una cb para setear los mensajes
        // https://stackoverflow.com/questions/70671831/react-socket-io-not-displaying-latest-message-passed-down-as-prop
        setChatBody(prev => [...prev, m])    
    }

    const handleNewConnection = (c) => { 
        console.log(c)
        setMyId(c.id)
        setUsersOnline(c.connections)
    }

    const handleNewUser = (u) => { 
        console.log(u);
        setNewUser(u.user)
        setUsersOnline(u.connections)
    }


    useEffect(() => {
        socket.on('newConnection', (c) => handleNewConnection(c))
        socket.on('newUser', (u) => handleNewUser(u))
        socket.on('newMessage', (m) => handleNewMessage(m))
        
        return () => {
            socket.off('newUser')
            socket.off('newConnection')
            socket.off('newMessage')
        }
        // dependencias deben estar vacías según documentación de socket.io
    }, [])
    

    const handleSend = (e) => { 
        e.preventDefault()
        if (message.length) {
            socket.emit('newMessage', message)
            setMessage('')
        }
     }

    return (
        <div className="App">
        <h1>Holiwis mundo</h1>
        <p>{myId}</p>
        <p>users online: {usersOnline}</p>
        <p>{newUser}</p>

        <div>
            {chatBody.length &&
                chatBody.map((m, index) => (
                    <p key={index}>
                        <b>{m.from !== myId ? `${m.from} : ` : 'Me: '}</b>
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

export default App
