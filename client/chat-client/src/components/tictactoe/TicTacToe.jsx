import React, { useState, useRef } from 'react'
import './TicTacToe.css'

const TicTacToe = () => {
    const [turn, setTurn] = useState(1)
    //? TABLERO
    const [row0, setRow0] = useState(['', '', ''])
    const [row1, setRow1] = useState(['', '', ''])
    const [row2, setRow2] = useState(['', '', ''])

    //? MOVIMIENTOS DEL JUGADOR
    const A = useRef([])
    const B = useRef([])
    const C = useRef([])

    const checkTicTacToe = () => {
        if (A.current.length === 3 || B.current.length === 3 || C.current.length === 3) alert('Horizontal win!')
        else if (A.current.includes(0) && B.current.includes(1) && C.current.includes(2)) alert('Diagonal win!')
        else if (A.current.includes(2) && B.current.includes(1) && C.current.includes(0)) alert('Diagonal win!')
        else {
            for (let i = 0; i < 3; i++) {
                if (A.current.includes(i) && B.current.includes(i) && C.current.includes(i)) return alert('Vertical win!')
            }
        }
    }

    const tilePicker = (r, c) => {
        let aux = []
        setTurn(() => turn + 1)

        switch (r) {
            case 0:
                //: checkear turno                
                console.log(row0[c]);
                if (!row0[c]) {
                    aux = [...row0]
                    aux.splice(c, 1, 'X')
                    setRow0(aux)
                    A.current.push(c)
                }
                break;

            case 1:
                //: checkear turno
                if (!row1[c]) {
                    aux = [...row1]
                    aux.splice(c, 1, 'X')
                    setRow1(aux)
                    B.current.push(c)
                }
                break;

            default:
                //: checkear turno
                if (!row2[c]) {
                    aux = [...row2]
                    aux.splice(c, 1, 'X')
                    setRow2(aux)
                    C.current.push(c)
                }
                break;
        }
        turn >= 3 && checkTicTacToe()
        //: emit movimiento o gane!

        // setPhase()

        // creación de sala
        // esperando oponente
        // esperando "START"
        // asignación de turnos
        // turno 1
        // sincronización de movimientos
        // turno 2
    }

    const resetBoard = () => {
        setTurn(1)
        setRow0(['', '', ''])
        setRow1(['', '', ''])
        setRow2(['', '', ''])
        A.current = []
        B.current = []
        C.current = []
    }

    return (
        <div>
            <h1>TicTacToe</h1>
            <button onClick={resetBoard}>reset</button>

            <div className='board'>
                <div>{
                    row0.map((tile, i) => (
                        <div key={'r0' + i}
                            className="tile"
                            onClick={() => tilePicker(0, i)}>{tile}</div>
                    ))
                }</div>
                <div>{
                    row1.map((tile, i) => (
                        <div key={'r1' + i}
                            className="tile"
                            onClick={() => tilePicker(1, i)}>{tile}</div>
                    ))
                }</div>
                <div>{
                    row2.map((tile, i) => (
                        <div key={'r2' + i}
                            className="tile"
                            onClick={() => tilePicker(2, i)}>{tile}</div>
                    ))
                }</div>
            </div>
        </div>
    )
}

export default TicTacToe