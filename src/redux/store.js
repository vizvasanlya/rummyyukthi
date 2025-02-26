import { configureStore } from '@reduxjs/toolkit';
// import thunkMiddleware from 'redux-thunk';
// console.log('Thunk Middleware:', thunkMiddleware);
import gameReducer from './slices/gameSlice';
import authReducer from './slices/authSlice';

const store = configureStore({
  reducer: {
    game: gameReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});


export default store;
