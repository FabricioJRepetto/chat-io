import React, { useState, useEffect } from 'react'
import { useRef } from 'react'

import './styles/logo.css'
import './styles/boards.css'

export const Logo = ({ logged }) => {
    const [row0, setRow0] = useState([null, null, null])
    const [row1, setRow1] = useState([null, null, null])
    const [row2, setRow2] = useState([null, null, null])
    const [winStyle, setWinStyle] = useState(false)
    const [complete, setComplete] = useState(false)

    const moves = useRef([
        { r: 2, c: 1, s: 'o' },
        { r: 0, c: 0, s: 'T' },
        { r: 1, c: 2, s: 'c' },
        { r: 2, c: 0, s: 'T' },
        { r: 0, c: 2, s: 'c' },
        { r: 1, c: 0, s: 't' }
    ])
    const inter = useRef(null)
    const colors = useRef(null)
    const lastId = useRef(null)

    useEffect(() => {
        animation()
        return () => clear()
        // eslint-disable-next-line
    }, [])

    const animation = () => {
        let i = 0
        setTimeout(() => {
            inter.current = setInterval(() => {
                if (i < 6) {
                    const { r, c, s } = moves.current[i]

                    if (r === 0) {
                        setRow0(prev => {
                            let aux = [...prev]
                            aux[c] = s
                            return aux
                        })
                    } else if (r === 1) {
                        setRow1(prev => {
                            let aux = [...prev]
                            aux[c] = s
                            return aux
                        })
                    } else {
                        setRow2(prev => {
                            let aux = [...prev]
                            aux[c] = s
                            return aux
                        })
                    }
                    i++
                } else if (i === 6) {
                    setWinStyle(true)
                    i++

                    setTimeout(() => {
                        setRow0(prev => {
                            let aux = [...prev]
                            aux[1] = 'i'
                            return aux
                        })
                        setRow1(prev => {
                            let aux = [...prev]
                            aux[1] = 'a'
                            return aux
                        })
                        setRow2(prev => {
                            let aux = [...prev]
                            aux[2] = 'e'
                            return aux
                        })
                        setComplete(true)
                        setTimeout(() => randomColors(), 1000)
                    }, 1000);
                } else clear()
            }, 400);
        }, 1800);
    }

    const random = (min, max) =>
        Math.floor(Math.random() * (max - min + 1)) + min

    const randomId = () => {
        const id = `r${random(0, 2)}${random(0, 2)}`

        if (lastId.current !== id) {
            lastId.current = id
            return id
        } else return randomId()
    }

    const randomColors = () => {
        colors.current = setInterval(() => {
            const element = document.getElementById(randomId());

            element.style.color = (random(1, 2) === 2) ? 'var(--red)' : 'var(--blue)'
            element.style.animation = 'randomFade 1s ease 3s forwards'
            setTimeout(() => {
                element.style.color = 'var(--white)'
                element.style.animation = 'none'
            }, 4000);

        }, 2000);
    }

    const clear = () => {
        clearInterval(inter.current)
        clearInterval(colors.current)
    }

    return (
        <div className={`logo-container ${logged && 'logo-small'}`}>
            <div className='board-container'>
                <div className={`board-grids ${complete && 'logo-fade-out'}`}>
                    <div className='horizontal-line hl1 fastLine'></div>
                    <div className='horizontal-line hl2 fastLine'></div>
                    <div className='vertical-line vl1 fastLine'></div>
                    <div className='vertical-line vl2 fastLine'></div>

                    {winStyle && <div className='winningLine' style={{
                        left: `calc(16.7% - 12px)`,
                        animation: 'vLine .3s ease',
                        width: '24px',
                        height: '100%',
                        backgroundColor: '#37668d'
                    }} ></div>}
                </div>
                <div className={`board`}>
                    <div>{
                        row0.map((tile, i) => (
                            <div key={'r0' + i} id={'r0' + i} className={`tile ${tile && 'tile-mark-anim'} ${complete && 'logo-font-size'}`}>{tile}</div>
                        ))
                    }</div>
                    <div>{
                        row1.map((tile, i) => (
                            <div key={'r1' + i} id={'r1' + i} className={`tile ${tile && 'tile-mark-anim'} ${complete && 'logo-font-size'}`}>{tile}</div>
                        ))
                    }</div>
                    <div>{
                        row2.map((tile, i) => (
                            <div key={'r2' + i} id={'r2' + i} className={`tile ${tile && 'tile-mark-anim'} ${complete && 'logo-font-size'}`}>{tile}</div>
                        ))
                    }</div>
                </div>
            </div>
        </div>
    )
}
