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
  cartCount: number;
  shouldRefresh: boolean;
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
  cartCount: 0,
  shouldRefresh: false,
};

type StateType = typeof initialState;

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state: StateType, action: PayloadAction<DishType>) => {
      const inCart = state.list.find(
        (item) => item.option_value_name === action.payload.option_value_name
      );

      const price = Number(action.payload.price);

      if (inCart) {
        inCart.quantity = (inCart.quantity);
      } else {
        state.list.push({ ...action.payload});
      }

      state.subtotal += price;
      state.total = state.subtotal * (1 - state.discount / 100);
      state.cartCount = state.list.reduce((acc, item) => acc + (item.quantity || 0), 0);
    },

    removeFromCart: (state: StateType, action: PayloadAction<DishType>) => {
      const index = state.list.findIndex(
        (item) => item.option_value_name === action.payload.option_value_name
      );

      if (index !== -1) {
        const item = state.list[index];
        const price = Number(action.payload.price);

        if ((item.quantity || 1) > 1) {
          item.quantity = (item.quantity || 1) - 1;
          state.subtotal -= price;
        } else {
          state.subtotal -= price;
          state.list.splice(index, 1);
        }

        state.total = state.subtotal * (1 - state.discount / 100);
        state.cartCount = state.list.reduce((acc, item) => acc + (item.quantity || 0), 0);

        state.shouldRefresh = true;
      }
    },

    removeItemCompletely: (state: StateType, action: PayloadAction<DishType>) => {
      const index = state.list.findIndex(
        (item) => item.option_value_name === action.payload.option_value_name
      );

      if (index !== -1) {
        const item = state.list[index];
        const price = Number(item.price);
        const qty = item.quantity || 1;

        state.subtotal -= price * qty;
        state.list.splice(index, 1);
        state.total = state.subtotal * (1 - state.discount / 100);
        state.cartCount = state.list.reduce((acc, item) => acc + (item.quantity || 0), 0);

        state.shouldRefresh = true;
      }
    },

    setDiscount: (state, action: PayloadAction<number>) => {
      state.discount = action.payload;
      state.total = state.subtotal * (1 - state.discount / 100);
    },

    setPromoCode: (state, action: PayloadAction<string>) => {
      state.promoCode = action.payload;
    },

    resetCart: (state) => {
      state.list = [];
      state.subtotal = 0;
      state.total = 0;
      state.discount = 0;
      state.promoCode = '';
      state.cartCount = 0;
      state.shouldRefresh = false;
    },

    setCartCount: (state, action: PayloadAction<number>) => {
      state.cartCount = action.payload;
    },

    resetHeaderRefresh: (state) => {
      state.shouldRefresh = false;
    },

    // New action to set `shouldRefresh`
    setShouldRefresh: (state, action: PayloadAction<boolean>) => {
      state.shouldRefresh = action.payload;
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
  removeItemCompletely,
  setDiscount,
  setPromoCode,
  resetCart,
  setCartCount,
  resetHeaderRefresh,
  setShouldRefresh,  // Exported here
} = cartSlice.actions;

export default cartSlice.reducer;
