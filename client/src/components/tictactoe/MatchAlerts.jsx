import { useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { animate } from "./utils/animateStar";

import "../styles/MatchAlerts.css";

const MatchAlerts = ({ isOpen, closeAlert, reset, props = false }) => {
    const navigate = useNavigate()

    const {
        type,
        message,
        p1,
        p2,
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
    }

    let index = 0,
        interval = 1000;
    const intervals = []

    const stars = () => {
        for (const star of document.getElementsByClassName('star')) {
            setTimeout(() => {
                animate(star)
                let aux = setInterval(() => animate(star), 1000)
                intervals.push(aux)
            }, index++ * (interval / 5))
        }
    }

    const clear = () => {
        intervals.forEach(clearInterval);
    }

    const playAgain = () => {
        clear()
        reset()
        closeAlert()
    }

    const leave = () => {
        clear()
        navigate('/')
    }

    useEffect(() => {
        duration && setTimeout(() => closeAlert(), duration);

        type === 'finalW' && setTimeout(() => stars(), 1000);

        return () => clear()
        // eslint-disable-next-line
    }, [isOpen])

    return (
        /final/g.test(type)
            ? <article className={`mAlert-container final-bg ${isOpen && 'mAF-open'}`}
                onMouseDown={handleOnMouseDown}
                onMouseUp={handleOnMouseUp}
                id="modal-article" >
                <div className="mAlert-body">
                    {isOpen && <div className={`mAF-content mAlert-${type}`}
                        onClick={handleModalContainerClick} >
                        <h3>{type === 'finalW' ? `YOU'RE THE` : 'YOU'}</h3>

                        {type === 'finalW'
                            ? <div className="big-text-w" data-text={`WINNER!`} >
                                {`WINNER!`}
                                <span className="star">x</span>
                                <span className="star">x</span>
                                <span className="star">x</span>
                                <span className="star">x</span>
                                <span className="star">x</span>
                            </div>
                            : <div className="big-text-l" data-text={'LOSE...'} >
                                {'LOSE...'}
                                <span className="splash1"></span>
                                <span className="splash2"></span>
                                <span className="splash3"></span>
                                <span className="splash4"></span>
                            </div>}

                        <div className="alert-buttons">
                            <button onClick={playAgain}>Play again</button>
                            <button onClick={leave}>Leave</button>
                        </div>
                        <div className={type === 'finalW' ? 'winner-bg' : 'loser-bg'}></div>
                    </div>}
                </div>
            </article>

            : <article className={`mAlert-container ${isOpen && 'mA-open'}`} >
                {type === 'vs'
                    ? <div className="mAlert-body">
                        {isOpen && <div className="mAlert-content VS-Alert">
                            <span className="mAlert-win">{p1 || 'Franco'}</span>
                            <div>VS</div>
                            <span className="mAlert-loseReverse">{p2 || 'PEPE'}</span>
                        </div>}
                    </div>
                    : <div className="mAlert-body">
                        {isOpen && <div className={`mAlert-content mAlert-${type}`} >
                            {message || ''}
                        </div>}
                    </div>}
            </article>
    )
}

export default MatchAlerts