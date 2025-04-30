import React, { useEffect, useState } from 'react';
import { hooks } from '../hooks';
import { svg } from '../assets/svg';
import axios from 'axios';
import type { DishType } from '../types';
import { notification, Button, Modal, Input } from 'antd';
import { Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart, setShouldRefresh } from '../store/slices/cartSlice';
import { RootState } from '../store';
import { TabScreens } from '../routes';
import { actions } from '../store/actions';

type Props = {
  dish: DishType;
  isLast: boolean;
};

export const OrderItem: React.FC<Props> = ({ dish, isLast }) => {

  // console.log("dishzzzzzzzzzz", dish.product_option_value_id);
  const dispatch = useDispatch();
  const navigate = hooks.useNavigate();
  const [deliveryPreferenceInModal, setDeliveryPreferenceInModal] = useState<any[]>([]);
  const [deliveriesInModal, setDeliveriesInModal] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const cartCount = useSelector((state: RootState) => state.cartSlice.cartCount);

  useEffect(() => {
    const getData = async () => {
      const formData = new FormData();
      formData.append('c_id', localStorage.getItem('c_id') || '');
      formData.append('city_id', localStorage.getItem('cityId') || '');
      formData.append('product_option_value_id', (dish.product_option_value_id ? dish.product_option_value_id.toString() : ''));
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
  // console.log('[noOfDeliveries[noOfDeliveries[noOfDeliveries', noOfDeliveries);
  const [selectedPackage, setSelectedPackage] = useState<string>(dish.packages_name || '');
  const [selectedPackageDetails, setSelectedPackageDetails] = useState<string>();
  const [cartData, SetSetCartData] = useState<string>();

  // console.log('quantityquantityquantity', quantity);
  const c_id = localStorage.getItem('c_id');
  const cityId = localStorage.getItem('cityId');



  // console.log("dis", dish);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // console.log("selectedPackageDetails", deliveryPreference);


  const handleUpdateCart = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append('id', String(dish.cart_id));
    formData.append('c_id', localStorage.getItem('c_id') || '');
    formData.append('package_id', String('13'));
    formData.append('quantity', String(newQuantity));
    formData.append('delivery_preference', deliveryPreference);
    formData.append(
      'no_of_deliveries',
      String(selectedPackageDetails || noOfDeliveries)
    );
    formData.append('order_date', String(dish.cart_order_date));

    const orderType = deliveryPreference !== '0' ? '1' : '2';
    formData.append('order_type', orderType);

    try {
      const response = await axios.post(
        'https://heritage.bizdel.in/app/consumer/services_v11/updateCartItem',
        formData
      );

      // console.log("mmm", response);

      if (response.data.status === 'success') {
        setQuantity(newQuantity);
        notification.success({ message: response.data.message });
        dispatch(addToCart(dish));
        dispatch(setShouldRefresh(true));
      } else if (response.data.status === 'fail') {
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
      const newQuantity = quantity - 1;
      try {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('id', String(dish.cart_id));
        formData.append('c_id', localStorage.getItem('c_id') || '');
        formData.append('package_id', String(dish.package_id || '13'));
        formData.append('quantity', String(newQuantity));
        formData.append('delivery_preference', deliveryPreference);
        formData.append('no_of_deliveries', String(selectedPackageDetails || noOfDeliveries));
        formData.append('order_date', String(dish.cart_order_date));
        formData.append('order_type', '1');

        const response = await axios.post(
          'https://heritage.bizdel.in/app/consumer/services_v11/updateCartItem',
          formData
        );

        if (response.data.status === 'success') {
          setQuantity(newQuantity);
          const updatedDish = { ...dish };
          dispatch(actions.removeItemCompletely({ ...dish }));
          setQuantity(0);
          // setCartItemId(null);
          dispatch(setShouldRefresh(true));
          notification.success({ message: response.data.message });
        } else {
          notification.error({ message: response.data.message });
        }
      } catch (error) {
        notification.error({ message: 'Failed to update cart item.' });
      }
      finally {
        setIsLoading(false);
      }

    } else {
      // quantity === 1: remove completely
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

            if (response.data.status === 'success') {
              notification.success({ message: response.data.message });
              dispatch(removeFromCart({ ...dish }));
              setQuantity(1);
              dispatch(setShouldRefresh(true));
            } else {
              notification.error({ message: response.data.message });
            }
          } catch (error) {
            notification.error({ message: 'Failed to remove item from cart.' });
          } finally {
            setIsLoading(false);
          }
        },
        cancelText: 'Cancel',
        okText: 'Okay',
      });
    }
  };


  useEffect(() => {
    const getAddToCartData = async () => {
      const formData = new FormData();
      formData.append('city_id', cityId || '');
      formData.append('c_id', c_id || '');
      formData.append('next_id', '0');
      formData.append('area_id', localStorage.getItem('area_id') || '');
      formData.append('cart_type', '2');
      try {
        const response = await axios.post(
          `https://heritage.bizdel.in/app/consumer/services_v11/getCartDatasrv`,
          formData
        );

        // console.log('xzxzxzxzxzxzxzxzxzxzxzxzxzxzxzx', response.data);

        SetSetCartData(response.data.optionListing.map((elem: any) => elem.no_of_deliveries));
      } catch (error) {
        console.error(error);
      }
    };
    getAddToCartData();
  }, [cityId, c_id]);

  // *************************************************************************************
  const handleOpenModal = (option_name: any) => {
    // console.log("aaaacccccccccccccccccccc", option_name)
    // setIsModalOpen(true);
    navigate(`/dish/${dish.option_name}`, { state: { dish } });
  }

  const handleOpenModalMenuList = (option_name: any) => {

    navigate(`/dish/${dish.option_name}`, { state: { dish } });
  }

  const handleOk = async () => {
    await handleUpdateCart(quantity);
    setIsModalOpen(false);
  };

  // Handle modal Cancel click
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  // ******************************


  // if (cartCount === 0) {
  //   return <h1>Cart is empty</h1>;
  // }

  // useEffect(() => {
  //   if (cartCount === 0) {
  //     localStorage.removeItem('curScreen');
  //   }
  // }, [cartCount]);

  return (
    <>
      <div className="itemListBox">

        <li className="cartLitItem">
          <div className="cartLeftBox">
            <div className="cartItmImgWrap"
            >
              <img
                src={dish.option_value_image}
                alt={dish.name}
                className="cartItemImg"
                style={{ cursor: "pointer" }}
                onClick={handleOpenModalMenuList}

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

                {dish.option_value_name}{" "}
                <span className="t10" style={{ fontSize: 14 }}>
                  ({dish.weight}ml)
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
                MRP  ₹ {dish.price}
              </span>
              <span
                className="t14"
                style={{
                  color: "var(--main-color)",
                  fontWeight: 600,
                  fontSize: 16,
                }}
              >
                  ₹ {Number(dish.price ?? 0) - Number(dish.discount ?? 0)}
              </span>



              <span
                className="t14"
                style={{ color: "var(--main-color)", fontWeight: 500 }}
              >
                <span className="cartLable">Qty :</span> {quantity}
              </span>

              {noOfDeliveries > 0 && (
                <span
                  className="t14"
                  style={{ color: "var(--main-color)", fontWeight: 500 }}
                >
                  Deliveries : {noOfDeliveries}
                </span>
              )}

              <span
                className="t14"
                style={{ color: "var(--main-color)", fontWeight: 500 }}
              >
                <span className="cartLable">Free Deliveries :</span> {dish.no_of_free_deliveries}
              </span>
              {dish.preferenceName && (
                <span
                  className="t14"
                  style={{ color: "var(--main-color)", fontWeight: 500 }}
                >
                  Preference : {dish.preferenceName}
                </span>
              )}

              {dish.packages_name && dish.packages_name !== "0" && (
                <span
                  className="t14"
                  style={{ color: "var(--main-color)", fontWeight: 500 }}
                >
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
                <div
                  onClick={handleOpenModal}
                  className="cartButton"
                  style={{ cursor: "pointer" }}
                >
                  Modify
                </div>
              )}
            </div>

            <div className="cartButtonWrap">
              <button className="cartButton"
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
            </div>
          </div>
        </li>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p>{dish.name}</p>
        </div>
      </div>
    </>

  );
};
