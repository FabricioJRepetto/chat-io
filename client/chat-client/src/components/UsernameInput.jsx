import React, { useState } from 'react'
import { useEffect } from 'react'
import { useCon } from '../context'

const UsernameInput = ({ socket }) => {
    const [input, setInput] = useState('')
    const [inputAlert, setInputAlert] = useState(false)

    const { dispatch } = useCon()

    const handleUsername = (e) => {
        e.preventDefault()

        if (!input) {
            setInputAlert('enter a nickname')
        } else if (input.length > 15) {
            setInputAlert('no more than 15 characters please')
        } else {
            socket.emit('username', input)
            dispatch({ type: 'setUsername', payload: input })
            dispatch({ type: 'setLogged', payload: true })
        }
    }

    useEffect(() => {
        setTimeout(() => document.getElementById('name-input').focus(), 400);
    }, [])

    return (
        <div className='name-input-container'>
            <form onSubmit={handleUsername}>
                <label htmlFor="name-input"><h2>What's your name?</h2></label>
                <input type="text" id='name-input' onChange={e => setInput(e.target.value)} value={input} />
                <p className='err-txt'>{inputAlert || ''}</p>

                <div className={`p-txt menu-opt `}
                    onClick={handleUsername}>
                    join
                </div>
            </form>
        </div>
    )
}

export default UsernameInput