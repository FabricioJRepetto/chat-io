import React, { useState, useRef } from 'react'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useCon } from '../../context'
import './TicTacToe.css'

const TicTacToe = ({ socket }) => {
    const { state: { myId, username } } = useCon()
    const { id: roomid } = useParams()
    const [users, setUsers] = useState([])
    const [playing, setPlaying] = useState(false)
    const [score, setScore] = useState({})
    const [rounds, setRounds] = useState(0)
    const [turn, setTurn] = useState(1)
    const [sign, setSign] = useState('O')
    // const currentTurn = useRef(null)
    const [currentTurn, setCurrentTurn] = useState(false)
    const otherPlayer = useRef(false)

    //? TABLERO
    const [row0, setRow0] = useState([null, null, null])
    const [row1, setRow1] = useState([null, null, null])
    const [row2, setRow2] = useState([null, null, null])

    //? MOVIMIENTOS DEL JUGADOR
    const MOVES = useRef({ A: [], B: [], C: [] })

    const checkTicTacToe = () => {
        const { A, B, C } = MOVES.current
        if (A.length === 3 || B.length === 3 || C.length === 3) {
            console.log('Horizontal win!')
            return 'Horizontal win!'
        } else if (A.includes(0) && B.includes(1) && C.includes(2)) {
            console.log('Diagonal win!')
            return 'Diagonal win!'
        } else if (A.includes(2) && B.includes(1) && C.includes(0)) {
            console.log('Diagonal win!')
            return 'Diagonal win!'
        } else {
            for (let i = 0; i < 3; i++) {
                if (A.includes(i) && B.includes(i) && C.includes(i)) {
                    console.log('Vertical win!')
                    return 'Vertical win!'
                }
            }
        }
        return false
    }

    const tilePicker = ({ r, c }) => {
        setTurn(current => {
            let aux = current
            aux++
            return aux
        })

        const { A, B, C } = MOVES.current
        let aux = []

        switch (r) {
            case 0:
                if (!row0[c]) {
                    aux = [...row0]
                    aux.splice(c, 1, sign)
                    setRow0(aux)
                    A.push(c)
                }
                break;

            case 1:
                if (!row1[c]) {
                    aux = [...row1]
                    aux.splice(c, 1, sign)
                    setRow1(aux)
                    B.push(c)
                }
                break;

            default:
                if (!row2[c]) {
                    aux = [...row2]
                    aux.splice(c, 1, sign)
                    setRow2(aux)
                    C.push(c)
                }
                break;
        }

        console.log(turn);

        if (turn === 9) {
            //: emit draw y actualizar data de la partida
            socket.emit('roundEnd', { id: myId, room: roomid, type: 'draw', m: { r, c, final: `DRAW` } })
            //: abrir modal de DRAW
            alert('DRAW!!')
            //: al cerrarlo, resetear todo
            resetBoard()
            return

        } else if (turn >= 3) {
            let win = checkTicTacToe()
            if (win) {
                socket.emit('roundEnd', { id: myId, room: roomid, type: 'winner', m: { r, c, final: `YOU LOSE...` } })
                setTimeout(() => {
                    alert(`YOU WIN!`)
                    //: al cerrar el modal, resetear
                    resetBoard()
                }, 1000);
            } else return socket.emit('movement', { r, c, id: myId, room: roomid })

        } else socket.emit('movement', { r, c, id: myId, room: roomid })

        setCurrentTurn(() => otherPlayer.current)
    }

    //? MOVIMIENTO DEL OTRO JUGADOR
    const movementSync = ({ r, c, id, final = false }) => {
        if (id === myId) return

        setTurn(current => {
            let aux = current
            aux++
            return aux
        })
        let sign = 'X'

        switch (r) {
            case 0:
                if (!row0[c]) {
                    setRow0((current) => {
                        let aux = current
                        aux[c] = sign
                        return aux
                    })
                }
                break;

            case 1:
                if (!row1[c]) {
                    setRow1((current) => {
                        let aux = current
                        aux[c] = sign
                        return aux
                    })
                }
                break;

            default:
                if (!row2[c]) {
                    setRow2((current) => {
                        let aux = current
                        aux[c] = sign
                        return aux
                    })
                }
                break;
        }

        if (final) {
            // if es un player
            setTimeout(() => {
                //: modal final
                alert(final)
                //: reset
                resetBoard()
            }, 1000);
            // else alert(`${winner} WINS!`)
        }

        setCurrentTurn(() => myId)
    }

    const resetBoard = () => {
        setTurn(1)
        setRow0([null, null, null])
        setRow1([null, null, null])
        setRow2([null, null, null])
        MOVES.current = { A: [], B: [], C: [] }
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
        if (users.length === 2) otherPlayer.current = users.find(e => e.id !== myId)
    }

    const startMatch = () => {
        socket.emit('start', roomid)
    }
    const startHandler = () => {
        setPlaying(true)
        alert('Game starts!')

        setUsers(current => {
            console.log(current[0].id);
            setCurrentTurn(() => current[0].id)
            return current
        })
    }

    useEffect(() => {
        //? se conecta a la sala
        socket.emit('TTTRoom', roomid)
        // eslint-disable-next-line
    }, [])


    useEffect(() => {
        socket.on('roomUpdate', (data) => roomUpdater(data))
        socket.on('roomUsersUpdate', (data) => userListUpdater(data))
        socket.on('movement', (m) => movementSync(m))
        socket.on('start', () => startHandler())

        return () => {
            socket.off('roomUpdate')
            socket.off('roomUsersUpdate')
            socket.off('movement')
            socket.off('start')
        }
        // eslint-disable-next-line
    }, [])


    return (
        <div>
            <h1>TicTacToe</h1>
            <h3>Room ID: {roomid}</h3>
            <button onClick={() => {
                console.log(row0)
                console.log(row1)
                console.log(row2)
            }
            }>Board</button>
            <br />
            <button onClick={resetBoard}>reset</button>

            <div className='game-container'>
                {playing
                    ? <div className='playing'>
                        <>
                            <h2>{currentTurn === myId ? 'Your turn!' : 'Waiting for your oponents movement'}</h2>
                            <div>player #1: {score[users[0].id] || 0}</div>
                            <div>player #2: {score[users[1].id] || 0}</div>
                            <div>Round: {rounds}</div>
                            <div>Turn: {turn}</div>
                        </>

                        <div className='board' style={{ pointerEvents: currentTurn === myId ? 'all' : 'none' }}>
                            <div>{
                                row0.map((tile, i) => (
                                    <div key={'r0' + i}
                                        className="tile"
                                        onClick={() => tilePicker({ r: 0, c: i, id: myId })}
                                        style={{ backgroundColor: tile === sign ? '#3c5040' : 'transparent', pointerEvents: currentTurn === myId && !tile ? 'all' : 'none' }}>{tile}</div>
                                ))
                            }</div>
                            <div>{
                                row1.map((tile, i) => (
                                    <div key={'r1' + i}
                                        className="tile"
                                        onClick={() => tilePicker({ r: 1, c: i, id: myId })}
                                        style={{ backgroundColor: tile === sign ? '#3c5040' : 'transparent', pointerEvents: currentTurn === myId && !tile ? 'all' : 'none' }}>{tile}</div>
                                ))
                            }</div>
                            <div>{
                                row2.map((tile, i) => (
                                    <div key={'r2' + i}
                                        className="tile"
                                        onClick={() => tilePicker({ r: 2, c: i, id: myId })}
                                        style={{ backgroundColor: tile === sign ? '#3c5040' : 'transparent', pointerEvents: currentTurn === myId && !tile ? 'all' : 'none' }}>{tile}</div>
                                ))
                            }</div>
                        </div>
                    </div>
                    : <>
                        {users.length < 2
                            ? <h2>Waiting for a challenger...</h2>
                            : <h2>{users[1].name} has join!</h2>}
                        {users.find(u => u.id === myId && u.role === 'owner') &&
                            <button onClick={startMatch}
                                disabled={users.length < 2}>START</button>}
                    </>}
                <div className='room-user-list'>Usuarios: {
                    users.length &&
                    users.map(u => (
                        <div key={u.id}>
                            <b onClick={() => console.log(u.id)}>{u.name}</b>
                            <i>{`(${u.role})`}</i>
                        </div>
                    ))
                }</div>
            </div>

        </div>
    )
}

export default TicTacToe