import React, { useState, useEffect } from 'react'
import { Routes, Route } from "react-router-dom"
import io from 'socket.io-client'
import { BACK_URL } from './constants'
import { useCon } from './context'
import UsernameInput from './components/UsernameInput'
import MainMenu from './components/MainMenu'
import TicTacToe from './components/tictactoe/TicTacToe'
import RageAgainstTheMachine from './components/tictactoe/RageAgainstTheMachine'
import Loading from './components/tictactoe/utils/Loading'
import { Logo } from './components/Logo'
import LoadingHints from './components/tictactoe/utils/LoadingHints'

import './App.css'

// se conecta al socket
const socket = io(BACK_URL)

function App() {
    const [hint, setHint] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const { dispatch,
        state: {
            logged
        }
    } = useCon()

    const handleNewConnection = (c) => {
        dispatch({ type: 'usersUpdate', payload: c.usersOnline })
        dispatch({ type: 'setId', payload: c.id })
        setIsLoading(false)
        setTimeout(() => setLoading(false), 500)
    }

    const handleConnectionsUpdate = (u) => {
        dispatch({ type: 'usersUpdate', payload: u.usersOnline })
    }

    useEffect(() => {
        loading && setTimeout(() => {
            setHint(true)
        }, 5000);
        // eslint-disable-next-line
    }, [])


    useEffect(() => {
        socket.on('newConnection', (c) => handleNewConnection(c))
        socket.on('connectionsUpdate', (u) => handleConnectionsUpdate(u))
        socket.on('room', (d) => console.log(d))

        return () => {
            socket.off('connectionsUpdate')
            socket.off('newConnection')
            socket.off('room')
        }
        // dependencias deben estar vacías según documentación de socket.io
        // eslint-disable-next-line
    }, [])

    return (
        <div className="App">
            <div className='watermark'>
                <p>TicTacToe Io - Beta v1.9</p>
            </div>

            <Routes>
                <Route path="/" element={
                    <div>
                        <Logo logged={logged} />
                        {loading
                            ? <div className={`loading ${!isLoading && 'notLoading'}`}>
                                <h2>connecting to server <Loading /></h2>
                                {hint && <LoadingHints />}
                            </div>
                            : <>
                                {!logged
                                    ? <UsernameInput socket={socket} />
                                    : <MainMenu />}
                            </>
                        }</div>
                } ></Route>
                <Route path='/ia' element={<RageAgainstTheMachine />}></Route>
                <Route path='/game/:id' element={<TicTacToe socket={socket} />}></Route>
            </Routes>


        </div>
    )
}

export default App