import React, { useEffect, useState } from 'react';
import { hooks } from '../hooks';
import { svg } from '../assets/svg';
import axios from 'axios';
import type { DishType } from '../types';
import { notification, Button, Modal, Input } from 'antd';
import { Route, Routes } from 'react-router-dom';

type Props = {
  dish: DishType;
};

export const OrderItemCoupon: React.FC<Props> = ({ dish}) => {
  const navigate = hooks.useNavigate();
  const { removeFromCart } = hooks.useCartHandler();
  const [deliveryPreferenceInModal, setDeliveryPreferenceInModal] = useState<any[]>([]);
  const [deliveriesInModal, setDeliveriesInModal] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  useEffect(() => {
    const getData = async () => {
      const formData = new FormData();
      formData.append('c_id', localStorage.getItem('c_id') || '');
      formData.append('city_id', localStorage.getItem('cityId') || '');
      formData.append('product_option_value_id', '50');
      try {
        const response = await axios.post('https://heritage.bizdel.in/app/consumer/services_v11/productDetailsByOption', formData);
        setDeliveryPreferenceInModal(response.data.productDetails);
        setDeliveriesInModal(response.data.productDetails);
      } catch (error) {
        console.error('Error fetching delivery preferences:', error);
      }
    };
    getData();
  }, []);

  const [quantity, setQuantity] = useState<number>(Number(dish.quantity) || 1);
  const [deliveryPreference, setDeliveryPreference] = useState<string>(String(dish.delivery_preference) || '');
  const [noOfDeliveries, setNoOfDeliveries] = useState<number>(Number(dish.no_of_deliveries));
  const [selectedPackage, setSelectedPackage] = useState<string>(dish.packages_name || '');
  const [selectedPackageDetails, setSelectedPackageDetails] = useState<string>();
  const [cartData, SetSetCartData] = useState<string>();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleUpdateCart = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append('id', String(dish.cart_id));
    formData.append('c_id', localStorage.getItem('c_id') || '');
    formData.append('package_id', String(dish.package_id || '13'));
    formData.append('quantity', String(newQuantity));
    formData.append('delivery_preference', deliveryPreference);
    formData.append(
      'no_of_deliveries',
      String(selectedPackageDetails || noOfDeliveries)
    );
    formData.append('order_date', String(dish.cart_order_date));
    formData.append('order_type', '2');
    try {
      const response = await axios.post('https://heritage.bizdel.in/app/consumer/services_v11/updateCartItem', formData);
      if (response.data.status === 'success') {
        setQuantity(newQuantity);
        notification.success({ message: response.data.message });
         navigate(0);

      } else {
        notification.error({ message: response.data.message });
      }
    } catch (error) {
      console.error("Error updating cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromCart = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (quantity > 1) {
      handleUpdateCart(quantity - 1);
      setIsLoading(true);
    } else if (quantity === 1) {
      Modal.confirm({
        content: 'Are you sure you want to remove the item from the cart?',
        onOk: async () => {
          try {
            const formData = new FormData();
            formData.append('id', String(dish.cart_id));
            formData.append('c_id', localStorage.getItem('c_id') || '');
            const response = await axios.post(
              'https://heritage.bizdel.in/app/consumer/services_v11/deleteCartItem',
              formData
            );
            if (response.data.status === 'success'){
              notification.success({message:response.data.message});
              setIsLoading(true);
            } else {
              notification.error({ message: response.data.message });
            }
          } catch (error) {
            notification.error({ message: 'Failed to remove item from cart. Please try again later.' });
          } finally {
            setIsLoading(false);
          }
        },
        onCancel() {
        },
        cancelText: 'Cancel',
        okText: 'Okay',
      });
      return;
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
          notification.success({message:response.data.message});
          window.location.reload();      
    
        } else {
          notification.error({ message: response.data.message });
        }
      } catch (error) {
        console.error('Error removing item from cart:', error);
        notification.error({ message: 'Failed to remove item from cart. Please try again later.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  //**************************************************************************
  const c_id = localStorage.getItem('c_id');
  const cityId = localStorage.getItem('cityId');
   
  useEffect(() => {
    const getAddToCartData = async () => {
      const formData = new FormData();
      formData.append('city_id', cityId || '');
      formData.append('c_id', c_id || '');
      formData.append('area_id', localStorage.getItem('area_id') || '');
      formData.append('next_id', '0');
      try {
        const response = await axios.post(
          `https://heritage.bizdel.in/app/consumer/services_v11/getCartDatasrv`,
          formData
        );
        SetSetCartData(response.data.optionListing.map((elem: any) => elem.no_of_deliveries));
      } catch (error) {
        console.error(error);
      }
    };
    getAddToCartData();
  }, [cityId, c_id]);

  // *************************************************************************************
  const handleOpenModal = (option_name: any) => {
    navigate(`/dish/${dish.option_name}`, { state: { dish } });
  }

  const handleOk = async () => {
    await handleUpdateCart(quantity);
    setIsModalOpen(false);
  };
  
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <li className="cartLitItem">
        <div className="cartLeftBox">
          <div className="cartItmImgWrap">
            <img
              src={dish.option_value_image}
              alt={dish.name}
              className="cartItemImg"
            />
          </div>

          <div className="cartItemDetailsWrap">
            <span
              className="t14"
              style={{
                color: "var(--main-color)",
                fontWeight: 600,
                fontSize: 16,
              }}
            >
              {dish.option_name}{" "}
              <span className="t10" style={{ fontSize: 14 }}>
                {/* {dish.kcal} kcal - {dish.weight}g */}({dish.weight}ml)
              </span>
            </span>

            <span
              className="t14"
              style={{
                color: "var(--main-color)",
                fontWeight: 600,
                fontSize: 16,
              }}
            >
              ₹ {dish.price}
            </span>

            <span
              className="t14"
              style={{ color: "var(--main-color)", fontWeight: 500 }}
            >
              <span className="cartLable">Qty :</span> {quantity}
            </span>
            {noOfDeliveries > 0 && (
              <span className="t14" style={{ color: 'var(--main-color)', fontWeight: 500 }}>
                Deliveries : {noOfDeliveries}
              </span>
            )}
            {dish.preferenceName && (
              <span className="t14" style={{ color: 'var(--main-color)', fontWeight: 500 }}>
                Preference : {dish.preferenceName}
              </span>
            )}

            {dish.packages_name && dish.packages_name !== '0' && (
              <span className="t14" style={{ color: 'var(--main-color)', fontWeight: 500 }}>
                Package : {dish.packages_name}
              </span>
            )}

            <span
              className="t14"
              style={{ color: "var(--main-color)", fontWeight: 500 }}
            >
              <span className="cartLable">Starts on :</span>{" "}
              {dish.cart_order_date}
            </span>
          </div>

        </div>
        <div className="cartRightBox">
          <div className="cartButtonWrap">
            {noOfDeliveries > 0 && (
              <div onClick={handleOpenModal} className="cartButton"
                style={{ cursor: "pointer" }}
              >Modify</div>
            )}
          </div>
          {/* Remove (Decrease Quantity) */}
          <div className="cartButtonWrap">
            <button className="cartButton" onClick={handleRemoveFromCart}>
              -
            </button>

            {/* Display updated quantity */}
            <span className="countNum">{quantity}</span>

            {/* Add to cart (Increase Quantity) */}
            <button
              className="cartButton"
              onClick={() => handleUpdateCart(quantity + 1)}
            >
              +
            </button>
          </div>
        </div>
      </li>
      <div>
        {/* Cart Item Display */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p>{dish.name}</p>

          {/* Remove from Cart Button */}
          {/* <button
            style={{ padding: '14px 14px 4px 14px', borderRadius: 4 }}
            onClick={handleRemoveFromCart}
          > */}
          {/* <svg.RemoveSvg /> */}
          {/* </button> */}
        </div>

      </div>
    </>
  );
};
