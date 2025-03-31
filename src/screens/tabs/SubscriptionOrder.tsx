import React, { useState, useEffect } from "react";
import axios from "axios";
import "./SubscriptionOrder.css";
import { components } from "../../components";
import { hooks } from "../../hooks";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { TabScreens } from "../../routes";
import { notification, Switch } from "antd";
import { Modal, Radio, Button, DatePicker } from 'antd';

import moment from 'moment';

export const SubscriptionOrder: React.FC = () => {
  const currentTabScreen = useSelector(
    (state: RootState) => state.tabSlice.screen
  );
  const { menuLoading, menu } = hooks.useGetMenu();
  const { dishesLoading, dishes } = hooks.useGetDishes();
  const { reviewsLoading, reviews } = hooks.useGetReviews();
  const { carouselLoading, carousel } = hooks.useGetCarousel();
  const { menuLoadingBanner, banner } = hooks.useGetMenu();

  const loading: boolean =
    menuLoading || dishesLoading || reviewsLoading || carouselLoading;

  const [subscriptionData, setSubscriptionData] = useState<any[]>([]);
  const [oneTimeOrderData, setOneTimeOrderData] = useState<any[]>([]);
  // console.log("oneTimeOrderDataoneTimeOrderData", oneTimeOrderData);
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionID, SetSubscriptionID] = useState<number | null>(null);

  interface Subscription {
    subscription_id: number;
    product_name: string;
    option_value: string;
    delivery_opt: string;
    package_days: string;
  }


  const [subscription, SetSubscription] = useState<Subscription | null>(null);
  // console.log("subscriptionID", subscriptionID);

  const [disabled, setDisabled] = useState(true);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [isModalVisiblePause, setIsModalVisiblePause] = useState(false);
  const [pauseDate, setPauseDate] = useState(null);

  console.log('lllssssssssssss', pauseDate);
  
  const [resumeDate, setResumeDate] = useState(null);

  interface orderToDelete {
    order_id: string;
    order_status_id: string;
    payment_method: string;
  }
  const [orderToDelete, setOrderToDelete] = useState<orderToDelete | null>(null);

  // console.log("xxxxxxxxxxxxxxxxxxxxxx", orderToDelete)

  interface CancelReason {
    id: number;
    reason: string;
  }
  const [cancelReasons, setCancelReasons] = useState<CancelReason[]>([]);

  // *************************One time order**************************
  useEffect(() => {
    axios
      .post("https://heritage.bizdel.in/app/consumer/services_v11/get_order_cancel_reason")
      .then((response) => {
        // console.log('mmmmm', response);
        setCancelReasons(response.data.order_cancel_reason);
      })
      .catch((error) => {
        console.error("Error fetching cancel reasons:", error);
      });
  }, []);

  const handleDeleteClick = (order: any) => {
    // console.log("orderhello", order);
    setOrderToDelete(order);
    setIsModalVisible(true);
  };

  const handleReasonChange = (e: any) => {
    setSelectedReason(e.target.value);
  };

  // Confirm deletion
  const handleConfirmDelete = () => {
    if (selectedReason && orderToDelete) {
      const formData = new FormData();
      formData.append("c_id", localStorage.getItem('c_id') || '');
      formData.append("order_option_id", orderToDelete.order_id);
      formData.append("order_status_id", orderToDelete.order_status_id
      );
      formData.append("cancel_reason_id", String(selectedReason));
      formData.append("comment", "");
      formData.append("payment_method", orderToDelete.payment_method
      );

      axios
        .post("https://heritage.bizdel.in/app/consumer/services_v11/oneTimeOrderCancel", formData)
        .then((response) => {
          if (response.data.status === 'success') {
            notification.success({ message: response.data.message })
            fetchOneTimeOrderData();
          } else {
            notification.error({ message: response.data.message })
          }
          setIsModalVisible(false);

        })
        .catch((error) => {
          console.error("Error cancelling order:", error);
        });
    } else {
      alert("Please select a cancellation reason");
    }
  };


  const handleCancelModal = () => {
    setIsModalVisible(false);
  };


  // *************************One time order**************************************

  const toggle = (subscription: Subscription) => (checked: boolean) => {
    if (!checked) {
      setIsModalVisiblePause(false);
    } else {
      setIsModalVisiblePause(true);
      SetSubscription(subscription);
    }
  };


  const handleCancel = () => {
    setPauseDate(null);
    setResumeDate(null);
    setIsModalVisiblePause(false);
  };

  const handleOk = async () => {
   
    if (!pauseDate || !resumeDate) {
      notification.error({ message: 'Please select both pause and resume dates.' });
      return;
    }

    
    const currentDate = moment().startOf('day');

    const selectedPauseDate = moment(pauseDate).startOf('day');
    if (selectedPauseDate.isBefore(currentDate)) {
      notification.error({ message: 'Subscription pause date must be greater than the current date.' });
      return;
    }

    const formData = new FormData();
    formData.append('c_id', String(localStorage.getItem('c_id')));
    formData.append('usertype', 'user');
    formData.append('subscription_id', String(subscription?.subscription_id));
    formData.append('product_name', subscription?.product_name || '');
    formData.append('option_value', subscription?.option_value || '');
    formData.append('delivery_opt', subscription?.delivery_opt || '');
    formData.append('package_days', subscription?.package_days || '');
    formData.append('subscription_pause_date', '2025-03-29');
    formData.append('subscription_resume_date', '2025-03-31');
    formData.append('status', '3');
    formData.append('extra_quantity', '0');
    formData.append('declined_quantity', '0');
    formData.append('default_quantity', '1');
    formData.append('quantity', '1');

    try {
      const response = await axios.post(
        'https://heritage.bizdel.in/app/consumer/services_v11/subscriptionPauseResume',
        formData
      );

      console.log("qqqqqq", response.data);

      if (response.data.status === "success") {
        notification.success({ message: response.data.message});
        setIsModalVisiblePause(false); 
      } else if(response.data.status === "fail"){
        notification.error({ message: response.data.message });
      }
    } catch (error){
      notification.error({ message: 'Error occurred while pausing subscription.' });
    }
  };
  const [opacity, setOpacity] = useState<number>(0);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);

  const handleSubscriptionID = (subscription_id: any) => {
    SetSubscriptionID(subscription_id);
  };

  const c_id = localStorage.getItem("c_id");

  const fetchSubscriptionData = () => {
    const formData = new FormData();
    formData.append("c_id", c_id || "");
    formData.append("next_id", "0");
    setIsLoading(true);

    axios
      .post(
        "https://heritage.bizdel.in/app/consumer/services_v11/subscriptionListing",
        formData
      )
      .then((response) => {

        setSubscriptionData(response.data.subscriptionListing);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching subscription data", error);
        setIsLoading(false);
      });
  };

  const fetchOneTimeOrderData = () => {
    const formData = new FormData();
    formData.append("c_id", c_id || "");
    formData.append("next_id", "0");
    setIsLoading(true);

    axios
      .post(
        "https://heritage.bizdel.in/app/consumer/services_v11/oneTimeOrderList",
        formData
      )
      .then((response) => {
        setOneTimeOrderData(response.data.ordersListing);
        setIsLoading(false);

        // console.log("kkkkkkkkkkkkkkkkkkk", response);
      })
      .catch((error) => {
        console.error("Error fetching one-time order data", error);
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
        formData.append("c_id", c_id || "");
        formData.append("subscription_id", String(subscriptionID));
        formData.append("addresses_id", String(localStorage.getItem('area_id') || ''));


        try {
          const response = await axios.post(
            "https://heritage.bizdel.in/app/consumer/services_v11/addRenewOrder",
            formData
          );
          //  console.log("subscriptionIDsubscriptionID", response);
          if (response.data.status === "success") {
            notification.success({ message: response.data.message });
          } else {
            notification.error({ message: response.data.message });
          }
        } catch (error) {
          // console.log("Error while renewing order:", error);
        }
      };
      subscription();
    }
  }, [subscriptionID]);

  const renderContent = (): JSX.Element => {
    if (loading || isLoading) return <components.Loader />;

    return (
      <main className="scrollable ordersScreenWrapper">
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === "subscriptions" ? "active" : ""
              }`}
            onClick={() => setActiveTab("subscriptions")}
          >
            Subscriptions
          </button>
          <button
            className={`tab-button ${activeTab === "one-time-orders" ? "active" : ""
              }`}
            onClick={() => setActiveTab("one-time-orders")}
          >
            One-Time Orders
          </button>
        </div>
        {activeTab === "subscriptions" && (
          <div className="ordersContainer">
            <h2>Subscription Orders</h2>
            <div className="scrollable-container">
              <div className="card-list">
                {Array.isArray(subscriptionData) &&
                  subscriptionData.length > 0 ? (
                  subscriptionData.map((subscription) => (
                    <div key={subscription.subscription_id} className="card">
                      <div className="topCardDataWrap">
                        <div className="orderImagWrap">
                          <img
                            src={subscription.image}
                            alt={subscription.product_name}
                            className="card-img"
                          />
                        </div>
                        <div className="card-info">
                          <h3 className="orderItmName">
                            {subscription.product_name}
                          </h3>
                          <p className="orderItmWieght">
                            {subscription.weight} {subscription.weight_unit}
                          </p>
                          <p className="orderQuantity">
                            Pack: {subscription.quantity} Per day (
                            {subscription.package_name})
                          </p>
                          <p className="orderLD">
                            Last Delivered:{" "}
                            {subscription.lastDeliveryDate || "-"}
                          </p>
                          <p className="orderPrice">
                            <small>MRP</small> ₹{subscription.price}{" "}
                            <span>per pack</span>
                          </p>
                          <p className="orderBalAmt">
                            Balance Amount : ₹ {subscription.price}
                          </p>
                        </div>
                      </div>
                      <div className="dataWraps">
                        <div className="wrap">
                          <p>Delivered</p>
                          <span>
                            {subscription.totalDeliveredOrder +
                              "/" +
                              subscription.totalDeliveries}
                          </span>
                        </div>
                        <div className="wrap">
                          <p>Next Delivery</p>
                          <span>{subscription.nextDeliveryDate || "-"}</span>
                        </div>
                      </div>
                      <div className="orderDateWrap">
                        <div className="orderDateLeftBox box50">
                          <div className="svgWrap">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width={24}
                              height={24}
                            >
                              <path d="M19,2h-1V1c0-.552-.447-1-1-1s-1,.448-1,1v1H8V1c0-.552-.447-1-1-1s-1,.448-1,1v1h-1C2.243,2,0,4.243,0,7v12c0,2.757,2.243,5,5,5h14c2.757,0,5-2.243,5-5V7c0-2.757-2.243-5-5-5ZM5,4h14c1.654,0,3,1.346,3,3v1H2v-1c0-1.654,1.346-3,3-3Zm14,18H5c-1.654,0-3-1.346-3-3V10H22v9c0,1.654-1.346,3-3,3Zm0-8c0,.552-.447,1-1,1H6c-.553,0-1-.448-1-1s.447-1,1-1h12c.553,0,1,.448,1,1Zm-7,4c0,.552-.447,1-1,1H6c-.553,0-1-.448-1-1s.447-1,1-1h5c.553,0,1,.448,1,1Z" />
                            </svg>
                          </div>
                          <div className="innerBox">
                            {" "}
                            <p>Start Date</p>
                            <span>{subscription.start_date || "-"}</span>
                          </div>
                        </div>
                        <div className="orderDateRightBox box50">
                          <div className="svgWrap">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width={24}
                              height={24}
                            >
                              <path d="M19,2h-1V1c0-.552-.447-1-1-1s-1,.448-1,1v1H8V1c0-.552-.447-1-1-1s-1,.448-1,1v1h-1C2.243,2,0,4.243,0,7v12c0,2.757,2.243,5,5,5h14c2.757,0,5-2.243,5-5V7c0-2.757-2.243-5-5-5ZM5,4h14c1.654,0,3,1.346,3,3v1H2v-1c0-1.654,1.346-3,3-3Zm14,18H5c-1.654,0-3-1.346-3-3V10H22v9c0,1.654-1.346,3-3,3Zm0-8c0,.552-.447,1-1,1H6c-.553,0-1-.448-1-1s.447-1,1-1h12c.553,0,1,.448,1,1Zm-7,4c0,.552-.447,1-1,1H6c-.553,0-1-.448-1-1s.447-1,1-1h5c.553,0,1,.448,1,1Z" />
                            </svg>
                          </div>
                          <div className="innerBox">
                            <p>Delivery End Date </p>
                            <span>{subscription.end_date || "-"}</span>
                          </div>
                        </div>
                      </div>
                      <span className="subExpiredText">
                        Subscription Expired
                      </span>


                      <div className="orderBtnsWraps">
                        {/* <button className="btn">Pause Delivery</button> */}
                        <Switch
                          onClick={toggle(subscription)}
                        />

                        <button className="btn">Modify</button>
                        <button
                          onClick={() =>
                            handleSubscriptionID(subscription.subscription_id)
                          }
                          className="btn"
                        >
                          Renew
                        </button>
                      </div>
                      <div className="subscription_idWrap">
                        <p>Subscription Id: #{subscription.subscription_id}</p>
                      </div>
                      <div
                        className="statusWrap"
                        style={{
                          backgroundColor:
                            subscription.status === "Active" ? "green" : "red",
                        }}
                      >
                        <span>{subscription.status}</span>
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




        <Modal
          title="Pause Subscription"
          visible={isModalVisiblePause}
          onOk={handleOk}
          onCancel={handleCancel}
          confirmLoading={loading}
          cancelText="Cancel"
          okText="Pause Subscription"
        >
          <p>Are you sure you want to pause the subscription?</p>

          <div>
            <label>Pause Date:</label>
            <DatePicker
              value={pauseDate}
              onChange={(date) => setPauseDate(date)}
              format="YYYY-MM-DD"
            // disabledDate={(current) => current && current.isBefore(moment().startOf('day'))}
            />
          </div>

          <div style={{ marginTop: '10px' }}>
            <label>Resume Date:</label>
            <DatePicker
              value={resumeDate}
              onChange={(date) => setResumeDate(date)}
              format="YYYY-MM-DD"
            // disabledDate={(current) => current && current.isBefore(moment().startOf('day'))}
            />
          </div>
        </Modal>

        {/* ************************************************One time Order******************************************* */}


        {/* <h2>One-Time Orders</h2>
          <div className="scrollable-container">
            <div className="card-list">
              {Array.isArray(oneTimeOrderData) && oneTimeOrderData.length > 0 ? (
                oneTimeOrderData.map((order) => (
                  <div key={order.order_id} className="card">
                    <div>
                      <img src={order.image} alt="" width={100} height={100} />
                    </div>
                    <p>Order ID #{order.order_id}</p>
                    <p>Order date #{order.delivery_date}</p>
                    <h3>Product: {order.product_name}</h3>
                    <p>Quantity: {order.quantity}</p>
                    <p>Price: ₹{order.price}</p>
                    <p>{order.status_name}</p>
                    <p>Subtotal ₹{order.price}</p>
                    <p>Total ₹{order.price}</p>
                    <Button onClick={() => handleDeleteClick(order)}>
                      Delete Order
                    </Button>
                  </div>
                ))
              ) : (
                <p>No one-time orders found.</p>
              )}
            </div>
          </div> */}

        {activeTab === "one-time-orders" && (
          <div className="card-container">
            <h2>One-Time Orders</h2>
            <div className="scrollable-container">
              <div className="card-list">
                {Array.isArray(oneTimeOrderData) &&
                  oneTimeOrderData.length > 0 ? (
                  oneTimeOrderData.map((order) => (
                    <div key={order.order_id} className="card">
                      <div>
                        <img src={order.image} alt="" width={100} height={100} />
                      </div>
                      <p>Order ID #{order.order_id}</p>
                      <p>Order date #{order.delivery_date}</p>
                      <h3> Product:{order.product_name}</h3>
                      <p>Quantity: {order.quantity}</p>
                      <p>Price: ₹{order.price}</p>
                      <p>{order.status_name}</p>
                      <p> Subtotal ₹{order.price}</p>
                      <p> Total ₹{order.price}</p>
                      <Button onClick={() => handleDeleteClick(order)}>
                        Delete Order
                      </Button>
                    </div>
                  ))
                ) : (
                  <p>No one-time orders found.</p>
                )}
              </div>
            </div>
          </div>
        )}


        {/* Delete Confirmation Modal */}
        <Modal
          title="Cancel Order"
          visible={isModalVisible}
          onOk={handleConfirmDelete}
          onCancel={handleCancelModal}
          okText="Confirm"
          cancelText="Cancel"
        >
          <p>Select a reason to cancel the order:</p>
          <Radio.Group onChange={handleReasonChange} value={selectedReason}>
            {cancelReasons.map((reason) => (
              <Radio key={reason?.id} value={reason?.id}>
                {reason?.reason}
              </Radio>
            ))}
          </Radio.Group>
        </Modal>
      </main>
    );
  };

  return (
    <div id="screen" style={{ opacity }}>
      {renderContent()}
    </div>
  );
};
