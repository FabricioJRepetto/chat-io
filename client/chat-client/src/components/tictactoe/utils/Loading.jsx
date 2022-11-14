import React, { useState, useEffect } from 'react'
import { useRef } from 'react'

// import '../../styles/loading.css'

const Loading = () => {
    const [dots, setDots] = useState('')
    const inter = useRef(null)

    useEffect(() => {
        inter.current = setInterval(() => {
            setDots(current => {
                if (current.length > 2) {
                    return ''
                } else {
                    return current + '.'
                }
            })
        }, 500);

        return () => clearInterval(inter.current)
    }, [])

    return (
        <>{dots}</>
    )
}

export default Loading