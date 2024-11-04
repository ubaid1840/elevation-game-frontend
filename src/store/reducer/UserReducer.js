import { SET_User } from '../action/UserAction'

export const myUserReducer = (state, action) => {
  switch (action.type) {
    case SET_User:
      let newUserState = { ...state }
      newUserState.value.data = action.payload.data       
      return newUserState
      break
    default:
      return state
  }
}

