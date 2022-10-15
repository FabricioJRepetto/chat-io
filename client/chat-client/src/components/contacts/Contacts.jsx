import React, { useState, useEffect } from 'react'
import { useCon } from '../../context'

import './Contacts.css'

const Contacts = ({ myId }) => {
    const { state: { users } } = useCon()
    const [usersOnline, setUsersOnline] = useState(false)

    useEffect(() => {
        setUsersOnline(users)
    }, [users])

    return (
        <div className='contacts-container'>
            <h3>Users {users.length}</h3>
            <div>{usersOnline.length > 0
                ? usersOnline.map(u => (
                    u.id !== myId && <div key={u.id} >
                        <b style={{ color: u.color }}>{u.user}</b>
                    </div>
                ))
                : <p>No users Online</p>
            }</div>
        </div>
    )
}

export default Contacts