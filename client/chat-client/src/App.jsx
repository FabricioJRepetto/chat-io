import React, { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'
import { BACK_URL } from './constants'
import ChatContainer from './components/ChatContainer'
import UsernameInput from './components/UsernameInput'
import Contacts from './components/contacts/Contacts'
import DMChat from './components/dmChat/DMChat'
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
    const [selectedUser, setSelectedUser] = useState(false)

    const { dispatch, state: { users, inboxes, dmChat } } = useCon()

    // importante utilizar una cb para setear los mensajes
    //? https://stackoverflow.com/questions/70671831/react-socket-io-not-displaying-latest-message-passed-down-as-prop
    const handleNewMessage = (m) => {
        if (logged.current) {
            setChatBody(prev => [...prev, m])
        }
    }

    const handleNewConnection = (c) => {
        myId.current = c.id
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
            setSelectedUser({ name, id })
        } catch (err) {
            console.log(err);
        }
    }

    const handleNewInbox = (m) => {
        // Al ser una callback e intentar acceder al estado mediante el hook useState
        // obtengo el valor por defecto
        // (sin importar que se haya actualizado antes)
        // Si utilizamos setState obtenemos el valor actualizado...
        // También se podría utilizar useRef en su lugar
        //? https://stackoverflow.com/questions/57847594/react-hooks-accessing-up-to-date-state-from-within-a-callback
        // setInboxes(current => {
        //     let aux = current
        //     // si soy el emisor...
        //     if (d.id === myId.current) aux.get(d.to).messages.push(d)
        //     else { // si soy el receptor...
        //         if (aux.has(d.id)) aux.get(d.id).messages.push(d)
        //         else aux.set(d.id, { messages: [d], name: d.from })
        //     }
        //     return aux
        // })

        try {
            // si el destinatario soy yo, abro el chat
            if (m.to.id === myId.current) {
                setSelectedUser({ id: m.from.id, name: m.from.name })
                let newDmChat = { ...dmChat, [m.from.id]: false }
                dispatch({ type: 'dmTyping', newDmChat })
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
            let newDmChat = { ...dmChat, [id]: typing }
            dispatch({ type: 'dmTyping', payload: newDmChat })
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
            <p>{myId.current}</p>
            <button onClick={() => console.log(myId.current)}>ID</button>
            <button onClick={() => console.log(inboxes)}>inbox</button>

            <div>{
                !logged.current
                    ? <UsernameInput
                        handleUsername={handleUsername}
                        username={username}
                        setUsername={setUsername} />
                    : <div className='container'>
                        <Contacts myId={myId.current} />
                        <ChatContainer myId={myId.current}
                            chatBody={chatBody}
                            message={message}
                            handleSend={handleSend}
                            handleIsTyping={handleIsTyping}
                            handleOpenInbox={handleOpenInbox}
                            userTyping={userTyping} />
                    </div>
            }</div>

            {selectedUser &&
                <DMChat key={selectedUser.id + myId.current}
                    user={selectedUser}
                    socket={socket}
                    handleSendPrivate={handleSendPrivate}
                />
            }
        </div>
    )
}

export default App
