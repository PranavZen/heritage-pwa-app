// store/slices/sliceprofile.js
import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  customerDetail: null, // Will hold the customer details
};

// Create a slice
const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setCustomerDetail: (state, action) => {
      state.customerDetail = action.payload; // Set the customer details
    },
  },
});

// Export actions
export const { setCustomerDetail } = customerSlice.actions;

// Export reducer
export default customerSlice.reducer;
