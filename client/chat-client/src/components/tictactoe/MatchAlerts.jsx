import { useEffect } from "react";

import "../styles/MatchAlerts.css";

const MatchAlerts = ({ isOpen, closeAlert, props = false }) => {

    const {
        type,
        name,
        duration
    } = props

    const handleModalContainerClick = (e) => {
        e.stopPropagation();
    };
    let clickTargetID = null;

    const handleOnMouseDown = (e) => {
        e.stopPropagation();
        clickTargetID = e.target.id;
    };

    const handleOnMouseUp = (e) => {
        e.stopPropagation();
        if (e.target.id === clickTargetID && clickTargetID === "modal-article") {
            closeAlert();
        }
        clickTargetID = null;
    };

    useEffect(() => {
        duration && setTimeout(() => {
            console.log('cerrar');
            closeAlert()
        }, duration);
        // eslint-disable-next-line
    }, [isOpen])


    return (
        <article className={`mAlert-container mAlert-${type} ${isOpen && 'mA-open'}`}
            onMouseDown={handleOnMouseDown}
            onMouseUp={handleOnMouseUp}
            id="modal-article" >
            <div className={`mAlert-content`}
                onClick={handleModalContainerClick} >
                {type || ''}
            </div>
        </article>
    )
}

export default MatchAlerts