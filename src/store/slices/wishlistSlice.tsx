import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { DishType } from '../../types';

export type WishlistStateType = { list: DishType[] };

const initialState: WishlistStateType = {
  list: [],
};

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async () => {
    const c_id = localStorage.getItem('c_id');
    const area_id = localStorage.getItem('area_id');
    const city_id = localStorage.getItem('cityId');

    if (!c_id || !area_id || !city_id) {
      throw new Error('Missing required values in localStorage');
    }

    const formData = new FormData();
    formData.append('c_id', c_id);
    formData.append('area_id', area_id);
    formData.append('city_id', city_id);
    formData.append('next_id', '0');

    const response = await axios.post(
      'https://heritage.bizdel.in/app/consumer/services_v11/getWishlistData',
      formData
    );

    // console.log('APIResponsezzzzzz:', response.data.wishlistListing);

    const wishlistData = response.data.wishlistListing as DishType[];

    return wishlistData;
  }
);

export const toggleWishlistItem = createAsyncThunk(
  'wishlist/toggleItem',
  async (
    params: {
      product_id: number;
      product_option_id: number;
      product_option_value_id: number;
      c_id: number;
      type: number; 
    },
    { rejectWithValue }
  ) => {
    
    // console.log('Dispatching toggleWishlistItem with:', params);

    const formData = new FormData();
    formData.append('product_id', params.product_id.toString());
    formData.append('product_option_id', params.product_option_id.toString());
    formData.append('product_option_value_id', params.product_option_value_id.toString());
    formData.append('c_id', params.c_id.toString());
    formData.append('type', params.type.toString());

    try {
      const response = await axios.post(
        'https://heritage.bizdel.in/app/consumer/services_v11/addItemToWishlist',
        formData
      );

      const resData = response.data;

  
      if (resData.status === 'fail' && resData.message === 'Wishlist already added!' && params.type === 1) {
        console.warn('Item is already in wishlist. Skipping update.');
        return rejectWithValue('Already in wishlist');
      }

      return {
        product_option_value_id: params.product_option_value_id,
        type: params.type
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Something went wrong');
    }
  }
);

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist: (state, action: PayloadAction<DishType[]>) => {
      state.list = action.payload;
    },
    resetWishlist: (state) => {
      state.list = [];
    },
  },
  extraReducers: (builder) => {
    builder
     
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.list = action.payload;
      })
      // Add/Remove Item to/from Wishlist (API Call)
      .addCase(toggleWishlistItem.fulfilled, (state, action) => {
        const { product_option_value_id, type } = action.payload;

        if (type === 1) {
          // Add Item to Wishlist
          const inWishlist = state.list.find(
            (item) => item.product_option_value_id === product_option_value_id
          );
          if (!inWishlist) {
            // state.list.push({ product_option_value_id });
          }
        } else if (type === 2) {
          // Remove Item from Wishlist
          state.list = state.list.filter(
            (item) => item.product_option_value_id !== product_option_value_id
          );
        }
      });
  },
});

export const { setWishlist, resetWishlist } = wishlistSlice.actions;

export default wishlistSlice.reducer;
