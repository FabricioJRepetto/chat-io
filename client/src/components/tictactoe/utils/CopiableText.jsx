import React from 'react'
import { useState } from 'react'
import Copy from '../../../assets/Copy.jsx'
import '../../styles/CopiableText.css'

const CopiableText = ({ text }) => {
    const [visible, setVisible] = useState(false)

    const copyToClipboard = (str) => {
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            setVisible(() => true)
            setTimeout(() => {
                setVisible(() => false)
            }, 1500);
            return navigator.clipboard.writeText(str);
        }

        return Promise.reject('The Clipboard API is not available.');
    };

    return (
        <span className='copiable'
            onClick={() => copyToClipboard(text)}>
            <span>
                Room ID: {text}<Copy />
            </span>

            <p className={`tooltip ${visible && 'tooltip-on'}`}>Copied!</p>
        </span>
    )
}

export default CopiableText