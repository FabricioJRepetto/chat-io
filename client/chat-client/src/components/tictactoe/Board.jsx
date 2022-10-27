import React from 'react'

const Board = (props) => {
    const {
        row0,
        row1,
        row2,
        tilePicker,
        sign,
        myId,
        currentTurn,
        waiting
    } = props

    return (
        <div className='board'>
            <div>{
                row0.map((tile, i) => (
                    <div key={'r0' + i}
                        className="tile"
                        onClick={() => tilePicker({ r: 0, c: i, id: myId })}
                        style={{ backgroundColor: tile === sign ? '#3c5040' : 'transparent', pointerEvents: (currentTurn === myId && !tile && !waiting) ? 'all' : 'none' }}>{tile}</div>
                ))
            }</div>
            <div>{
                row1.map((tile, i) => (
                    <div key={'r1' + i}
                        className="tile"
                        onClick={() => tilePicker({ r: 1, c: i, id: myId })}
                        style={{ backgroundColor: tile === sign ? '#3c5040' : 'transparent', pointerEvents: (currentTurn === myId && !tile && !waiting) ? 'all' : 'none' }}>{tile}</div>
                ))
            }</div>
            <div>{
                row2.map((tile, i) => (
                    <div key={'r2' + i}
                        className="tile"
                        onClick={() => tilePicker({ r: 2, c: i, id: myId })}
                        style={{ backgroundColor: tile === sign ? '#3c5040' : 'transparent', pointerEvents: (currentTurn === myId && !tile && !waiting) ? 'all' : 'none' }}>{tile}</div>
                ))
            }</div>
        </div>
    )
}

export default Board