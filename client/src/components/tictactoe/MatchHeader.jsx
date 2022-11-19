import React, { useRef, useEffect, useState } from 'react'

import '../styles/MatchHeader.css'

export const MatchHeader = (props) => {
    const {
        sign,
        score,
        round,
        playerTurn,
        users = false,
        playerId = false
    } = props

    const data = useRef(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (users) {
            let P1 = users.find(u => u.id === playerId)
            let P2 = users.find(u => u.id !== playerId)

            data.current = { P1, P2 }
            setLoading(false)
        }
        // eslint-disable-next-line
    }, [users])

    return (
        <div className='header-outer'>
            <div className='header-container'>
                {users
                    ? <>
                        <div className='header-txt your-score'>
                            {!loading && <>
                                <div>{data.current?.P1.name}</div>
                                <p>{score[data.current?.P1.id] || 0}</p>
                            </>}
                        </div>
                        <div className='header-txt their-score'>
                            {!loading && <>
                                <div>{data.current?.P2.name}</div>
                                <p>{score[data.current?.P2.id] || 0}</p>
                            </>}
                        </div>
                    </>
                    : <>
                        <div className='header-txt your-score'>
                            <div>You</div>
                            <p>{score.player || 0}</p>
                        </div>
                        <div className='header-txt their-score'>
                            <div>Bot</div>
                            <p>{score.bot || 0}</p>
                        </div>
                    </>}
                <div className='current-round'>
                    <p>round</p>
                    <div>{round}</div>
                </div>
                <div className={`turn-sign ${playerTurn && 'p1-sign'}`}>{sign}</div>
                <div className={`turn-sign ${playerTurn || 'p2-sign'}`}>{sign === 'X' ? 'O' : 'X'}</div>
            </div>
            <p className='header-turn-indicator'>{playerTurn ? 'Your turn!' : `Oponent's turn`}</p>
        </div>
    )
}
