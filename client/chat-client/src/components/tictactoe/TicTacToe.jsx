import React, { useState, useRef } from 'react'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCon } from '../../context'
import Board from './Board'
import { checkLine } from './utils/checkLine'
import UsernameInput from '../UsernameInput'
import SelectMenu from './utils/SelectMenu'
import { MatchHeader } from './MatchHeader'
import './TicTacToe.css'

const TicTacToe = ({ socket }) => {
    const { state: { myId, username, logged } } = useCon()
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

        if (turn >= 4) {
            let win = checkLine(MOVES.current)
            if (win) {
                //: desactivar el click del usuario
                //: esperar la otro usuario para contunuar la partida
                setWaiting(true)
                socket.emit('roundEnd', { room: roomid, type: 'winner', m: { r, c, id: myId, roundEnd: `YOU LOSE THIS ROUND...` } })
            } else if (turn > 8) {
                //: emit draw y actualizar data de la partida
                socket.emit('roundEnd', { room: roomid, type: 'draw', m: { r, c, id: myId, roundEnd: `DRAW` } })
                return

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
                setRow0((current) => {
                    let aux = current
                    aux[c] = sign
                    return aux
                })
                break;
            case 1:
                setRow1((current) => {
                    let aux = current
                    aux[c] = sign
                    return aux
                })
                break;
            default:
                setRow2((current) => {
                    let aux = current
                    aux[c] = sign
                    return aux
                })
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
        socket.emit('start', { room: roomid, winCon })
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
        //? el usuario presiona el boton "abandonar"
        // socket.emit('leaveRoom', roomid)
        navigate('/')
    }

    const disconnect = ({ message }) => {
        //: se desconecta de la sala
        //? el otro usuario abandona, 
        //? el servidor nos dice que nos desconectemos
        alert(message)
        // socket.emit('leaveRoom', roomid)
        navigate('/')
    }

    // useEffect(() => {
    //     return () => {
    //         //: se desconecta de la sala
    //         //? el usuario cierra la tab, etc., etc.
    //         socket.emit('leaveRoom', roomid)
    //     }
    //     // eslint-disable-next-line
    // }, [])


    useEffect(() => {
        //? se conecta a la sala
        logged && socket.emit('TTTRoom', roomid)

        // eslint-disable-next-line
    }, [logged])

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
            //: se desconecta de la sala
            //? el usuario cierra la tab, etc., etc.
            socket.emit('leaveRoom', roomid)
        }
        // eslint-disable-next-line
    }, [])


    return (
        <div>
            <button onClick={leave}>Leave</button>
            {!logged
                ? <UsernameInput socket={socket} />
                : <>
                    <div className='game-container'>
                        {playing
                            ? <div className='playing'>
                                <MatchHeader
                                    sign={sign}
                                    score={score}
                                    round={rounds}
                                    playerTurn={currentTurn === myId}
                                    users={users}
                                    playerId={myId} />

                                <Board
                                    row0={row0}
                                    row1={row1}
                                    row2={row2}
                                    tilePicker={tilePicker}
                                    sign={sign}
                                    myId={myId}
                                    currentTurn={currentTurn}
                                    waiting={waiting} />

                            </div>
                            : <>
                                {users.find(u => u.id === myId && u.role === 'owner') &&
                                    <div className='pvp-menu'>
                                        <SelectMenu
                                            name={'Points to win'}
                                            options={[3, 5]}
                                            setOption={setWinCon} />

                                        {users.length < 2
                                            ? <p>Waiting for a challenger...</p>
                                            : <p>{users[1].name} has join!</p>}
                                        <button onClick={startMatch}
                                            disabled={users.length < 2}>START</button>
                                    </div>}
                            </>}
                    </div>

                    <div className='room-user-list'>Usuarios: {
                        users.length &&
                        users.map(u => (
                            <div key={u.id}>
                                <b onClick={() => console.log(u.id)}>{u.name}</b>
                                <i>{`(${u.role})`}</i>
                            </div>
                        ))
                    }</div>
                    <h3>Room ID: {roomid}</h3>
                </>}

        </div>
    )
}

export default TicTacToe