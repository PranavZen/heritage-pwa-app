import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type LoaderStateType = {
  isLoading: boolean;
  message: string | null;
};

const initialState: LoaderStateType = {
  isLoading: false,
  message: null,
};

export const loaderSlice = createSlice({
  name: 'loader',
  initialState,
  reducers: {
    showLoader: (state, action: PayloadAction<string | null>) => {
      state.isLoading = true;
      state.message = action.payload;
    },
    hideLoader: (state) => {
      state.isLoading = false;
      state.message = null;
    },
  },
});

export const { showLoader, hideLoader } = loaderSlice.actions;
export default loaderSlice.reducer;
