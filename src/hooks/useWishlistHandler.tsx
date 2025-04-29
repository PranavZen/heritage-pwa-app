import { useDispatch, useSelector } from "react-redux";
import { DishType } from "../types";
import { RootState } from "../store";
import { actions } from "../store/actions";
import { Modal } from "antd";
import { hooks } from '../hooks';

export const useWishlistHandler = () => {
    const navigate = hooks.useNavigate();
  const dispatch = useDispatch();
  const wishlist = useSelector((state: RootState) => state.wishlistSlice);

  const addToWishlist = (
    dish: DishType,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
     if (!localStorage.getItem('c_id')) {
          Modal.confirm({
            title: 'Please Sign In',
            content: 'You need to sign in to add items to your cart.',
            onOk() {
              navigate('/');
            },
            onCancel() {},
            cancelText: 'Cancel',
            okText: 'Sign In',
          });
          return;
        }
    dispatch(actions.addToWishlist(dish));
  };

  const removeFromWishlist = (
    dish: DishType,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    dispatch(actions.removeFromWishlist(dish));
  };

  const ifInWishlist = (id: string): boolean => {
    return wishlist.list.some((dish) => dish.option_value_name === id);
  };
  
  

  return {
    addToWishlist,
    removeFromWishlist,
    ifInWishlist,
  };
};
