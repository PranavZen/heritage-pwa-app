import React, { useEffect, useState } from 'react';
import { hooks } from '../hooks';
import { svg } from '../assets/svg';
import { notification } from 'antd';
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
      formData.append('delivery_preference', '1');
      formData.append('no_of_deliveries', '1');
      formData.append('order_date', getTomorrowDate());
      formData.append('order_type', '1');

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
      formData.append('id', String(dish.cart_id || '')); // Handle null/undefined cart_id
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
  const { ifInWishlist, addToWishlist, removeFromWishlist } = hooks.useWishlistHandler();

  return (
    <li
      style={{
        borderRadius: 10,
        padding: '14px 14px',
        backgroundColor: 'var(--white-color)',
        marginBottom: isLast ? 0 : 14,
        position: 'relative',
      }}
      className='row-center'
    >
      <img
        src={dish.option_value_image}
        alt={dish.name}
        style={{ width: 117, height: 'auto', borderRadius: 10, marginRight: 10 }}
        onClick={() => navigate(`/dish/${dish.option_name}`, { state: { dish } })}
      />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span className='t14' style={{ marginBottom: 4, color: 'var(--main-color)', textTransform: 'capitalize' }}>
          {dish.name}
        </span>
        <p className='t10' style={{ fontSize: 10, color: 'var(--text-color)', lineHeight: 1.5, marginBottom: 4 }}>
          {dish.description}
        </p>
        <span className='t10' style={{ marginBottom: 8 }}>
          {dish.kcal} kcal - {dish.weight}g
        </span>
        <span className='t14' style={{ color: 'var(--main-color)' }}>₹ {dish.price}</span>
        <span className='t14' style={{ color: 'var(--main-color)' }}>{dish.option_value_name}</span>
      </div>

      <button
        style={{ padding: 14, position: 'absolute', right: 0, top: 0, borderRadius: 4 }}
        onClick={(event) =>
          ifInWishlist(dish.option_value_name ?? 0) ? removeFromWishlist(dish, event) : addToWishlist(dish, event)
        }
      >
        <svg.HeartSvg dish={dish} />
      </button>

      <div style={{ position: 'absolute', right: 0, bottom: 0, margin: 14, display: 'flex', alignItems: 'center' }}>
        {quantity === 0 ? (
          <button
            style={{ border: '1px solid green', padding: '7px 12px', borderRadius: 6, cursor: 'pointer' }}
            onClick={HandleAddToCart}
          >
            + Add
          </button>
        ) : (
          <>
            <button
              onClick={(event) => (quantity === 1 ? handleRemoveFromCart(event) : handleUpdateCart(quantity - 1))}
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

    </li>
  );
};
