import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCon } from '../../context'
import Board from './Board'
import { checkLine } from './utils/checkLine'
import UsernameInput from '../UsernameInput'
import { MatchHeader } from './MatchHeader'
import { useAlerts } from './utils/useAlerts'
import MatchAlerts from './MatchAlerts'
import Menu from './Menu'

import './TicTacToe.css'
import DMChat from '../dmChat/DMChat'

const TicTacToe = ({ socket }) => {
    const { dispatch,
        state: {
            myId,
            username,
            logged,
            chatConfig }
    } = useCon()

    const { id: roomid } = useParams()
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const otherPlayer = useRef(false)
    const [sign] = useState('O')
    const [winCon, setWinCon] = useState(3)
    const [winStyle, setWinStyle] = useState(false)

    const [isOpen, openAlert, closeAlert, props] = useAlerts()

    // const [loading, setLoading] = useState(true)
    const [playing, setPlaying] = useState(false)
    const [menu, setMenu] = useState(true)
    const [waiting, setWaiting] = useState(true)
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

    //? se conecta a la sala
    useEffect(() => {
        logged && socket.emit('TTTRoom', roomid)

        // eslint-disable-next-line
    }, [logged])

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
                socket.emit('roundEnd', { room: roomid, type: 'winner', m: { r, c, id: myId, roundEnd: `YOU LOSE THIS ROUND...`, win } })
            } else if (turn > 8) {
                //: emit draw y actualizar data de la partida
                socket.emit('roundEnd', { room: roomid, type: 'draw', m: { r, c, id: myId, roundEnd: `DRAW` } })
                return

            } else socket.emit('movement', { r, c, id: myId, room: roomid })

        } else socket.emit('movement', { r, c, id: myId, room: roomid })

        setCurrentTurn(() => otherPlayer.current.id)
    }

    //? MOVIMIENTO DEL OTRO JUGADOR
    const movementSync = ({ r, c, id, roundEnd = false, final = false, win = false }) => {
        if (id === myId) {
            if (win) {
                setWinStyle(() => {
                    let aux = { ...win, backgroundColor: '#37668d' }
                    return aux
                })
            }
            //: notifica si gana el originador del movimiento
            if (final) {
                //? ALERTA
                setTimeout(() => {
                    openAlert({ type: 'finalW', message: `You're the WINNER!` })
                }, 750);

                setTimeout(() => {
                    setPlaying(false)
                    // resetBoard()
                }, 1000);
            } else if (roundEnd) {
                setTimeout(() => {
                    roundEnd === 'DRAW'
                        ? openAlert({ type: 'draw', message: `DRAW`, duration: 2000 })
                        : openAlert({ type: 'win', message: `Round won!`, duration: 2000 })
                }, 750);

                setTimeout(() => {
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

        if (win) {
            setWinStyle(() => {
                let aux = { ...win, backgroundColor: '#F65265' }
                return aux
            })
        }

        if (final) {
            setTimeout(() => {
                openAlert({ type: 'finalL', message: `the winner is ${otherPlayer.current.name.toUpperCase()}` })
            }, 750);

            setTimeout(() => {
                setPlaying(false)
                // resetBoard()
            }, 1000);
            return
        }

        if (roundEnd) {
            setTimeout(() => {
                openAlert({ type: 'lose', message: `Round lost`, duration: 2000 })
            }, 750);

            setTimeout(() => {
                resetBoard()
            }, 1000);
        }

        setCurrentTurn(() => myId)
    }

    const resetBoard = () => {
        //: avisar al back que estoy listo
        socket.emit('playerReady', { room: roomid, id: myId })
        setWinStyle(() => false)
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
        if (users.length === 2) {
            setWaiting(false)
            otherPlayer.current = users.find(e => e.id !== myId)
        }
    }

    const startMatch = () => {
        // socket.emit('start', { room: roomid, winCon })
        (otherPlayer.current && !waiting) && socket.emit('start', { room: roomid, winCon })
    }

    const startHandler = () => {
        setMenu(() => false)

        openAlert({
            type: 'vs',
            p1: username,
            p2: otherPlayer.current.name,
            duration: 2000
        })

        setTimeout(() => setPlaying(true), 2000);

        setTimeout(() => openAlert({ type: 'draw', message: 'Game starts!', duration: 2000 }), 4100);

        setTimeout(() => {
            setMenu(() => true)
            setWaiting(() => false)
            setUsers(current => {
                setCurrentTurn(() => current[0].id)
                return current
            })
        }, 6000);
    }

    const continueMatch = ({ rounds, score }) => {
        setRounds(rounds)
        setScore(score)
        setWaiting(false)
    }

    const leave = () => {
        //? el usuario presiona el boton "abandonar"
        navigate('/')
    }

    const disconnect = ({ message }) => {
        //? el otro usuario abandona
        openAlert({ type: 'lose', message, duration: 2000 })
        setTimeout(() => {
            navigate('/')
        }, 2000);
    }

    const sendMessege = ({ message, to }) => {
        if (message && to) {
            socket.emit('privateMessage', {
                message,
                to
            })
        }
    }

    const handleNewMessage = (m) => {
        try {
            // console.log(m.from.name, m.message);
            let newM = { name: m.from.name, user: m.from.id, message: m.message }
            dispatch({ type: 'messages', payload: newM })

            !chatConfig.expanded && dispatch({ type: 'chatUpdate', payload: { unseen: true } })
        } catch (err) {
            console.log(err);
        }
    }

    const isTyping = () => {
        dispatch({ type: 'chatUpdate', payload: { typing: true } })
    }

    const stopTyping = () => {
        dispatch({ type: 'chatUpdate', payload: { typing: false } })
    }

    useEffect(() => {
        socket.on('roomUpdate', (data) => roomUpdater(data))
        socket.on('roomUsersUpdate', (data) => userListUpdater(data))
        socket.on('movement', (m) => movementSync(m))
        socket.on('start', startHandler)
        socket.on('continue', (data) => continueMatch(data))
        socket.on('leaveRoom', (data) => disconnect(data))

        socket.on('DMisTyping', () => isTyping())
        socket.on('DMStopTyping', () => stopTyping())
        socket.on('privateMessage', (data) => handleNewMessage(data))

        return () => {
            socket.off('roomUpdate')
            socket.off('roomUsersUpdate')
            socket.off('movement')
            socket.off('start')
            socket.off('continue')
            socket.off('leaveRoom')

            socket.off('DMisTyping')
            socket.off('DMStopTyping')
            socket.off('privateMessage')

            socket.emit('leaveRoom', roomid)
            dispatch({ type: 'resetChat' })
        }
        // eslint-disable-next-line
    }, [])

    return (
        <div className='compFadeIn'>
            {!logged
                ? <UsernameInput socket={socket} />
                : <>
                    <div className='game-container'>
                        {playing &&
                            <div className='playing'>
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
                                    waiting={waiting}
                                    winStyle={winStyle} />
                            </div>}
                    </div>

                    {!playing &&
                        <Menu
                            users={users}
                            myId={myId}
                            leave={leave}
                            roomid={roomid}
                            setWinCon={setWinCon}
                            startMatch={startMatch}
                            waiting={waiting}
                            menu={menu} />}

                    <MatchAlerts
                        isOpen={isOpen}
                        closeAlert={closeAlert}
                        reset={resetBoard}
                        props={props} />

                    {otherPlayer.current && <DMChat
                        user={{ id: roomid, name: otherPlayer.current.name }}
                        socket={socket}
                        handleSendPrivate={sendMessege} />}
                </>}

        </div>
    )
}

export default TicTacToe