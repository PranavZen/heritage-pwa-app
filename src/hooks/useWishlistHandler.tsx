import { useSelector } from "react-redux";
import { useEffect } from "react";
import { DishType } from "../types";
import { RootState } from "../store"; 
import { fetchWishlist, toggleWishlistItem } from "../store/slices/wishlistSlice";
import { Modal } from "antd";
import { hooks } from '../hooks';

import { useAppDispatch } from "../store/actions/useAppDispatch"; 



export const useWishlistHandler = () => {
  const navigate = hooks.useNavigate();
  const dispatch = useAppDispatch(); 
  const wishlist = useSelector((state: RootState) => state.wishlistSlice.list);

  useEffect(() => {
    dispatch(fetchWishlist()); 
  }, [dispatch]);

  const addToWishlistHandler = (
    dish: DishType,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    type: number 
  ) => {
    event.stopPropagation();

    const c_id = localStorage.getItem('c_id');
    if (!c_id) {
      Modal.confirm({
        title: 'Please Sign In',
        content: 'You need to sign in to manage your wishlist.',
        onOk() {
          navigate('/');
        },
        cancelText: 'Cancel',
        okText: 'Sign In',
      });
      return;
    }

    dispatch(toggleWishlistItem({
      product_id: dish.product_id,
      product_option_id: dish.product_option_id,
      product_option_value_id: dish.product_option_value_id,
      c_id: parseInt(c_id),
      type,
    }));
  };

  const ifInWishlist = (id: number): boolean => {
    return wishlist.some((dish) => dish.product_option_value_id === id);
  };

  return {
    addToWishlistHandler,
    ifInWishlist,
  };
};
