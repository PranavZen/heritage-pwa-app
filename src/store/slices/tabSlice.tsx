
import { createSlice } from '@reduxjs/toolkit';

export type TabStateType = {
  screen: string;
};

const savedScr = localStorage.getItem('curScreen');
const initialState: TabStateType = {
  screen: savedScr || 'Home',
};

export const tabSlice = createSlice({
  name: 'tab',
  initialState,
  reducers: {
    setScreen: (state, action) => {
      state.screen = action.payload;
      localStorage.setItem('curScreen', action.payload);
    },
  },
});

export const { setScreen } = tabSlice.actions;
export default tabSlice.reducer;
