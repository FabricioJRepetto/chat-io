import React, { useEffect, useState, useRef } from 'react'

import '../../styles/loading.css'

const LoadingHints = () => {
    const inter = useRef(null)
    const [text, setText] = useState(0)

    useEffect(() => {
        inter.current = setInterval(() => {
            setText(current => {
                if (current === 8) return 0
                else return current + 1
            })
        }, 3000);

        return () => clearInterval(inter.current)
    }, [])

    return (
        <div className='hints-container'>
            <p className={`hint ${text === 1 && 'hint-on'}`}>waking up the server</p>
            <p className={`hint ${text === 2 && 'hint-on'}`}>this may take a few seconds</p>
            <p className={`hint ${text === 3 && 'hint-on'}`}>{`don't worry`}</p>
            <p className={`hint ${text === 5 && 'hint-on'}`}>cleaning rooms</p>
            <p className={`hint ${text === 6 && 'hint-on'}`}>picking up tokens</p>
            <p className={`hint ${text === 7 && 'hint-on'}`}>summoning an evil machine</p>
            <p className={`hint ${text === 8 && 'hint-on'}`}>clanking noises</p>
        </div>
    )
}

export default LoadingHints