import { createContext, useReducer, useContext } from 'react'

export const ContextContext = createContext()

function contextReducer(state, action) {
    switch (action.type) {
        case 'usersUpdate': {
            return { ...state, users: action.payload }
        }
        case 'newInbox': {
            return { ...state, inboxes: action.payload }
        }
        case 'chatUpdate': {
            return { ...state, chats: action.payload }
        }
        case 'setUsername': {
            return { ...state, username: action.payload }
        }
        case 'setId': {
            return { ...state, myId: action.payload }
        }
        case 'setLogged': {
            return { ...state, logged: action.payload }
        }
        default: {
            throw new Error(`Unhandled action type: ${action.type}`)
        }
    }
}

function ContextProvider({ children }) {
    const [state, dispatch] = useReducer(contextReducer, { users: [], inboxes: new Map(), chats: {}, username: '', myId: '', logged: false })
    const value = { state, dispatch }

    return <ContextContext.Provider value={value}>{children}</ContextContext.Provider>
}

function useCon() {
    const context = useContext(ContextContext)
    if (context === undefined) {
        throw new Error('useCon must be used within a ContextProvider')
    }
    return context
}

export { ContextProvider, useCon }