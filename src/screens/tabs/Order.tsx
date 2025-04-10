import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { hooks } from '../../hooks';
import { items } from '../../items';
import { Routes } from '../../routes';
import { RootState } from '../../store';
import type { DishType } from '../../types';
import { components } from '../../components';
import { MenuType } from '../../types/MenuType'
import axios from 'axios';
import { notification } from 'antd';

export const Order: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const [opacity, setOpacity] = useState<number>(0);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor('#F6F9F9', '#F6F9F9', dispatch);

  const navigate = hooks.useNavigate();
  const [totalPrice, SetTotalPrice] = useState<any[]>([]);

  const [addressId, SetAddressId]=useState(); 

  // console.log('ccccccccccccccccccccccccccccccc', totalPrice);

  // **************************************************
  const c_id = localStorage.getItem('c_id');
  const cityId = localStorage.getItem('cityId');

  useEffect(() => {
    const getAddToCartData = async () => {
      const formData = new FormData();
      formData.append('city_id', cityId || '');
      formData.append('c_id', c_id || '');
      formData.append('next_id', '0');
      try{
        const response = await axios.post(
          `https://heritage.bizdel.in/app/consumer/services_v11/getCartData`,
          formData
        );

        // console.log('wwwwwwwwwwwwwwwwwwwwwww', response.data); 
      
        SetTotalPrice(response.data.optionListing);
      } catch (error) {
        console.error(error);
      }
    };
    getAddToCartData();
  }, [cityId, c_id]);


  // ******************************************************************************************************************

  useEffect(() => {
    const getAddress = async () => {
      const formData = new FormData();
      formData.append('c_id', c_id || '');
      try{
        const response = await axios.post(
          `https://heritage.bizdel.in/app/consumer/services_v11/getAllAddressById`,
          formData
        );

        // console.log('aaaaaaaaaaaaaaaaaaaa', response.data.addresses[0].id);
        
        SetAddressId(response.data.addresses[0].id);
      } catch (error) {
        console.error(error);
      }
    };
    getAddress();
  }, [c_id]);

  
  const handleCheckout = async () => {
    const formData = new FormData();
    formData.append('c_id', c_id || '');
    formData.append('addresses_id', addressId || '');
    
    try {
      const response = await axios.post(
        `https://heritage.bizdel.in/app/consumer/services_v11/placeOrder`,
        formData
      );
  
      if (response.data.status === 'success') {
        notification.success({ message: response.data.message || 'Order Placed successfully' });
        window.location.reload();
      } else if (response.data.status === 'fail') {
        notification.error({ message: response.data.message || 'Order placement failed' });
      } 
  
    } catch (error) {
      console.error(error);
      notification.error({ message: 'An error occurred while placing your order.' });
    }
  };
  
  useEffect(() => {
    handleCheckout();
  },[]);
  
  // ******************************************************************************************************************

  const { menuLoading, menu } = hooks.useGetMenu();

  const { list, subtotal, delivery, total } = useSelector(
    (state: RootState) => state.cartSlice,
  );
  
  const renderDishes = (): JSX.Element => {
    return (
      <section style={{ marginBottom: 20 }}>
        <ul style={{ paddingTop: 10 }}>
          {totalPrice.map((dish: DishType, index: number, array: DishType[]) => {

            const isLast = index === array.length - 1;
            return (
              <items.OrderItem
                key={dish.id}
                dish={dish}
                isLast={isLast} 
              />
            );
          })}
        </ul>
      </section>
    );
  };
  const renderSummary = (): JSX.Element => {
    return (
      <section
        style={{
          padding: 20,
          borderRadius: 10,
          marginBottom: 20,
          border: '1px solid var(--main-turquoise)',
        }}
      >
        <div
          className='row-center-space-between'
          style={{ marginBottom: 13 }}
        >
          <span
            className='t14'
            style={{ color: 'var(--main-color)', fontWeight: 500 }}
          >
            Subtotal
          </span>
          <span
            className='t14'
            style={{ color: 'var(--main-color)' }}
          >
            ₹{" "}
            {totalPrice.reduce((total, elem) =>{
              return total + elem.quantity * elem.price * elem.no_of_deliveries;
            }, 0).toFixed(2)}
          </span>
        </div>
        <div
          className='row-center-space-between'
          style={{
            paddingBottom: 13,
            marginBottom: 20,
            borderBottom: '1px solid #DBE9F5',
          }}
        >
          <span className='t14'>Delivery</span>
          <span className='t14'>₹{delivery}</span>
        </div>
        <div className='row-center-space-between'>
          <h4>Total</h4>
          <h4>
            ₹{" "}
            {totalPrice.reduce((total, elem) =>{
              return total + elem.quantity * elem.price * elem.no_of_deliveries;
            }, 0).toFixed(2)}
          </h4>
        </div>
      </section>
    );
  };
  const renderButton = (): JSX.Element => {
    return (
      <components.Button
        text='Checkout'

        onClick={handleCheckout}
        // onClick={() => {
        //   // navigate(Routes.Checkout);
        // }}
      />
    );
  };

  const renderContent = (): JSX.Element | null => {
    if (totalPrice.length === 0 && !menuLoading) return null;

    return (
      <main className='container scrollable'>
        {renderDishes()}
        {renderSummary()}
        {renderButton()}
      </main>
    );
  };

  const renderEmpty = (): JSX.Element | null => {
    if (totalPrice.length === 0 && !menuLoading) {
      return (
        <main className='scrollable container'>
          <section
            style={{
              paddingTop: '5%',
              paddingBottom: '14%',
              borderRadius: 10,
              marginTop: 10,
              backgroundColor: 'var(--white-color)',
            }}
          >
            <img
              src='https://george-fx.github.io/dinehub_api/assets/images/02.jpg'
              alt='Empty cart'
              style={{
                width: 'calc(100% - 80px)',
                height: 'auto',
                marginBottom: 20,
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            />
            <h2
              style={{
                textAlign: 'center',
                textTransform: 'capitalize',
                marginBottom: 14,
              }}
            >
              Your cart is empty!
            </h2>
            <p
              className='t16'
              style={{ textAlign: 'center' }}
            >
              Looks like you haven't made <br />
              your order yet.
            </p>
          </section>
        </main>
      );
    }

    return null;
  };

  const renderShopNowButton = (): JSX.Element | null => {
    if (totalPrice.length > 0 || menuLoading) return null;

    return (
      <section style={{ padding: '20px 20px 0 20px ' }}>
        <components.Button
          text='Shop now'
          onClick={() =>
            navigate(Routes.MenuList, { state: { menuName: menu[0].product_cat_id } })
          }
        />
      </section>
    );
  };

  const renderLoading = (): JSX.Element | null => {
    if (menuLoading) return <components.Loader />;
    return null;
  };

  return (
    <div
      id='screen'
      style={{ opacity }}>
      {renderEmpty()}
      {renderContent()}
      {renderLoading()}
      {renderShopNowButton()}
    </div>
  );
};
