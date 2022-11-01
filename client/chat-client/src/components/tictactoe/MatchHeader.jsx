import React from 'react'
import '../styles/MatchHeader.css'

export const MatchHeader = (props) => {
    const {
        score,
        round,
        playerTurn
    } = props

    return (
        <div className='header-container'>
            <div className='header-txt your-score'>You: {score.player || 0}</div>
            <div className='header-txt their-score'>Roboto: {score.bot || 0}</div>
            <div className='current-round'>{round}</div>
            <h2>{playerTurn ? 'Your turn!' : `Oponent's turn`}</h2>
        </div>
    )
}
