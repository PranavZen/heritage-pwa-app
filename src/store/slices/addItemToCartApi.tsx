import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { DishType } from '../../types';

export const addItemToCartAPI = createAsyncThunk(
  'cart/addItemToCartAPI', 
  async (dish: DishType, { dispatch }) => {
    const {
      c_id,
      product_id,
      product_option_id,
      product_option_value_id,
      quantity,
      weight,
      weight_unit,
      delivery_preference,
      no_of_deliveries,
      order_date,
      order_type
    } = dish;

    try {
      const response = await axios.post('https://heritage.bizdel.in/app/consumer/services_v11/addItemToCart', {
        c_id,
        package_id: 13,
        package_days: 0,
        product_id,
        product_option_id,
        product_option_value_id,
        quantity,
        weight,
        weight_unit,
        delivery_preference,
        no_of_deliveries,
        order_date,
        order_type,
      });

      console.log("responseaddto cart", response)

      return response.data;  
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  }
);
