
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { hooks } from '../hooks';
import { DishType } from '../types';
import { svg } from '../assets/svg';
import { RootState } from '../store';
import { actions } from '../store/actions';
import { components } from '../components';
import axios from 'axios';
import { notification, Modal } from 'antd';


type Props = {
  index: number;
  dish: DishType;
  isLast: boolean;
};

export const RecomendedItem: React.FC<Props> = ({ index, dish, isLast }) => {

  // console.log("qqqqqqqqqqqqq", dish);
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();
  const [quantity, setQuantity] = useState<number>(1);
  const [cartId, setCartId] = useState<string[]>([]);
  const [cartItemId, setCartItemId] = useState<string | null>(null);

  const c_id = localStorage.getItem('c_id') || '1';
  const cityId = localStorage.getItem('cityId') || '';


  const wishlist = useSelector((state: RootState) => state.wishlistSlice);
  const ifInWishlist = wishlist.list.find(
    (item) => item.option_value_name === dish.option_value_name
  );

  const HandleAddToCart = async () => {

    const c_id = localStorage.getItem('c_id'); 
    
    if (!c_id) {
      Modal.info({
        title: 'Please Sign In',
        content: 'You need to sign in to add items to your cart.',
        onOk() {  
          navigate('/');
        },
      });
      return; 
    }
    try {
      const formData = new FormData();
      formData.append('c_id', c_id);
      formData.append('product_id', String(dish.product_id));
      formData.append('package_id', String(13));
      formData.append('product_option_id', String(dish.product_option_id));
      formData.append('product_option_value_id', String(dish.product_option_value_id));
      formData.append('quantity', '1');
      formData.append('weight', '500');
      formData.append('weight_unit', 'mg');
      formData.append('delivery_preference', '1');
      formData.append('no_of_deliveries', '1');
      formData.append('order_date', getTomorrowDate());
      formData.append('order_type', '2');
  
      const response = await axios.post(
        'https://heritage.bizdel.in/app/consumer/services_v11/addItemToCart',
        formData
      );
  
      if (response.data.status === 'success') {
        notification.success({ message: 'Success', description: response.data.message });
        window.location.reload();
        setQuantity(1);
        setCartItemId(response.data.cart_id);
      } else {
        notification.error({ message: 'Error', description: response.data.message || 'Something went wrong.' });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      notification.error({ message: 'Error', description: 'Failed to add item to cart.' });
    }
  };

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const formData = new FormData();
        formData.append('city_id', cityId);
        formData.append('c_id', c_id);
        formData.append('next_id', '0');

        const response = await axios.post(
          'https://heritage.bizdel.in/app/consumer/services_v11/getCartData',
          formData
        );

        // console.log("aaasasasasasasasasasasa", response);


        if (response.data.optionListing) {
          const cartItems = response.data.optionListing.map(
            (item: any) => item.cart_product_option_value_id
          );
          setCartId(cartItems);

          const matchedItem = response.data.optionListing.find(
            (item: any) =>
              item.cart_product_option_value_id === dish.product_option_value_id
          );

          if (matchedItem) {
            setQuantity(Number(matchedItem.quantity) || 1);
            setCartItemId(String(matchedItem.cart_id));
          } else {
            setQuantity(0);
            setCartItemId(null);
          }
        }
      } catch (error) {

        console.error('Error fetching cart data:', error);

      }
    };

    fetchCartData();
  }, [cityId, c_id, dish.product_option_value_id]);

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return tomorrow.toISOString().split('T')[0];
  };




  const handleUpdateCart = async (newQuantity: number) => {
    if (newQuantity < 0) return;

    try {
      const formData = new FormData();

      formData.append('id', String(cartItemId || '')); 
      formData.append('c_id', c_id);
      formData.append('package_id', '13');
      formData.append('quantity', String(newQuantity));
      formData.append('delivery_preference', '0');
      formData.append('no_of_deliveries', '0');
      formData.append('order_date', getTomorrowDate());
      formData.append('order_type', '1');

      const response = await axios.post(
        'https://heritage.bizdel.in/app/consumer/services_v11/updateCartItem',
        formData
      );

      if (response.data.status === 'success') {

        if (newQuantity === 0) {
          setQuantity(0);
        } else {
          setQuantity(newQuantity);
        }

        notification.success({ message: 'Success', description: response.data.message });
      } else {
        notification.error({ message: 'Error', description: response.data.message || 'Failed to update quantity.' });
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      notification.error({ message: 'Error', description: 'Failed to update item quantity.' });

    }
  };

  const handleRemoveFromCart = async (event: React.MouseEvent) => {
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
        padding: 14,
        paddingTop: 8,
        borderRadius: 10,
        position: 'relative',
        marginLeft: index === 0 ? 20 : 0,
        marginRight: isLast ? 20 : 0,
        backgroundColor: 'var(--white-color)',
      }}
    >
      <img
        src={dish.option_value_image}
        alt={dish.name}
        style={{ maxWidth: 149, width: '100%', marginBottom: 10 }}
        onClick={() => navigate(`/dish/${dish.option_value_name}`, { state: { dish } })}
      />
      {dish.isHot && (
        <img
          alt="Hot"
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
          alt="New"

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
          position: 'absolute',
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

      <div
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          margin: 14,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {quantity === 0 ? (
          <button
            style={{
              border: '1px solid green',
              padding: '7px 12px',
              borderRadius: 6,
              cursor: 'pointer',
            }}
            onClick={HandleAddToCart}
          >
            + Add
          </button>
        ) : (
          <>
            <button
              onClick={(event) =>
                quantity === 1 ? handleRemoveFromCart(event) : handleUpdateCart(quantity - 1)
              }
              style={{ padding: '4px 14px', borderRadius: 4 }}
            >
              <svg.MinusSvg />
            </button>

            <span style={{ margin: '0 10px' }}>{quantity}</span>

            <button
              onClick={() => handleUpdateCart(quantity + 1)}
              style={{ padding: '4px 14px', borderRadius: 4 }}
            >
              <svg.AddSvg />
            </button>
          </>
        )}

      </div>
    </div>
  );
};
