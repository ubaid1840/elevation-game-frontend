'use client'
import { createContext, useReducer } from "react";
import { SET_User} from '../action/UserAction'
import { myUserReducer } from '../reducer/UserReducer'

export const UserContext = createContext()

const UserContextProvider = (props) => {

    const [state, dispatch] = useReducer(myUserReducer, { value: { data: null }})

    const setUser = (data) => {
        dispatch({ type: SET_User, payload: { data: data } })
    }

    return (
        <UserContext.Provider
            value={{ state, setUser }}
        >
            {props.children}
        </UserContext.Provider>
    )
}

export default UserContextProvider