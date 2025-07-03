import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchRewards = createAsyncThunk('rewards/fetchRewards', async (_, { rejectWithValue }) => {
  try {
    const formData= new FormData()
   formData.append("user_id", localStorage.getItem("c_id") || "0");
    const { data } = await axios.post(
      'https://heritage.bizdel.in/app/consumer/services_v11/getAllSpinRewards',
      formData
    );
    if (data.success && Array.isArray(data.rewards)){
      return data.rewards.filter((r: any) => r.is_active === '1');
    }
    return [];
  } catch (err: any) {
    return rejectWithValue('Failed to fetch rewards. Please try again later.');
  }
});

const rewardsSlice = createSlice({
  name: 'rewards',
  initialState: {
    rewards: [],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRewards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRewards.fulfilled, (state, action) => {
        state.loading = false;
        state.rewards = action.payload;
      })
      .addCase(fetchRewards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default rewardsSlice.reducer;
