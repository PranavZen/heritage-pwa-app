import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addItemToCartAPI } from './addItemToCartApi';  
import { DishType } from '../../types';

export type CartStateType = {
  total: number;
  delivery: number;
  discount: number;
  subtotal: number;
  promoCode: string;
  list: DishType[];
  discountAmount: number;
  loading: boolean;  
  error: string | null; 
};

const initialState: CartStateType = {
  total: 0,
  list: [],
  delivery: 0,
  discount: 0,
  subtotal: 0,
  promoCode: '',
  discountAmount: 0,
  loading: false,  
  error: null, 
};

type StateType = typeof initialState;

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (
      state: StateType,
      action: PayloadAction<DishType>,
    ) => {
      const inCart = state.list.find(
        (item) => item.option_value_name === action.payload.option_value_name,
      );
      
      if (inCart) {
        state.list.map((item) => {
          if (item.option_value_name === action.payload.option_value_name) {
            (item.quantity as number) += 1;
          }
          return item;
        });
        state.subtotal += Number(action.payload.price);
        state.total += Number(action.payload.price) * (1 - state.discount / 100);
      } else {
        state.list.push({ ...action.payload, quantity: 1 });
        state.subtotal += Number(action.payload.price);
        state.total += Number(action.payload.price) * (1 - state.discount / 100);
      }
    },
    removeFromCart: (state, action: PayloadAction<DishType>) => {
      const inCart = state.list.find(
        (item) => item.option_value_name === action.payload.option_value_name,
      );

      if (inCart) {
        state.list.map((item) => {
          if (item.option_value_name === action.payload.option_value_name && (item.quantity as number) > 1) {
            (item.quantity as number) -= 1;
          } else {
            state.list.splice(state.list.indexOf(item), 1);
          }
          return item;
        });
        state.subtotal -= Number(action.payload.price);
        state.total -= Number(action.payload.price) * (1 - state.discount / 100);
      }
    },
    setDiscount: (state, action: PayloadAction<number>) => {
      state.discount = action.payload;
      const newTotal = state.subtotal * (1 - state.discount / 100);
      state.total = newTotal;
    },
    resetCart: (state) => {
      state.list = [];
      state.subtotal = 0;
      state.total = 0;
      state.discount = 0;
      state.promoCode = '';
    },
    setPromoCode: (state, action: PayloadAction<string>) => {
      state.promoCode = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addItemToCartAPI.pending, (state) => {
        state.loading = true;
        state.error = null; 
      })
      .addCase(addItemToCartAPI.fulfilled, (state, action) => {
        state.loading = false;
        // console.log('Item added to cart successfully:', action.payload);
      })
      .addCase(addItemToCartAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add item to cart';
        console.error('Error adding item to cart:', state.error);
      });
  },
});

export const {
  addToCart,
  removeFromCart,
  setDiscount,
  setPromoCode,
  resetCart,
} = cartSlice.actions;

export default cartSlice.reducer;
