import React from 'react'

const MatchAlerts = ({ type, name }) => {

    return (
        <div className={`mAlert-${type}`}>
            <h1>{type}</h1>
        </div>
    )
}

export default MatchAlerts