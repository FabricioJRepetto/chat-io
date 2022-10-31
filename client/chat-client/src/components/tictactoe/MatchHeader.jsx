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
            <div>You: {score.player || 0}</div>
            <div>Round: {round}</div>
            <div>Roboto: {score.bot || 0}</div>
            <h2>{playerTurn ? 'Your turn!' : 'Waiting for your oponent movement'}</h2>
        </div>
    )
}
