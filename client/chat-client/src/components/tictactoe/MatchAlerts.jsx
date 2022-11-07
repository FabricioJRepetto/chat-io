import { useEffect } from "react";
import { useNavigate } from 'react-router-dom'

import "../styles/MatchAlerts.css";

const MatchAlerts = ({ isOpen, closeAlert, props = false }) => {
    const navigate = useNavigate()

    const {
        type,
        message,
        duration
    } = props

    const handleModalContainerClick = (e) => {
        e.stopPropagation();
    };
    // let clickTargetID = null;

    // const handleOnMouseDown = (e) => {
    //     e.stopPropagation();
    //     clickTargetID = e.target.id;
    // };

    // const handleOnMouseUp = (e) => {
    //     e.stopPropagation();
    //     if (e.target.id === clickTargetID && clickTargetID === "modal-article") {
    //         closeAlert();
    //     }
    //     clickTargetID = null;
    // };

    useEffect(() => {
        duration && setTimeout(() => {
            closeAlert()
        }, duration);
        // eslint-disable-next-line
    }, [isOpen])


    return (
        <article className={`mAlert-container ${isOpen && 'mA-open'}`}
            // onMouseDown={handleOnMouseDown}
            // onMouseUp={handleOnMouseUp}
            id="modal-article" >
            <div className="mAlert-body">
                {isOpen && <div className={`mAlert-content mAlert-${type}`}
                    onClick={handleModalContainerClick} >
                    {message || ''}
                    {/final/g.test(type) && <div className="alert-buttons">
                        <button onClick={closeAlert}>Play again</button>
                        <button onClick={() => navigate('/')}>Leave</button>
                    </div>}
                </div>}
            </div>
        </article>
    )
}

export default MatchAlerts