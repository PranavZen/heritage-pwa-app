import { useDispatch, useSelector } from 'react-redux';

import { DishType } from '../types';
import { RootState } from '../store';
import { actions } from '../store/actions';

export const useCartHandler = () => {
  const dispatch = useDispatch();

  const cart = useSelector((state: RootState) =>  state.cartSlice);

  console.log("cart", cart);

  const addToCart = (
    dish: DishType,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.stopPropagation();
    dispatch(actions.addToCart(dish));
  };

  const removeFromCart = (
    dish: DishType,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {    
    event.stopPropagation();
    dispatch(actions.removeFromCart(dish));
  };

  const getDishQty = (id: string): number =>{  
    // console.log("id",id);
    const dishInCart = cart.list.find((dish) => (dish.option_value_name) === (id));
    
    return dishInCart ? (Number(dishInCart.quantity) || 0) : 0;
}; 
  return {
    addToCart,
    removeFromCart,
    getDishQty,
  };
};
