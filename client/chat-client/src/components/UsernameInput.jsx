import React from 'react'

const UsernameInput = (props) => {
    const {
        handleUsername, 
        username, 
        setUsername
    } = props
    
    return (
        <div>
            <h2>What's your name?</h2>
            <form onSubmit={handleUsername}>
                <input type="text" onChange={e => setUsername(e.target.value)} value={username}/>
                <button onClick={handleUsername}>join</button>
            </form>
        </div>
    )
}

export default UsernameInput