import React, { useState, useRef } from 'react'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCon } from '../../context'
import Board from './Board'
import { checkLine } from './utils/checkLine'
import './TicTacToe.css'

const TicTacToe = ({ socket }) => {
    const { state: { myId, username } } = useCon()
    const { id: roomid } = useParams()
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const otherPlayer = useRef(false)
    const [sign, setSign] = useState('O')
    const [winCon, setWinCon] = useState(3)

    const [playing, setPlaying] = useState(false)
    const [waiting, setWaiting] = useState(false)
    const [turn, setTurn] = useState(1)
    const [currentTurn, setCurrentTurn] = useState(false)

    const [rounds, setRounds] = useState(0)
    const [score, setScore] = useState({})

    //? TABLERO
    const [row0, setRow0] = useState([null, null, null])
    const [row1, setRow1] = useState([null, null, null])
    const [row2, setRow2] = useState([null, null, null])

    //? MOVIMIENTOS DEL JUGADOR
    const MOVES = useRef({ A: [], B: [], C: [] })

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

        // console.log(`%c ${username} (you) moves: R: ${r} - C: ${c} `, 'background-color: #bbff7b; color: #000000; font-weight: bold;');

        if (turn === 9) {
            //: emit draw y actualizar data de la partida
            socket.emit('roundEnd', { room: roomid, type: 'draw', m: { r, c, id: myId, roundEnd: `DRAW` } })
            return

        } else if (turn >= 3) {
            let win = checkLine(MOVES.current)
            if (win) {
                //: desactivar el click del usuario
                //: esperar la otro usuario para contunuar la partida
                setWaiting(true)
                socket.emit('roundEnd', { room: roomid, type: 'winner', m: { r, c, id: myId, roundEnd: `YOU LOSE THIS ROUND...` } })
            } else socket.emit('movement', { r, c, id: myId, room: roomid })

        } else socket.emit('movement', { r, c, id: myId, room: roomid })

        setCurrentTurn(() => otherPlayer.current.id)
    }

    //? MOVIMIENTO DEL OTRO JUGADOR
    const movementSync = ({ r, c, id, roundEnd = false, final = false }) => {
        if (id === myId) {
            //: notifica si gana el originador del movimiento
            if (final) {
                setTimeout(() => {
                    alert(`YOU'RE THE WINNER!`)
                    setPlaying(false)
                    resetBoard()
                }, 1000);
            } else if (roundEnd) {
                setTimeout(() => {
                    roundEnd === 'DRAW' ? alert('DRAW') : alert('YOU WIN THIS ROUND!')
                    resetBoard()
                }, 1000);
            }
            return
        }

        // console.log(`%c Player 2 moves: R: ${r} - C: ${c} `, 'background-color: #ffbd7b; color: #000000; font-weight: bold;');

        //: desactivar el click del usuario
        //: esperar la otro usuario para contunuar la partida
        if (roundEnd) setWaiting(true)

        setTurn(current => {
            let aux = current
            aux++
            return aux
        })
        let sign = 'X'

        switch (r) {
            case 0:
                console.log(!row0[c]);
                if (!row0[c]) {
                    setRow0((current) => {
                        let aux = current
                        aux[c] = sign
                        return aux
                    })
                }
                break;

            case 1:
                console.log(!row1[c]);
                if (!row1[c]) {
                    setRow1((current) => {
                        let aux = current
                        aux[c] = sign
                        return aux
                    })
                }
                break;

            default:
                console.log(!row2[c]);
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
            //: modal final del juego
            setTimeout(() => {
                alert(`THE WINNER IS ${otherPlayer.current.name}`)
                setPlaying(false)
                resetBoard()
            }, 1000);
            return
        }

        if (roundEnd) {
            // if es un player
            setTimeout(() => {
                //: modal final de round
                alert(roundEnd)
                //: reset
                resetBoard()
            }, 1000);
            // else alert(`${winner} WINS!`)
        }

        setCurrentTurn(() => myId)
    }

    const resetBoard = () => {
        //: avisar al back que estoy listo
        socket.emit('playerReady', { room: roomid, id: myId })
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

    const userListUpdater = ({ users, message, reset = false }) => {
        console.log(message)
        setUsers(users)
        if (users.length === 2) otherPlayer.current = users.find(e => e.id !== myId)
    }

    const startMatch = () => {
        //: setear win condition, mejor de 3 || 5, no joda        
        socket.emit('start', { room: roomid, winCon: Math.ceil(winCon / 2) })
    }
    const startHandler = () => {
        setPlaying(true)
        alert('Game starts!')

        setUsers(current => {
            setCurrentTurn(() => current[0].id)
            return current
        })
    }

    const continueMatch = ({ rounds, score }) => {
        setRounds(rounds)
        setScore(score)
        setWaiting(false)
    }

    const leave = () => {
        //: se desconecta de la sala
        socket.emit('leaveRoom', roomid)
        navigate('/')
    }

    const disconnect = ({ message }) => {
        //: se desconecta de la sala
        alert(message)
        socket.emit('leaveRoom', roomid)
        navigate('/')
    }

    useEffect(() => {
        //? se conecta a la sala
        socket.emit('TTTRoom', roomid)

        return () => {
            //: se desconecta de la sala
            socket.emit('leaveRoom', roomid)
        }
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        socket.on('roomUpdate', (data) => roomUpdater(data))
        socket.on('roomUsersUpdate', (data) => userListUpdater(data))
        socket.on('movement', (m) => movementSync(m))
        socket.on('start', startHandler)
        socket.on('continue', (data) => continueMatch(data))
        socket.on('leaveRoom', (data) => disconnect(data))

        return () => {
            socket.off('roomUpdate')
            socket.off('roomUsersUpdate')
            socket.off('movement')
            socket.off('start')
            socket.off('continue')
            socket.off('leaveRoom')
        }
        // eslint-disable-next-line
    }, [])


    return (
        <div>
            <h1>TicTacToe</h1>
            <h3>Room ID: {roomid}</h3>
            <button onClick={leave}>Leave room</button>
            <button onClick={() => {
                console.log(row0)
                console.log(row1)
                console.log(row2)
            }}>Board</button>
            <button onClick={() => console.log(otherPlayer.current)}>Player 2</button>

            <div className='game-container'>
                {playing
                    ? <div className='playing'>
                        <>
                            <h2>{currentTurn === myId ? 'Your turn!' : 'Waiting for your oponents movement'}</h2>
                            <div>{users[0].name}: {score[users[0].id] || 0}</div>
                            <div>{users[1].name}: {score[users[1].id] || 0}</div>
                            <div>Round: {rounds}</div>
                            <div>Turn: {turn}</div>
                        </>
                        <Board row0={row0}
                            row1={row1}
                            row2={row2}
                            tilePicker={tilePicker}
                            sign={sign}
                            myId={myId}
                            currentTurn={currentTurn}
                            waiting={waiting} />

                    </div>
                    : <>
                        {users.length < 2
                            ? <h2>Waiting for a challenger...</h2>
                            : <h2>{users[1].name} has join!</h2>}
                        {users.find(u => u.id === myId && u.role === 'owner') &&
                            <>
                                <select name="betterOf" id="betterOfInput" onChange={(e) => setWinCon(e.target.value)}>
                                    <option value="3" defaultChecked>3</option>
                                    <option value="5">5</option>
                                </select>
                                <button onClick={startMatch}
                                    disabled={users.length < 2}>START</button>
                            </>}
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