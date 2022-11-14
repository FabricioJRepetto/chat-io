import React, { useState, useRef } from 'react'
import { useEffect } from 'react'
import { useCon } from '../../context'
import Board from './Board'
import { MatchHeader } from './MatchHeader'
import { checkLine } from './utils/checkLine'
import SelectMenu from './utils/SelectMenu'
import { useAlerts } from './utils/useAlerts'
import MatchAlerts from './MatchAlerts'


const RageAgainstTheMachine = () => {
    const { state: { myId } } = useCon()
    const [playing, setPlaying] = useState(false)
    const [waiting, setWaiting] = useState(false)
    const [playerTurn, setPlayerTurn] = useState(false)
    const [score, setScore] = useState({ player: 0, bot: 0 })
    const [round, setRound] = useState(0)
    const [turn, setTurn] = useState(0)
    const [sign, setSign] = useState('X')
    const [winCon, setWinCon] = useState(3)
    const [winStyle, setWinStyle] = useState(false)

    //? ALERTAS
    const [isOpen, openAlert, closeAlert, props] = useAlerts()

    //? TABLERO
    const [row0, setRow0] = useState([null, null, null])
    const [row1, setRow1] = useState([null, null, null])
    const [row2, setRow2] = useState([null, null, null])

    //? MOVIMIENTOS DEL JUGADOR
    const MOVES = useRef({ A: [], B: [], C: [] })

    //? MOVIMIENTOS DEL BOT
    const BOTMOVES = useRef({ A: [], B: [], C: [] })

    //? CASILLAS DISPONIBLES
    const emptyTiles = useRef([{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 2 }])

    const tilePicker = ({ r, c }, player = true) => {
        try {
            setTurn(current => {
                let aux = current
                aux++
                return aux
            })

            const { A, B, C } = player ? MOVES.current : BOTMOVES.current
            let aux = [],
                aux2 = [...emptyTiles.current],
                auxSign = player
                    ? sign
                    : sign === 'X'
                        ? 'O'
                        : 'X'

            switch (r) {
                case 0:
                    if (!row0[c]) {
                        //? modifico tablero
                        setRow0(curr => {
                            aux = [...curr]
                            aux.splice(c, 1, auxSign)
                            return aux
                        })
                        //? agrego movimiento del player/bot
                        A.push(c)
                        //? quito movimiento de la lista de disponibles para el bot
                        emptyTiles.current = aux2.filter(t => (t.r === 0 && t.c !== c) || (t.r !== 0))
                    }
                    break;

                case 1:
                    if (!row1[c]) {
                        setRow1(curr => {
                            aux = [...curr]
                            aux.splice(c, 1, auxSign)
                            return aux
                        })
                        B.push(c)
                        emptyTiles.current = aux2.filter(t => (t.r === 1 && t.c !== c) || (t.r !== 1))
                    }
                    break;

                default:
                    if (!row2[c]) {
                        setRow2(curr => {
                            aux = [...curr]
                            aux.splice(c, 1, auxSign)
                            return aux
                        })
                        C.push(c)
                        emptyTiles.current = aux2.filter(t => (t.r === 2 && t.c !== c) || (t.r !== 2))
                    }
                    break;
            }

            if (player) {
                setPlayerTurn(() => false)
                postMove(true)
            } else {
                setPlayerTurn(() => myId)
                postMove(false)
            }
        } catch (error) {
            console.log(error);
        }
    }

    const botPlays = () => {
        const tiles = emptyTiles.current
        let i = Math.floor(Math.random() * (tiles.length - 1))
        i < 0 && (i = 0)

        setTimeout(() => {
            tilePicker(tiles[i], false)
        }, 1500)

        return
    }

    const postMove = (player) => {
        if (turn >= 4) {
            let win = checkLine(player ? MOVES.current : BOTMOVES.current)
            if (win) {
                setWaiting(true)

                setScore(prev => {
                    let score = { ...prev }
                    player ? score.player += 1 : score.bot += 1
                    return score
                })

                if ((player ? score.player : score.bot) >= (winCon - 1)) {
                    //: winning style setter
                    setWinStyle(() => {
                        return { ...win, backgroundColor: `${player ? '#37668d' : '#F65265'}` }
                    })

                    //? ALERTA
                    setTimeout(() => {
                        openAlert({ type: player ? 'finalW' : 'finalL', message: player ? 'You WIN!' : 'You LOSE...' })
                    }, 750);


                    //! reset
                    setTimeout(() => {
                        resetBoard(true, player ? false : myId)
                    }, 2000);
                } else {
                    //: winning style setter
                    setWinStyle(() => {
                        return { ...win, backgroundColor: `${player ? '#37668d' : '#F65265'}` }
                    })

                    //? ALERTA
                    setTimeout(() => {
                        openAlert({ type: player ? 'win' : 'lose', message: player ? 'Round won!' : 'Round lost..', duration: 2000 })
                    }, 750);

                    //! reset
                    setTimeout(() => {
                        resetBoard(false, player ? false : myId)
                    }, 2000);
                }
                return
            } else if (turn > 8) {
                setWaiting(true)

                //? ALERT    
                setTimeout(() => {
                    openAlert({ type: 'draw', message: 'DRAW', duration: 2000 })
                }, 750);

                //! reset
                setTimeout(() => {
                    resetBoard(false, player ? false : myId)
                }, 2000)
                return
            } else if (player) setPlayerTurn(false)
            else setPlayerTurn(myId)

        } else if (player) setPlayerTurn(false)
        else setPlayerTurn(myId)
    }

    const resetBoard = (fullReset, firstTurn) => {
        setWinStyle(false)
        setTurn(1)
        setRow0([null, null, null])
        setRow1([null, null, null])
        setRow2([null, null, null])
        MOVES.current = { A: [], B: [], C: [] }
        BOTMOVES.current = { A: [], B: [], C: [] }
        emptyTiles.current = [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 2, c: 0 }, { r: 2, c: 1 }, { r: 2, c: 2 }]

        if (fullReset) {
            setPlayerTurn(myId)
            setRound(0)
            setScore({ player: 0, bot: 0 })
            setPlaying(false)
        } else {
            setRound(prev => prev + 1)
            setWaiting(false)
            setPlayerTurn(firstTurn)
        }
    }

    const start = () => {
        setPlaying(true)
        setWaiting(false)
        setTimeout(() => setPlayerTurn(myId), 2000)
    }

    useEffect(() => {
        (playing && !waiting && !playerTurn) && botPlays()
        // eslint-disable-next-line
    }, [row0, row1, row2])

    return (
        <section className='compFadeIn'>
            {playing
                ? <div className='playing'>
                    <MatchHeader
                        sign={sign}
                        score={score}
                        round={round}
                        playerTurn={playerTurn} />

                    <Board row0={row0}
                        row1={row1}
                        row2={row2}
                        tilePicker={tilePicker}
                        sign={sign}
                        myId={myId}
                        currentTurn={playerTurn}
                        waiting={waiting}
                        winStyle={winStyle} />

                </div>
                : <div className='IAmenu'>
                    <SelectMenu
                        name={'Points to win'}
                        options={[3, 5]}
                        setOption={setWinCon} />
                    <SelectMenu
                        name={'Pick your sign'}
                        options={['X', 'O']}
                        setOption={setSign} />

                    <p className='p-txt menu-opt' onClick={start}>START</p>
                </div>}

            <MatchAlerts
                isOpen={isOpen}
                closeAlert={closeAlert}
                reset={resetBoard}
                props={props} />
        </section>
    )
}

export default RageAgainstTheMachine