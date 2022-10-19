import React, { useState } from 'react'
import { useCon } from '../context'

const UsernameInput = ({ socket }) => {
    const [input, setInput] = useState('')

    const { dispatch } = useCon()

    const handleUsername = (e) => {
        e.preventDefault()
        if (input && input.length < 15) {
            socket.emit('username', input)
            dispatch({ type: 'setUsername', payload: input })
            dispatch({ type: 'setLogged', payload: true })
        }
    }

    return (
        <div>
            <h2>What's your name?</h2>
            <form onSubmit={handleUsername}>
                <input type="text" onChange={e => setInput(e.target.value)} value={input} />
                <button onClick={handleUsername}>join</button>
            </form>
        </div>
    )
}

export default UsernameInput