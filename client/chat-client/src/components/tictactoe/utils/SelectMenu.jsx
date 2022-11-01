import React, { useState } from 'react'
import Arrow from '../../../assets/Arrow'

import '../../styles/SelectMenu.css'

const SelectMenu = (props) => {
    const {
        name,
        options,
        setOption
    } = props

    const [open, setOpen] = useState(false)
    const [currentOption, setCurrentOption] = useState(options[0])

    const menuHandler = () => {
        setOpen(!open)
    }

    const optionHandler = (o) => {
        setOption(() => o)
        setCurrentOption(o)
    }

    return (
        <div className='selectmenu-container' onClick={menuHandler}>
            <p>{name}</p>
            <div>
                <span>{`${currentOption}`}</span>
                <Arrow />
            </div>

            <div className={`selectmenu-menu ${open && 'selectmenu-menu-open'}`}>{options.length &&
                options.map(o => (
                    <p key={o} onClick={() => optionHandler(o)}>{o}</p>
                ))
            }</div>
        </div>
    )
}

export default SelectMenu