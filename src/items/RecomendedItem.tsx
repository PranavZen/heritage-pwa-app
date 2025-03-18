import React from 'react';
import {useSelector} from 'react-redux';

import {hooks} from '../hooks';
import {DishType} from '../types';
import {svg} from '../assets/svg';
import {RootState} from '../store';
import {actions} from '../store/actions';
import {components} from '../components';

type Props = {
  index: number;
  dish: DishType;
  isLast: boolean;
};

export const RecomendedItem: React.FC<Props> = ({ index, dish, isLast }) => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();
  const [quantity, setQuantity] = useState<number>(0);
  const [cartId, setCartId] = useState<string[]>([]);
  const [cartItemId, setCartItemId] = useState<string | null>(null);

  const c_id = localStorage.getItem('c_id') || '1';
  const cityId = localStorage.getItem('cityId') || '';

  const wishlist = useSelector((state: RootState) => state.wishlistSlice);


  const ifInWishlist = wishlist.list.find((item) => item.option_value_name === dish.option_value_name);

  // console.log("ifInWishlist",ifInWishlist)

  const cartHandler = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    // console.log('Added to cart:', dish);
    event.stopPropagation();

    if (quantity > 1) {
      handleUpdateCart(quantity - 1);
    } else {
      try {
        const formData = new FormData();
        formData.append('id', String(cartItemId));
        formData.append('c_id', c_id);

        const response = await axios.post(
          'https://heritage.bizdel.in/app/consumer/services_v11/deleteCartItem',
          formData
        );

        if (response.data.status === 'success') {
          notification.success({ message: 'Success', description: response.data.message });
          setQuantity(0);
          setCartItemId(null);
        } else {
          notification.error({ message: 'Error', description: response.data.message || 'Failed to remove item.' });
        }
      } catch (error) {
        console.error('Error removing item from cart:', error);
        notification.error({ message: 'Error', description: 'Failed to remove item from cart.' });
      }
    }
  };


  const wishlistHandler = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    if (ifInWishlist) {
      dispatch(actions.removeFromWishlist(dish));
    } else {
      dispatch(actions.addToWishlist(dish));
    }
  };

  return (
    <div
      style={{
        marginLeft: index === 0 ? 20 : 0,
        marginRight: isLast ? 20 : 0,
      }}
      onClick={() => navigate(`/dish/${dish.option_value_name}`, {state: {dish}})}
    >     
      <img
        src={dish.option_value_image}
        alt={dish.name}
        style={{maxWidth: 149, width: '100%', marginBottom: 10}}
      />
      {dish.isHot && (
        <img
          alt='Hot'
          src={require('../assets/icons/15.png')}
          style={{
            width: 18,
            left: 0,
            top: 0,
            marginLeft: 14,
            marginTop: 14,
            height: "auto",
            position: "absolute",
          }}
        />
      )}
      {dish.isNew && (
        <img
          alt='New'
          src={require('../assets/icons/14.png')}
          style={{
            width: 34,
            height: "auto",
            margin: 14,
            left: 0,
            top: 0,
            position: "absolute",
          }}
        />
      )}
      <button
        onClick={wishlistHandler}
        style={{
          position:'absolute',
          right: 0,
          bottom: 72 - 15,
          padding: 15,
          borderRadius: 10,
        }}
      >
        <svg.HeartSvg dish={dish} />
      </button>
      <components.Name dish={dish} containerStyle={{ marginBottom: 3 }} />
      <components.Price dish={dish} />
      <button
        onClick={cartHandler}
        style={{
          position: 'absolute',
          padding: 14,
          right: 0,
          bottom: 0,
          borderRadius: 10,
        }}
      >
        <svg.PlusSvg />
      </button>
    </div>
  );
};
