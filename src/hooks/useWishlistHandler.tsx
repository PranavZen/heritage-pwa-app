import { useDispatch, useSelector } from "react-redux";
import { DishType } from "../types";
import { RootState } from "../store";
import { actions } from "../store/actions";

export const useWishlistHandler = () => {
  const dispatch = useDispatch();
  const wishlist = useSelector((state: RootState) => state.wishlistSlice);

  const addToWishlist = (
    dish: DishType,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
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
