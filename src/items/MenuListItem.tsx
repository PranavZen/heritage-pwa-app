import React, { useEffect, useState } from 'react';
import { hooks } from '../hooks';
import { svg } from '../assets/svg';
import { Modal, notification } from 'antd';
import axios from 'axios';
import { DishType } from '../types';

type Props = {
  dish: DishType;
  isLast: boolean;
};

export const MenuListItem: React.FC<Props> = ({ dish, isLast }) => {
  const [cartId, setCartId] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(0);

  // console.log("qqqqqqqqqqqqqqqqqqqqqqqqmmmm", quantity);

  const c_id = localStorage.getItem('c_id') || '1';
  const cityId = localStorage.getItem('cityId') || '';

  const handleRemoveFromCart = async (event: React.MouseEvent) => {
    event.stopPropagation();

    if (quantity > 1) {
      handleUpdateCart(quantity - 1);
    } else {
      try {
        const formData = new FormData();
        formData.append('id', String(dish.cart_id));
        formData.append('c_id', localStorage.getItem('c_id') || '');

        const response = await axios.post(
          'https://heritage.bizdel.in/app/consumer/services_v11/deleteCartItem',
          formData
        );

        if (response.data.status === 'success') {
          notification.success({ message: 'Success', description: response.data.message });
          window.location.reload(); // Reload page after successful deletion
        } else {
          notification.error({ message: 'Error', description: response.data.message || 'Failed to remove item.' });
        }
      } catch (error) {
        console.error('Error removing item from cart:', error);
        notification.error({ message: 'Error', description: 'Failed to remove item from cart.' });
      }
    }
  };



  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
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
        
        if (response.data.optionListing) {
          const cartItems = response.data.optionListing.map((item: any) => item.cart_product_option_value_id);
          setCartId(cartItems);

          const matchedItem = response.data.optionListing.find(
            (item: any) => item.cart_product_option_value_id === dish.product_option_value_id
          );

          if (matchedItem) {
            setQuantity(Number(matchedItem.quantity) || 1);
          } else {
            setQuantity(0);
          }
        }
      } catch (error) {
        console.error('Error fetching cart data:', error);
      }
    };

    fetchCartData();
  }, [cityId, c_id, dish.product_option_value_id]);

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
        notification.success({ message: 'Success', description: response.data.message });
        window.location.reload();
        setQuantity(1);
      } else {
        notification.error({ message: 'Error', description: response.data.message || 'Something went wrong.' });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      notification.error({ message: 'Error', description: 'Failed to add item to cart. Please try again later.' });
    }
  };

  const handleUpdateCart = async (newQuantity: number) => {
    if (newQuantity < 0) return;

    try {
      const formData = new FormData();
      formData.append('id', String(dish.cart_id || '')); 
      formData.append('c_id', c_id);
      formData.append('package_id', '13');
      formData.append('quantity', String(newQuantity));
      formData.append('delivery_preference', '1');
      formData.append('no_of_deliveries', '1');
      formData.append('order_date', getTomorrowDate());
      formData.append('order_type', '1');

      const response = await axios.post(
        'https://heritage.bizdel.in/app/consumer/services_v11/updateCartItem',
        formData
      );

      if (response.data.status === 'success') {
        if (newQuantity === 0) {
          setQuantity(0); // Reset to 0 if quantity reaches 0
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

  const navigate = hooks.useNavigate();
  const { ifInWishlist, addToWishlist, removeFromWishlist } =
    hooks.useWishlistHandler();

  return (
    <li className="proListItemWrap">
      <div className="proLeftBox">
        <div className="proItemImgWrap">
          <img
            src={dish.option_value_image}
            alt={dish.name}
            className="proItemImg"
            onClick={() =>
              navigate(`/dish/${dish.option_name}`, { state: { dish } })
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
            {dish.weight}ml
          </span>
          <span className="proPrice">₹ {dish.price}</span>
        </div>
      </div>

      <button
        className="wishListBtn"
        onClick={(event) =>
          ifInWishlist(dish.option_value_name ?? 0)
            ? removeFromWishlist(dish, event)
            : addToWishlist(dish, event)
        }
      >
        <svg.HeartSvg dish={dish} />
      </button>

      <div className="lastBox">
      <div className="cartButtonWrap ">
        {quantity === 0 ? (
          <button className="cartButton addBtnText" onClick={HandleAddToCart}>
            + Add
          </button>
        ) : (
          <>
            <button
              onClick={(event) =>
                quantity === 1
                  ? handleRemoveFromCart(event)
                  : handleUpdateCart(quantity - 1)
              }
              className="cartButton"
            >
            -
            </button>

            <span className="countNum">{quantity}</span>

            <button
              onClick={() => handleUpdateCart(quantity + 1)}
              className="cartButton"
            >
             +
            </button>
          </>
        )}
      </div>
      <span className="smallText">Deliver once</span>
      </div>
    </li>
  );
};
