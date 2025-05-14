import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { hooks } from '../hooks';
import { svg } from '../assets/svg';
import { RootState } from '../store';
import type { DishType } from '../types';
import { components } from '../components';
import { actions } from '../store/actions';
import { Modal, notification } from 'antd';
import axios from 'axios';
import { setCartCount } from '../store/slices/cartSlice';
import { fetchWishlist, toggleWishlistItem } from '../store/slices/wishlistSlice';

type Props = {
  dish: DishType;
  selectedCategory: string;
};

export const FavoriteItem: React.FC<Props> = ({ dish, selectedCategory }) => {

  const showSubscribe = selectedCategory === '28' || selectedCategory === '29';
  
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();

  const [quantity, setQuantity] = useState<number>(0);

  const [cartItemId, setCartItemId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [prevQuantity, setPrevQuantity] = useState<number>(0);

  const c_id = localStorage.getItem('c_id') || '';
  const cityId = localStorage.getItem('cityId') || '';
  const [wishlistData, setWishlistData] = useState([])


  // console.log("wishlistDatawishlistData", wishlistData);

  const wishlist = useSelector((state: RootState) => state.wishlistSlice.list);

  // console.log("wishlistccccc", wishlist);

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // *************************************************************
  useEffect(() => {
    const functionData = async () => {
      try {
        const c_id = localStorage.getItem('c_id');
        const area_id = localStorage.getItem('area_id');
        const city_id = localStorage.getItem('cityId');

        if (!c_id || !area_id || !city_id) {
          throw new Error('Missing required values in localStorage');
        }

        const formData = new FormData();
        formData.append('c_id', c_id);
        formData.append('area_id', area_id);
        formData.append('city_id', city_id);
        formData.append('next_id', '0');

        const response = await axios.post(
          'https://heritage.bizdel.in/app/consumer/services_v11/getWishlistData',
          formData
        );
        const wishlistData = response.data.wishlistListing
        setWishlistData(wishlistData);

        // console.log("rrrrr", response);
      } catch (error) {
        // console.log("error")
      }
    }
    functionData()
  }, [])


  // ********************************************************************

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
  // console.log("product_option_value_id", dish);

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
      formData.append('product_option_id', String(dish.option_id));
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
        setPrevQuantity(quantity);
        setQuantity(1);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);

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
        setPrevQuantity(quantity);
        setQuantity(newQuantity);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);
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
          setPrevQuantity(quantity);
          setQuantity(0);
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 500);
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

  // ******************************************************************************************************************

  const wishlistHandler = async (event: React.MouseEvent<HTMLButtonElement>) => {
    // alert("helooooooooooooooooooo");
    event.stopPropagation();
    const c_id_num = parseInt(localStorage.getItem('c_id') || '0');
    if (!c_id_num) {
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
    // console.log("dddddddd", dish)

    const isInWishlist = wishlist.some(
      (item) => item.product_option_value_id === dish.product_option_value_id
    );

    // console.log("tttttt", isInWishlist);


    const type = isInWishlist ? 2 : 1;

    // console.log("hhhh", dish.option_value_id);
    try {
      const resultAction = await dispatch(toggleWishlistItem({
        product_id: dish.product_id,
        product_option_id: Number(dish.product_id),
        product_option_value_id: dish.product_option_value_id,
        c_id: c_id_num,
        type
      }));

      if (toggleWishlistItem.fulfilled.match(resultAction)) {
        dispatch(fetchWishlist());
      }
    } catch (error) {
      console.error('Wishlist action failed:', error);
    }
  };

  // ********************************************************************************************************************

  const isInWishlist = wishlist.some((item) => {
    // console.log('Item product_option_value_id:', item.product_option_value_id);

    // console.log('Dish product_option_value_id:', dish.product_option_value_id);

    return item.product_option_value_id === dish.product_option_value_id;
  });

  // console.log("mmmm", isInWishlist);

  return (
    <>
      <div className="proCardWrap">
        <div className="itemImgWrap">
          <img
            src={dish.option_value_image}
            alt={dish.name}
            onClick={() => {
              localStorage.setItem('product_option_value_id', dish.product_option_value_id.toString());
              navigate(`/dish/${dish.option_name}`, {
                state: {
                  dish,
                  showSubscribe: dish.subscription_product,
                },
              });
            }}
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
              bottom: 46,
              padding: 15,
              borderRadius: 10,
              backgroundColor: 'transparent',
              border: 'none',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              style={{
                fill: isInWishlist ? 'red' : 'gray',
                transition: 'fill 0.3s ease',
              }}
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
          </button>

          <span className="t14 number-of-lines-1" style={{ marginBottom: 5 }}>
            {dish.option_value_name}
          </span>

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

                <div className="countNum">
                  {isAnimating && (
                    <span
                      className={
                        quantity > prevQuantity ? "scroll-up" : "scroll-down"
                      }
                    >
                      {quantity}
                    </span>
                  )}
                  {!isAnimating && <span>{quantity}</span>}
                </div>

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
    </>
  );
};
