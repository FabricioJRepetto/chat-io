import React, { useState, useRef } from 'react'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import './TicTacToe.css'

const TicTacToe = ({ socket, myId }) => {
    const { id: roomid } = useParams()
    const [users, setUsers] = useState([])
    const [rounds, setRounds] = useState(0)
    const [score, setScore] = useState({})
    const [sign, setSign] = useState('O')
    const [turn, setTurn] = useState(1)

    //? TABLERO
    const [row0, setRow0] = useState(['', '', ''])
    const [row1, setRow1] = useState(['', '', ''])
    const [row2, setRow2] = useState(['', '', ''])

    //? MOVIMIENTOS DEL JUGADOR
    const MOVES = useRef({ A: [], B: [], C: [] })

    const checkTicTacToe = () => {
        const { A, B, C } = MOVES.current
        if (A.length === 3 || B.length === 3 || C.length === 3) {
            // alert('Horizontal win!')
            return 'Horizontal win!'
        } else if (A.includes(0) && B.includes(1) && C.includes(2)) {
            // alert('Diagonal win!')
            return 'Diagonal win!'
        } else if (A.includes(2) && B.includes(1) && C.includes(0)) {
            // alert('Diagonal win!')
            return 'Diagonal win!'
        } else {
            for (let i = 0; i < 3; i++) {
                if (A.includes(i) && B.includes(i) && C.includes(i)) {
                    // alert('Vertical win!')
                    return 'Vertical win!'
                }
            }
        }
        return false
    }

    const tilePicker = (r, c) => {
        const { A, B, C } = MOVES.current
        let aux = []
        setTurn(() => turn + 1)

        switch (r) {
            case 0:
                //: checkear turno
                if (!row0[c]) {
                    aux = [...row0]
                    aux.splice(c, 1, sign)
                    setRow0(aux)
                    A.push(c)
                }
                break;

            case 1:
                //: checkear turno
                if (!row1[c]) {
                    aux = [...row1]
                    aux.splice(c, 1, sign)
                    setRow1(aux)
                    B.push(c)
                }
                break;

            default:
                //: checkear turno
                if (!row2[c]) {
                    aux = [...row2]
                    aux.splice(c, 1, sign)
                    setRow2(aux)
                    C.push(c)
                }
                break;
        }
        if (turn === 9) {
            //: emit draw
            return alert('DRAW')

        } else if (turn >= 3) {
            let win = checkTicTacToe()
            win
                ? socket.emit('winner', myId)
                : socket.emit('movement', { r, c })

        } else socket.emit('movement', { r, c })

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
        MOVES.current = { A: [], B: [], C: [] }
    }

    const movementHandler = (m) => {
        console.log(m);
    }

    const winHandler = (id) => {
        console.log(id === myId ? `YOU WIN!` : `YOU LOSE...`)
    }

    const roomUpdater = ({ board, rounds, score }) => {
        setRow0(board.row0)
        setRow1(board.row1)
        setRow2(board.row2)
        setRounds(rounds)
        setScore(score)
    }

    const userListUpdater = ({ users, message }) => {
        console.log(message)
        setUsers(users)
    }

    useEffect(() => {
        socket.emit('TTTRoom', roomid)
        // eslint-disable-next-line
    }, [])


    useEffect(() => {
        socket.on('roomUpdate', (data) => roomUpdater(data))
        socket.on('roomUsersUpdate', (data) => userListUpdater(data))
        socket.on('movement', (m) => movementHandler(m))
        socket.on('winner', (id) => winHandler(id))

        return () => {
            socket.off('roomUpdate')
            socket.off('roomUsersUpdate')
            socket.off('movement')
            socket.off('winner')
        }
        // eslint-disable-next-line
    }, [])


    return (
        <div>
            <h1>TicTacToe</h1>
            <h2>Room ID: {roomid}</h2>
            <button onClick={resetBoard}>reset</button>

            <div>player #1: {score[users[0]] || 0}</div>
            <div>player #2: {score[users[1]] || 0}</div>
            <div>Round: {rounds}</div>

            <div>
                <div className='board'>
                    <div>{
                        row0.map((tile, i) => (
                            <div key={'r0' + i}
                                className="tile"
                                onClick={() => tilePicker(0, i)}
                                style={{ backgroundColor: tile === sign ? '#3c5040' : 'transparent' }}>{tile}</div>
                        ))
                    }</div>
                    <div>{
                        row1.map((tile, i) => (
                            <div key={'r1' + i}
                                className="tile"
                                onClick={() => tilePicker(1, i)}
                                style={{ backgroundColor: tile === sign ? '#3c5040' : 'transparent' }}>{tile}</div>
                        ))
                    }</div>
                    <div>{
                        row2.map((tile, i) => (
                            <div key={'r2' + i}
                                className="tile"
                                onClick={() => tilePicker(2, i)}
                                style={{ backgroundColor: tile === sign ? '#3c5040' : 'transparent' }}>{tile}</div>
                        ))
                    }</div>
                </div>
                <div className='room-user-list'>Usuarios: {
                    users.length &&
                    users.map(u => (
                        <div><b onClick={() => console.log(u.id)}>{u.name}</b> <i>{`(${u.role})`}</i></div>
                    ))
                }</div>
            </div>

        </div>
    )
}

export default TicTacToe