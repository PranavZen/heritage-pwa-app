import React, { useEffect, useState } from 'react';
import { hooks } from '../hooks';
import { svg } from '../assets/svg';
import axios from 'axios';
import type { DishType } from '../types';
import { notification, Button, Modal, Input } from 'antd';

type Props = {
  dish: DishType;
  isLast: boolean;
};

export const OrderItem: React.FC<Props> = ({ dish, isLast }) => {
  const navigate = hooks.useNavigate();
  const { removeFromCart } = hooks.useCartHandler();
  const [deliveryPreferenceInModal, setDeliveryPreferenceInModal] = useState<any[]>([]);
  const [deliveriesInModal, setDeliveriesInModal] = useState<any[]>([]);

  // console.log("deliveriesInModaldeliveriesInModal", deliveriesInModal);

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
  console.log('[noOfDeliveries[noOfDeliveries[noOfDeliveries', noOfDeliveries);
  const [selectedPackage, setSelectedPackage] = useState<string>(dish.packages_name || '');
  const [selectedPackageDetails, setSelectedPackageDetails] = useState<string>();
  const [cartData, SetSetCartData] = useState<string>();

  // console.log('zzzzzzzzzzzzzzzz', cartData);

  console.log("dis", dish);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleUpdateCart = async (newQuantity: number) => {
    if (newQuantity < 1) return;
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
        window.location.reload();
      } else {
        notification.error({ message: response.data.message });
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const handleRemoveFromCart = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (quantity > 1) {
      handleUpdateCart(quantity - 1);
    } else {
      try {
        const formData = new FormData();
        formData.append('id', String(dish.cart_id));
        formData.append('c_id', localStorage.getItem('c_id') || '');
        const response = await axios.post('https://heritage.bizdel.in/app/consumer/services_v11/deleteCartItem', formData);
        if (response.data.status === 'success') {
          notification.success({ message: response.data.message });
          window.location.reload();
        } else {
          notification.error({ message: response.data.message });
        }
      } catch (error) {
        console.error('Error removing item from cart:', error);
      }
    }
  };


  // **************************************************************************
  const c_id = localStorage.getItem('c_id');
  const cityId = localStorage.getItem('cityId');

  useEffect(() => {
    const getAddToCartData = async () => {
      const formData = new FormData();
      formData.append('city_id', cityId || '');
      formData.append('c_id', c_id || '');
      formData.append('next_id', '0');
      try {
        const response = await axios.post(
          `https://heritage.bizdel.in/app/consumer/services_v11/getCartData`,
          formData
        );

        console.log('bbbbbbbbb', response.data)
        SetSetCartData(response.data.optionListing.map((elem: any) => elem.no_of_deliveries));
      } catch (error) {
        console.error(error);
      }
    };
    getAddToCartData();
  }, [cityId, c_id]);

  // *************************************************************************************
  const handleOpenModal = (option_name:any) => {
// console.log("aaaacccccccccccccccccccc", option_name)
    // setIsModalOpen(true);
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

  const handlePackageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setNoOfDeliveries(Number(selectedValue));
  };


  // ********************************************************************************************************

  return (
    <>
      <li
        style={{
          backgroundColor: 'var(--white-color)',
          borderRadius: 10,
          paddingLeft: 12,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          marginBottom: isLast ? 0 : 14,
          position: 'relative',
        }}
      >
        <img
          src={dish.option_value_image}
          alt={dish.name}
          style={{ width: 87, height: 'auto', marginRight: 14 }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginRight: 'auto',
            height: '100%',
            justifyContent: 'center',
            gap: 3,
          }}
        >
          <span className="t14">{dish.name}</span>
          <span className="t10" style={{ marginBottom: 5 }}>
            {dish.kcal} kcal - {dish.weight}g
          </span>
          <span className="t14" style={{ color: 'var(--main-color)', fontWeight: 500 }}>
            ₹ {dish.price}
          </span>
          <span className="t14" style={{ color: 'var(--main-color)', fontWeight: 500 }}>
            Starts on : {dish.cart_order_date}
          </span>
          <span className="t14" style={{ color: 'var(--main-color)', fontWeight: 500 }}>
            Qty : {quantity}
          </span>

          {/* Conditionally render the "Deliveries" field */}
          {noOfDeliveries > 0 && (
            <span className="t14" style={{ color: 'var(--main-color)', fontWeight: 500 }}>
              Deliveries : {noOfDeliveries}
            </span>
          )}

          {/* Conditionally render the "Preference" field */}
          {dish.preferenceName && (
            <span className="t14" style={{ color: 'var(--main-color)', fontWeight: 500 }}>
              Preference : {dish.preferenceName}
            </span>
          )}

          {/* Conditionally render the "Package" field if packages_name is not "0" */}
          {dish.packages_name && dish.packages_name !== '0' && (
            <span className="t14" style={{ color: 'var(--main-color)', fontWeight: 500 }}>
              Package : {dish.packages_name}
            </span>
          )}
        </div>


        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {noOfDeliveries > 0 && (
            <Button onClick={() => handleOpenModal(dish.option_name)}>Modify</Button>
          )}

          {/* Remove (Decrease Quantity) */}
          <button
            style={{ padding: '14px 14px 4px 14px', borderRadius: 4 }}
            onClick={handleRemoveFromCart}
          >
            <svg.RemoveSvg />
          </button>

          {/* Display updated quantity */}
          <span className="t12" style={{ lineHeight: 1 }}>
            {quantity}
          </span>

          {/* Add to cart (Increase Quantity) */}
          <button
            style={{ padding: '4px 14px 14px 14px', borderRadius: 4 }}
            onClick={() => handleUpdateCart(quantity + 1)}
          >
            <svg.AddSvg />
          </button>
        </div>
      </li>
      {/* Update data modal */}
      {/* <Modal title="Update Order" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <label>Quantity:</label>
        <Input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
        <br />
        <br />
        <label>Delivery Preference:</label>
        <select value={deliveryPreference} onChange={(e) => setDeliveryPreference(e.target.value)}>
          {deliveryPreferenceInModal.length > 0 &&
            deliveryPreferenceInModal.map((elem: any, index: number) => (
              <optgroup key={index} label={elem.someGroupLabel}>
                {elem.deliveryPreference.map((ele: any, subIndex: number) => (
                  <option key={subIndex} value={ele.id}>
                    {ele.name}
                  </option>
                ))}
              </optgroup>
            ))}
        </select>

        <br />
        <br />
        <label>No. of Deliveries:</label>

        <div>
          <select
            value={noOfDeliveries}
            onChange={handlePackageChange}
          >
            {deliveriesInModal.map((pkg: any) => (
              <optgroup key={pkg.package_id} label={pkg.product_name}>
                {pkg.packages.map((packageDetails: any) => {
                  const deliveryArray = packageDetails.no_of_deliveries.split(",");

                  if (selectedPackage === "Daily" && packageDetails.package_name === "Daily") {
                    return deliveryArray.map((delivery: string, index: number) => (
                      <option key={index} value={delivery}>
                        {delivery}
                      </option>
                    ));
                  }
                  return null;
                })}
              </optgroup>
            ))}
          </select>
        </div>
      </Modal> */}
    </>
  );
};
