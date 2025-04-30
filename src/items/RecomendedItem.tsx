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
import { setCartCount } from '../store/slices/cartSlice';

type Props = {
  index: number;
  dish: DishType;
  isLast: boolean;
};

export const RecomendedItem: React.FC<Props> = ({ index, dish, isLast }) => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();
  const [quantity, setQuantity] = useState<number>(0);

  // console.log("eeee", quantity);

  const [cartItemId, setCartItemId] = useState<string | null>(null);

  const c_id = localStorage.getItem('c_id') || '';

  const cityId = localStorage.getItem('cityId') || '';

  const wishlist = useSelector((state: RootState) => state.wishlistSlice);
  const ifInWishlist = wishlist.list.find(
    (item) => item.option_value_name === dish.option_value_name
  );

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const fetchCartData = async () => {
    try {
      const formData = new FormData();
      formData.append('city_id', cityId);
      formData.append('c_id', c_id);
      formData.append('area_id', localStorage.getItem('area_id') || '');
      formData.append('next_id', '0');
      formData.append('cart_type', '2');

      const response = await axios.post(
        'https://heritage.bizdel.in/app/consumer/services_v11/getCartDatasrv',
        formData
      );

      if (response.data.optionListing) {
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

  useEffect(() => {
    fetchCartData();
  }, [cityId, c_id, dish.product_option_value_id]);

  const HandleAddToCart = async () => {
    if (!c_id) {
      Modal.confirm({
        title: 'Please Sign In',
        content: 'You need to sign in to add items to your cart.',
        onOk() {
          navigate('/');
        },
        onCancel() { },
        cancelText: 'Cancel',
        okText: 'Sign In',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('c_id', c_id);
      formData.append('product_id', String(dish.product_id));
      formData.append('package_id', '13');
      formData.append('product_option_id', String(dish.product_option_id));
      formData.append('product_option_value_id', String(dish.product_option_value_id));
      formData.append('quantity', '1');
      formData.append('weight', String(dish.weight));
      formData.append('weight_unit', String(dish.weight_unit));
      formData.append('delivery_preference', '0');
      formData.append('no_of_deliveries', '0');
      formData.append('order_date', getTomorrowDate());
      formData.append('order_type', '2');

      const response = await axios.post(
        'https://heritage.bizdel.in/app/consumer/services_v11/addItemToCart',
        formData
      );

      if (response.data.status === 'success') {
        notification.success({
          message: 'Success',
          description: response.data.message,
        });

        dispatch(actions.addToCart({ ...dish, quantity: 1 }));
        setQuantity(1);

        const newCartId =
          response.data.cart_id ||
          response.data.data?.cart_id ||
          response.data.data?.id ||
          null;

        if (newCartId) {
          setCartItemId(String(newCartId));
        } else {
          await fetchCartData();
        }
      } else {
        notification.error({
          message: 'Error',
          description: response.data.message || 'Something went wrong.',
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to add item to cart.',
      });
    }
  };

  const handleUpdateCart = async (newQuantity: number) => {
    if (newQuantity < 0 || !cartItemId) return;
    try {
      const formData = new FormData();
      formData.append('id', cartItemId);
      formData.append('c_id', c_id);
      formData.append('package_id', '13');
      formData.append('quantity', String(newQuantity));
      formData.append('delivery_preference', '0');
      formData.append('no_of_deliveries', '0');
      formData.append('order_date', getTomorrowDate());
      formData.append('order_type', '2');

      const response = await axios.post(
        'https://heritage.bizdel.in/app/consumer/services_v11/updateCartItem',
        formData
      );

      if (response.data.status === 'success') {
        setQuantity(newQuantity);
        notification.success({
          message: 'Success',
          description: response.data.message,
        });
      } else {
        notification.error({
          message: 'Error',
          description: response.data.message || 'Failed to update quantity.',
        });
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to update item quantity.',
      });
    }
  };

  const handleRemoveFromCart = async (event: React.MouseEvent) => {
    event.stopPropagation();

    if (!cartItemId) return;

    if (quantity > 1) {
      handleUpdateCart(quantity - 1);
    } else {
      try {
        const formData = new FormData();
        formData.append('id', cartItemId);
        formData.append('c_id', c_id);

        const response = await axios.post(
          'https://heritage.bizdel.in/app/consumer/services_v11/deleteCartItem',
          formData
        );

        if (response.data.status === 'success') {
          notification.success({
            message: 'Success',
            description: response.data.message,
          });

          dispatch(actions.removeItemCompletely({ ...dish }));
          setQuantity(0);
          setCartItemId(null);
          dispatch(setCartCount(Number(response.data.cart_count)));
        } else {
          notification.error({
            message: 'Error',
            description: response.data.message || 'Failed to remove item.',
          });
        }
      } catch (error) {
        console.error('Error removing item from cart:', error);
        notification.error({
          message: 'Error',
          description: 'Failed to remove item from cart.',
        });
      }
    }
  };

  const wishlistHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (ifInWishlist) {
      dispatch(actions.removeFromWishlist(dish));
    } else {
      dispatch(actions.addToWishlist(dish));
    }
  };

  return (
    <div className="proCardWrap">
      <div className="itemImgWrap">
        <img
          src={dish.option_value_image}
          alt={dish.name}
          onClick={() =>
            navigate(`/dish/${dish.option_value_name}`, { state: { dish } })
          }
        />
      </div>

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
            height: 'auto',
            position: 'absolute',
          }}
        />
      )}

      {dish.isNew && (
        <img
          alt="New"
          src={require('../assets/icons/14.png')}
          style={{
            width: 34,
            height: 'auto',
            margin: 14,
            left: 0,
            top: 0,
            position: 'absolute',
          }}
        />
      )}

      <div className="boxWrap">
        <button
          onClick={wishlistHandler}
          style={{
            position: 'absolute',
            right: 0,
            bottom: 57,
            padding: 15,
            borderRadius: 10,
          }}
        >
          <svg.HeartSvg dish={dish} />
        </button>

        <span className="t14 number-of-lines-1" style={{ marginBottom: 5 }}>
          {dish.option_value_name}
        </span>

        {/* <components.Price dish={dish} /> */}

        {Number(dish.discount ?? 0) > 0 ? (
          <>
            <span className="proPrice" style={{ textDecoration: 'line-through', color: '#888' }}>
              ₹ {dish.price}
            </span>
            <span className="proPrice" style={{ marginLeft: '8px' }}>
              ₹ {Number(dish.price ?? 0) - Number(dish.discount ?? 0)}
            </span>
          </>
        ) : (
          <span className="proPrice">
            ₹ {dish.price}
          </span>
        )}


        <div className="cartButtonWrap">
          {quantity < 1 ? (
            <button className="cartButton" onClick={HandleAddToCart}>
              + Add
            </button>
          ) : (
            <>
              <button
                className="cartButton"
                onClick={(event) =>
                  quantity === 1
                    ? handleRemoveFromCart(event)
                    : handleUpdateCart(quantity - 1)
                }
              >
                <svg.MinusSvg />
              </button>

              <span className="countNum">{quantity}</span>

              <button
                className="cartButton"
                onClick={() => handleUpdateCart(quantity + 1)}
              >
                <svg.AddSvg />
              </button>
            </>
          )}
        </div>


      </div>
    </div>
  );
};