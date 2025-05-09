import React, { useEffect, useState } from 'react';
import { hooks } from '../hooks';
import { svg } from '../assets/svg';
import { Modal, notification } from 'antd';
import axios from 'axios';
import { DishType } from '../types';
import { actions } from '../store/actions';
import { setCartCount, setShouldRefresh } from '../store/slices/cartSlice';
import { fetchWishlist, toggleWishlistItem } from '../store/slices/wishlistSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../store';


type Props = {
  dish: DishType;
  isLast: boolean;
  selectedCategory: string;
};

export const MenuListItem: React.FC<Props> = ({ dish, isLast, selectedCategory }) => {
  const showSubscribe = selectedCategory === '28' || selectedCategory === '29';
  // console.log("dishdishdishdishdish", dish);
  const dispatch = hooks.useDispatch();
  const [cartId, setCartId] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);


  // console.log("quantity", quantity);

  const [cartItemId, setCartItemId] = useState<string | null>(null);

  // console.log("qqqqqqqqqqqqqqqqqqqqqqqqmmmm", quantity);

  const c_id = localStorage.getItem('c_id') || '';

  const cityId = localStorage.getItem('cityId') || '';


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
        // console.error('Error removing item from cart:', error);
        notification.error({
          message: 'Error',
          description: 'Failed to remove item from cart.',
        });
      }
    }
  };


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
      formData.append('next_id', '0');
      formData.append('area_id', localStorage.getItem('area_id') || '');
      formData.append('cart_type', '2');

      const response = await axios.post(
        'https://heritage.bizdel.in/app/consumer/services_v11/getCartDatasrv',
        formData
      );

      //  console.log("responsez", response);

      if (response.data.optionListing) {
        const matchedItem = response.data.optionListing.find(
          (item: any) =>
            item.cart_product_option_value_id === dish.product_option_value_id
        );
        setLoading(true);

        if (matchedItem) {
          setQuantity(Number(matchedItem.quantity

          ) || 1);
          setCartItemId(String(matchedItem.cart_id));
        } else {
          setQuantity(0);
          setCartItemId(null);
        }
      }
    } catch (error) {
      //  console.error('Error fetching cart data:', error);
    }
  };
  useEffect(() => {
    fetchCartData();
  }, [cityId, c_id, dish]);

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
      setLoading(true);
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
      // console.error('Error adding to cart:', error);
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
      // console.error('Error updating cart:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to update item quantity.',
      });
    }
  };


  const navigate = hooks.useNavigate();
  // const { ifInWishlist, addToWishlist, removeFromWishlist } =
  hooks.useWishlistHandler();



  // if (loading) {
  //   return <components.Loader />;
  // }

  const wishlist = useSelector((state: RootState) => state.wishlistSlice.list);


  const wishlistHandler = async (event: React.MouseEvent<HTMLButtonElement>) => {
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

    const isInWishlist = wishlist.some(
      (item) => item.option_value_id === dish.option_value_id
    );

    const type = isInWishlist ? 2 : 1;

    try {
      const resultAction = await dispatch(toggleWishlistItem({
        product_id: dish.product_id,
        product_option_id: dish.product_option_id,
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


  const isInWishlist = wishlist.some(
    (item) => item.option_value_id === dish.option_value_id
  );

  return (
    <li className="proListItemWrap">
      <div className="proLeftBox">
        <div className="proItemImgWrap">
          <img
            src={dish.option_value_image}
            alt={dish.name}
            className="proItemImg"
            onClick={() =>
              navigate(`/dish/${dish.option_name}`, { state: { dish , showSubscribe} })
            }
          />
        </div>
        <div className="proItemDetailsWrap">
          {/* <span
          className="t14"
          style={{
            marginBottom: 4,
            color: "var(--main-color)",
            textTransform: "capitalize",
          }}
        >
          {dish.name}
        </span>
        <p
          className="t10"
          style={{
            fontSize: 10,
            color: "var(--text-color)",
            lineHeight: 1.5,
            marginBottom: 4,
          }}
        >
          {dish.description}
        </p> */}
          <span className="proName">{dish.option_value_name}</span>
          <span className="proWeigh">
            {/* {dish.kcal} kcal - {dish.weight}g */}
            {dish.weight} {dish.weight_unit}
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
        </div>
      </div>
      <button
        onClick={wishlistHandler}
        style={{
          position: 'absolute',
          right: 0,
          top: -10,
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
      <div className="lastBox">
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
        {
          quantity === 0 ? (<>
            {/* <button className="subscriptionButton"
              onClick={() =>
                navigate(`/dish/${dish.option_name}`, { state: { dish } })
              }>
                Subscribe
            </button> */}
            {showSubscribe && (
              <button className="subscriptionButton"
                onClick={() =>
                  navigate(`/dish/${dish.option_name}`, { state: { dish } })
                }>
                Subscribe
              </button>
            )}
          </>) : (<>
            <span className="smallText">Deliver once</span>
          </>)
        }
      </div>
    </li>
  );
};


