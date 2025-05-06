import { configureStore } from '@reduxjs/toolkit';
import  wishlistSlice from '../slices/wishlistSlice'
import { useDispatch } from 'react-redux';

export const store = configureStore({
  reducer: {
    wishlistSlice, 
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>(); 
