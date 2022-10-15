import { createContext, useReducer, useContext } from 'react'

export const ContextContext = createContext() 

function contextReducer(state, action) {
  switch (action.type) {
    case 'update': {        
        return {users: action.payload}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function ContextProvider({children}) {
  const [state, dispatch] = useReducer(contextReducer, {users: []})
  const value = {state, dispatch}

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