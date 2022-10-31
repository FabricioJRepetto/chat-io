import React, { useState } from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const MainMenu = () => {
    const navigate = useNavigate()
    const [roomIdInput, setRoomIdInput] = useState('')
    const [open, setOpen] = useState(false)
    const [inputAlert, setInputAlert] = useState(false)

    const newTTTRoom = () => {
        let roomid = Date.now().toString()
        navigate(`/game/${roomid}`)
    }

    const openInput = () => {
        setOpen(true)
    }

    const joinRoom = (e) => {
        e.preventDefault()
        if (roomIdInput.length === 13) {
            navigate(`/game/${roomIdInput}`)
        } else {
            setInputAlert(() => 'Invalid ID')
        }
    }

    useEffect(() => {
        inputAlert && setInputAlert(false)
        // eslint-disable-next-line
    }, [roomIdInput])

    return (
        <div className='mainmenu-container'>
            <p className='s-txt'>Play against an evil machine</p>
            <div className='p-txt menu-opt' onClick={() => navigate('/ia')}>START</div>

            <p className='s-txt'>...or play against a friend</p>
            <div className='p-txt menu-opt' onClick={newTTTRoom}>Invite</div>

            <div className='p-txt menu-opt' onClick={open ? joinRoom : openInput}>Join</div>
            <form onSubmit={joinRoom} className={`room-id-input ${open && 'room-id-input-open'}`}>
                <input type="text"
                    placeholder='Enter the room ID'
                    value={roomIdInput}
                    onChange={(e) => setRoomIdInput(e.target.value)} />
                <p className='err-txt'>{inputAlert || ''}</p>
            </form>
        </div>
    )
}

export default MainMenu