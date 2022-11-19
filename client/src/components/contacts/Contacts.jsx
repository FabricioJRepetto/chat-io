import React, { useState, useEffect } from 'react'
import { useCon } from '../../context'

import './Contacts.css'

const Contacts = ({ handleOpenInbox }) => {
    const { state: { users, myId } } = useCon()
    const [usersOnline, setUsersOnline] = useState(false)

    useEffect(() => {
        setUsersOnline(users)
    }, [users])

    return (
        <div className='contacts-container'>
            <h3>Users {users.length}</h3>
            <div>{usersOnline.length > 0
                ? usersOnline.map(u => (
                    u.id !== myId &&
                    <div key={u.id}
                        onClick={() => handleOpenInbox({ id: u.id, name: u.user })}>
                        <b style={{ color: u.color }}>{u.user}</b>
                    </div>
                ))
                : <p>No users Online</p>
            }</div>
        </div>
    )
}

export default Contacts