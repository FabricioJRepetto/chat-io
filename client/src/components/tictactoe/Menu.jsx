import React from 'react'
import User from '../../assets/User'
import CopiableText from './utils/CopiableText'
import SelectMenu from './utils/SelectMenu'
import Loading from './utils/Loading'

import '../styles/menu.css'

const Menu = (props) => {
    const {
        users,
        myId,
        leave,
        roomid,
        setWinCon,
        startMatch,
        waiting,
        menu
    } = props

    return (
        <article className={`menu-container ${!menu && 'menu-off'}`} >
            <section className="menu-users">
                <div className="menu-p1">
                    <User />
                    {users.length && <p className='menu-name'>{users[0].name}</p>}
                </div>
                <span>VS</span>
                <div className={`menu-p2 ${users.length > 1 && 'menu-p2-joined'}`}>
                    <User num={1} />
                    <p className='menu-name'>{users.length > 1 ? users[1].name : 'Waiting for another player'}</p>
                </div>
            </section>

            {users.find(u => u.id === myId && u.role === 'owner')
                ? <section className='menu-owner'>
                    <SelectMenu
                        name={'Points to win'}
                        options={[3, 5]}
                        setOption={setWinCon} />

                    <div
                        className={`p-txt menu-opt menu-start ${(users.length < 2 || waiting) && 'menu-opt-disabled'} `}
                        onClick={() => users.length >= 2 ? startMatch() : undefined}>
                        START
                    </div>
                </section>
                : <div className='loading menu-owner'>
                    <h2>
                        Waiting to start <Loading />
                    </h2>
                </div>}

            <section className='menu-footer'>
                <button onClick={leave}>Leave</button>
                <CopiableText text={`${roomid}`} />
            </section>

        </article>
    )
}

export default Menu