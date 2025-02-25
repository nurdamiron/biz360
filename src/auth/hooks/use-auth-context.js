// src/auth/hooks/use-auth-context.js
import { useContext, useReducer, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/auth-context';

const initialState = {
  isAuthenticated: false,
  user: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'INITIAL': 
      return action.payload;
    case 'LOGIN':
      return {
        isAuthenticated: true,
        user: action.payload
      };
    case 'LOGOUT':
      return {
        isAuthenticated: false,
        user: null
      };
    default:
      return state;
  }
};

// ----------------------------------------------------------------------

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  console.log('useAuthContext data:', context);
  return context;
}
