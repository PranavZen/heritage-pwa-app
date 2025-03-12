// store/store.ts (or store/index.ts)

import { configureStore } from '@reduxjs/toolkit';
import customerReducer from './slices/sliceprofile';

const store = configureStore({
  reducer: {
    customer: customerReducer,
  },
});

// Define RootState based on the shape of the store
export type RootState = ReturnType<typeof store.getState>;

// Export the store for use in your app
export default store;
