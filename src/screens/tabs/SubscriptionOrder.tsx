import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SubscriptionOrder.css';
import { components } from '../../components';
import { hooks } from '../../hooks';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { TabScreens } from '../../routes';
import { notification } from 'antd';

export const SubscriptionOrder: React.FC = () => {
  const currentTabScreen = useSelector(
    (state: RootState) => state.tabSlice.screen,
  );
  const { menuLoading, menu } = hooks.useGetMenu();
  const { dishesLoading, dishes } = hooks.useGetDishes();
  const { reviewsLoading, reviews } = hooks.useGetReviews();
  const { carouselLoading, carousel } = hooks.useGetCarousel();
  const { menuLoadingBanner, banner } = hooks.useGetMenu();

  const loading: boolean = menuLoading || dishesLoading || reviewsLoading || carouselLoading;

  const [subscriptionData, setSubscriptionData] = useState<any[]>([]); // Initialize as empty array
  const [oneTimeOrderData, setOneTimeOrderData] = useState<any[]>([]); // Initialize as empty array
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionID, SetSubscriptionID] = useState<number | null>(null);

  const [opacity, setOpacity] = useState<number>(0);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);

  const handleSubscriptionID = (subscription_id: any) => {
    SetSubscriptionID(subscription_id);
  };

  const c_id = localStorage.getItem('c_id');

  const fetchSubscriptionData = () => {
    const formData = new FormData();
    formData.append('c_id', c_id || '');
    formData.append('next_id', '0');
    setIsLoading(true);

    axios
      .post('https://heritage.bizdel.in/app/consumer/services_v11/subscriptionListing', formData)
      .then((response) => {
        setSubscriptionData(response.data.subscriptionListing);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching subscription data', error);
        setIsLoading(false);
      });
  };

  const fetchOneTimeOrderData = () => {
    const formData = new FormData();
    formData.append('c_id', c_id || ''); 
    formData.append('next_id', '0');
    setIsLoading(true);

    axios
      .post('https://heritage.bizdel.in/app/consumer/services_v11/oneTimeOrderList', formData)
      .then((response) => {
        setOneTimeOrderData(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching one-time order data', error);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchSubscriptionData();
    fetchOneTimeOrderData();
  }, []); 

  useEffect(() => {
    if (subscriptionID !== null) {
      const subscription = async () => {
        const formData = new FormData();
        formData.append('c_id', c_id || '');
        formData.append('subscription_id', String(subscriptionID));
        formData.append('addresses_id', '93459'); 

        try {
          const response = await axios.post('https://heritage.bizdel.in/app/consumer/services_v11/addRenewOrder', formData);

          if(response.data.status === 'success'){
            notification.success({message: response.data.message});
          }
        } catch (error) {
          console.log('Error while renewing order:', error);
        }
      };

      subscription();
    }
  }, [subscriptionID]); 

  const renderContent = (): JSX.Element => {
    if (loading || isLoading) return <components.Loader />;

    return (
      <main className="scrollable">
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'subscriptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscriptions')}
          >
            Subscriptions
          </button>
          <button
            className={`tab-button ${activeTab === 'one-time-orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('one-time-orders')}
          >
            One-Time Orders
          </button>
        </div>

        {activeTab === 'subscriptions' && (
          <div className="card-container">
            <h2>Subscription Orders</h2>
            <div className="scrollable-container">
              <div className="card-list">
                {Array.isArray(subscriptionData) && subscriptionData.length > 0 ? (
                  subscriptionData.map((subscription) => (
                    <div key={subscription.subscription_id} className="card">
                      <img
                        src={subscription.image}
                        alt={subscription.product_name}
                        className="card-img"
                      />
                      <div className="card-info">
                        <h3>{subscription.product_name}</h3>
                        <p>Option: {subscription.option_value}</p>
                        <p>Package: {subscription.package_name}</p>
                        <p>Price: ₹{subscription.price}</p>
                        <p>Status: {subscription.status}</p>
                        <p>Balance Amount : ₹ {subscription.price}</p>
                        <p>Next Delivery:- {subscription.nextDeliveryDate || ''}</p>
                        <p>Last Delivered:- {subscription.lastDeliveryDate || ''}</p>
                        <p>Start Date:- {subscription.start_date || ''}</p>
                        <p>End Date:- {subscription.end_date || ''}</p>
                        <button
                          onClick={() => handleSubscriptionID(subscription.subscription_id)}
                          className="btn"
                        >
                          Renew
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No subscriptions found.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'one-time-orders' && (
          <div className="card-container">
            <h2>One-Time Orders</h2>
            <div className="scrollable-container">
              <div className="card-list">
                {Array.isArray(oneTimeOrderData) && oneTimeOrderData.length > 0 ? (
                  oneTimeOrderData.map((order) => (
                    <div key={order.order_id} className="card">
                      <h3>{order.product_name}</h3>
                      <p>Quantity: {order.quantity}</p>
                      <p>Price: ₹{order.price}</p>
                      <p>Status: {order.status}</p>
                      <button className="btn">Manage Order</button>
                    </div>
                  ))
                ) : (
                  <p>No one-time orders found.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    );
  };

  return (
    <div id="screen" style={{ opacity }}>
      {renderContent()}
    </div>
  );
};
