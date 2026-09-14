import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { AuthPayload, User } from './types'

interface AuthState {
  user: User | null
  accessToken: string | null
  /** true once the initial silent refresh (on app load) has resolved, one way or another */
  bootstrapped: boolean
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  bootstrapped: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    credentialsUpdated: (state, action: PayloadAction<AuthPayload>) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.bootstrapped = true
    },
    loggedOut: (state) => {
      state.user = null
      state.accessToken = null
      state.bootstrapped = true
    },
  },
})

export const { credentialsUpdated, loggedOut } = authSlice.actions
export default authSlice.reducer
