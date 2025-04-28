import React, { useState, useEffect } from "react";
import axios from "axios";

import "./SubscriptionOrder.scss";

import { components } from "../../components";
import { hooks } from "../../hooks";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { TabScreens } from "../../routes";
import { notification, Switch } from "antd";
import { Modal, Radio, Button, DatePicker } from 'antd';
import moment from 'moment';
import { Routes, useNavigate } from 'react-router-dom';


export const SubscriptionOrderCheck: React.FC = () => {
    const navigate = useNavigate();
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


    // console.log("aaaaaaaaaaaaaaaaaaaa", subscriptionData);


    const [oneTimeOrderData, setOneTimeOrderData] = useState<any[]>([]);

    // console.log("oneTimeOrderDataoneTimeOrderData", oneTimeOrderData);

    const [activeTab, setActiveTab] = useState('subscriptions');
    const [isLoading, setIsLoading] = useState(false);

    const [subscriptionID, SetSubscriptionID] = useState<any[]>([]);

    // console.log("subscriptionIDwwwwwwwwwwwwwwwwwww", subscriptionID);

    const [pauseToggle, SetPauseToggle] = useState<{ [key: number]: boolean }>({});
    const [currentSubscription, setCurrentSubscription] = useState<any>(null);

    // console.log("currentSubscriptioncurrentSubscription", currentSubscription);


    // console.log("qqqqqq", pauseToggle);

    interface Subscription {
        subscription_id: number;
        product_name: string;
        option_value: string;
        delivery_opt: string;
        package_days: string;
        resumeDate: string;
    }

    const [subscription, SetSubscription] = useState<Subscription | null>(null);

    // console.log("subscription1111111111111111111111", subscription);

    const [disabled, setDisabled] = useState(true);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedReason, setSelectedReason] = useState(null);

    // console.log("selectedReason", selectedReason);

    const [isModalVisiblePause, setIsModalVisiblePause] = useState(false);

    const [pauseDate, setPauseDate] = useState<string | null>(null);

    // console.log("pauseeeeq", pauseDate);
    const [resumeDate, setResumeDate] = useState<string | null>(null);

    // console.log("resumeDate", resumeDate);

    interface orderToDelete {
        order_id: string;
        order_status_id: string;
        payment_method: string;
        order_option_id: string;
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
            formData.append("order_option_id", orderToDelete.order_option_id);
            formData.append("order_status_id", orderToDelete.order_status_id
            );
            formData.append("cancel_reason_id", String(selectedReason));
            // formData.append("comment", "ffffffffffff");
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


    const handlePauseConfirm = () => {
        if (!pauseDate) {
            notification.error({ message: 'Please select a pause date.' });
            return;
        }
        // Handle the pause logic (API call, etc.)
        const formData = new FormData();
        formData.append('c_id', String(localStorage.getItem('c_id')));
        formData.append('usertype', 'user');
        formData.append('subscription_id', String(subscription?.subscription_id));
        formData.append('product_name', subscription?.product_name || '');
        formData.append('option_value', subscription?.option_value || '');
        formData.append('delivery_opt', subscription?.delivery_opt || '');
        formData.append('package_days', subscription?.package_days || '');
        formData.append('subscription_pause_date', String(pauseDate));
        formData.append('status', '3');
        formData.append('quantity', '1');

        // Example API call
        axios.post('https://heritage.bizdel.in/app/consumer/services_v11/subscriptionPauseResume', formData)
            .then((response) => {
                if (response.data.status === "success") {
                    notification.success({ message: 'Subscription paused successfully!' });
                    setIsModalVisiblePause(false);
                } else {
                    notification.error({ message: response.data.message });
                }
            })
            .catch((error) => {
                notification.error({ message: 'Error occurred while pausing the subscription.' });
            });
    };

    // const handlePauseCancel = () => {
    //   setIsModalVisiblePause(false);  // Hide modal if canceled
    // };


    const handleResumeConfirm = () => {
        // setLoading(true);
        const formData = new FormData();
        formData.append('c_id', String(localStorage.getItem('c_id')));
        formData.append('usertype', 'user');
        formData.append('subscription_id', String(subscription?.subscription_id));
        formData.append('product_name', subscription?.product_name || '');
        formData.append('option_value', subscription?.option_value || '');
        formData.append('delivery_opt', subscription?.delivery_opt || '');
        formData.append('package_days', subscription?.package_days || '');
        formData.append('subscription_pause_date', pauseDate!);
        formData.append('subscription_resume_date', subscription?.resumeDate || '');
        formData.append('status', '2');
        formData.append('extra_quantity', '0');
        formData.append('declined_quantity', '0');
        formData.append('default_quantity', '1');
        formData.append('quantity', '1');

        axios
            .post("https://heritage.bizdel.in/app/consumer/services_v11/subscriptionPauseResume", formData)
            .then((response) => {
                // console.log("nnnnnnnnnnnn", response);
                if (response.data.status === "success") {

                    notification.success({ message: "Subscription resumed successfully!" });
                    setIsModalVisibleResume(false);
                    window.location.reload();
                } else {
                    notification.error({ message: response.data.message });
                }
            })
            .catch((error) => {
                // setLoading(false);
                notification.error({ message: "Error occurred while resuming the subscription." });
            });
    };

    const [isModalVisibleResume, setIsModalVisibleResume] = useState(false);
    // *************************One time order**************************************

    const toggle = (subscription: any) => (checked: boolean) => {

        // console.log("subscriptionsubscriptionsubscription", subscription);

        if (checked) {
            if (subscription.status === "Active") {
                setCurrentSubscription(subscription);
                SetSubscription(subscription);
                setIsModalVisiblePause(true);
            }
        } else {
            if (subscription.status === "Paused") {
                const resumeDate = moment().add(1, 'day').format('YYYY-MM-DD');
                setPauseDate(resumeDate);
                setCurrentSubscription(subscription);
                SetSubscription(subscription)
                setIsModalVisibleResume(true);
            } else if (String(subscription.status) === "Active") {
                setCurrentSubscription(subscription);
                SetSubscription(subscription);
                setIsModalVisiblePause(true);
            }
        }

        SetPauseToggle(prevState => ({
            ...prevState,
            [subscription.subscription_id]: checked,
        }));
    };

    const handlePauseCancel = () => {
        setIsModalVisiblePause(false);
        if (currentSubscription) {
            SetPauseToggle(prevState => ({
                ...prevState,
                [currentSubscription.subscription_id]: false,
            }));
        }
    };

    const handleResumeCancel = () => {
        setIsModalVisibleResume(false);
        window.location.reload();
        if (currentSubscription) {
            SetPauseToggle(prevState => ({
                ...prevState,
                [currentSubscription.subscription_id]: false,
            }));
        }
    };

    // const handlePauseCancel = () => {
    //   setIsModalVisiblePause(false);
    // };

    // Handle cancel for the resume modal
    // const handleResumeCancel = () => {
    //   setIsModalVisibleResume(false);
    // };

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
        formData.append('subscription_pause_date', pauseDate);
        formData.append('subscription_resume_date', resumeDate);
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

            // console.log("qqqqqqqqqqqqq11111111", response.data)

            if (response.data.status === "success") {

                notification.success({ message: response.data.subscription_resume_note });
                setIsModalVisiblePause(false);
                window.location.reload();
            } else if (response.data.status === "fail") {
                notification.error({ message: response.data.message });
            }
        } catch (error) {
            notification.error({ message: 'Error occurred while pausing subscription.' });
        }
    };



    const [opacity, setOpacity] = useState<number>(0);

    hooks.useScrollToTop();
    hooks.useOpacity(setOpacity);
    const handleSubscriptionID = (subscription_id: string) => {
        // console.log("subscription_id string:", subscription_id);

        const uniqueSubscriptionIDs = Array.from(new Set(subscription_id.split(',').map(id => id.trim())));

        // console.log("Unique subscription ID:", uniqueSubscriptionIDs);

        if (uniqueSubscriptionIDs.length > 0) {
            SetSubscriptionID((prevSubscriptionIDs) => [
                ...prevSubscriptionIDs,
                uniqueSubscriptionIDs[0],
            ]);
        }
    };


    const c_id = localStorage.getItem("c_id");

    useEffect(() => {
        fetchSubscriptionData();
    }, []);

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
                // console.log("waaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", response);
                if (response.data.subscriptionListing && Array.isArray(response.data.subscriptionListing)) {
                    setSubscriptionData(response.data.subscriptionListing);

                    const initialPauseToggle: { [key: number]: boolean } = response.data.subscriptionListing.reduce((acc: any, curr: any) => {
                        acc[curr.subscription_id] = curr.status === 'Paused';
                        return acc;
                    }, {});

                    SetPauseToggle(initialPauseToggle);
                } else {
                    console.error("Invalid subscriptionListing data structure");
                }
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
        if (Array.isArray(subscriptionID) && subscriptionID.length !== 0) {

            Modal.confirm({
                title: 'Are you sure you want to resubscribe to this subscription?',
                onOk: async () => {
                    const formData = new FormData();
                    formData.append("c_id", c_id || "");
                    formData.append("subscription_id", String(subscriptionID));
                    formData.append("addresses_id", String(localStorage.getItem('area_id') || ''));

                    try {
                        const response = await axios.post(
                            "https://heritage.bizdel.in/app/consumer/services_v11/addRenewOrder",
                            formData
                        );

                        if (response.data.status === "success") {
                            notification.success({ message: response.data.message });
                            navigate(`/dish/${subscriptionData[0].option_name}`, { state: { subscriptionData } });
                        } else {
                            notification.error({ message: response.data.message });
                        }
                    } catch (error) {
                        console.error("Error while renewing order:", error);
                    }
                },
                onCancel() {
                    // Handle cancel (optional)
                }
            });
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
                                                        Pack: {subscription.quantity} Per day
                                                        ({subscription.package_name})
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
                                                        Total Amount : ₹ {(subscription.price * subscription.quantity).toLocaleString("en-IN")}
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
                                            {/* <span className="subExpiredText">
                        Subscription Expired
                      </span> */}


                                            <div className="orderBtnsWraps">
                                                {/* <button className="btn">Pause Delivery</button> */}

                                                {
                                                    subscription.status === 'Payment pending' ? <> <Switch
                                                        checked={pauseToggle[subscription.subscription_id] || false}
                                                        onClick={toggle(subscription)}
                                                        disabled
                                                    /> </> : <> <Switch
                                                        checked={pauseToggle[subscription.subscription_id] || false}
                                                        onClick={toggle(subscription)}
                                                    /></>
                                                }

                                                {/* <button
                                                    onClick={() => navigate('/subscription-modify', { state: { subscription: subscription } })}
                                                    className="btn"
                                                >
                                                    Modify
                                                </button> */}

                                                {
                                                    subscription.status === 'expire' ? <>  <button
                                                        disabled
                                                        onClick={() =>
                                                            handleSubscriptionID(subscription.subscription_id)
                                                        }

                                                        className="btn"
                                                    >
                                                        Renew
                                                    </button>
                                                    </> :
                                                        <>

                                                        </>
                                                }
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
                    open={isModalVisiblePause}
                    onOk={handleOk || handlePauseConfirm}
                    onCancel={handlePauseCancel}
                    confirmLoading={loading}
                    okText="Pause Subscription"
                    cancelText="Cancel"
                >
                    <p>Are you sure you want to pause the subscription?</p>

                    <div>
                        <label>Pause Date:</label>
                        <DatePicker
                            value={pauseDate ? moment(pauseDate) : null}
                            onChange={(date) => setPauseDate(date ? date.format('YYYY-MM-DD') : '')}
                            format="YYYY-MM-DD"
                            disabledDate={(current) => current && current < moment().add(1, 'days').startOf('day')}
                        />
                    </div>

                    <div style={{ marginTop: '10px' }}>
                        <label>Resume Date:</label>
                        <DatePicker
                            value={resumeDate ? moment(resumeDate) : null}
                            onChange={(date) => setResumeDate(date ? date.format('YYYY-MM-DD') : '')}
                            format="YYYY-MM-DD"
                            disabledDate={(current) => current && current < moment().add(1, 'days').startOf('day')}
                        />
                    </div>
                </Modal>

                {/* Modal for resuming the subscription */}
                <Modal
                    title="Resume Subscription"
                    open={isModalVisibleResume}
                    onOk={handleResumeConfirm}   // Confirm button
                    onCancel={handleResumeCancel} // Cancel button
                    confirmLoading={loading}
                    okText="Resume Subscription"
                    cancelText="Cancel"
                >
                    <p>Subscription will resume from tomorrow: <strong>{pauseDate}</strong>.</p>
                    <p>Are you sure you want to resume this subscription?</p>
                </Modal>
                {/* ************************************************One time Order******************************************* */}

                {activeTab === "one-time-orders" && (
                    <div className="ordersContainer">
                        <h2>One Time Orders</h2>
                        <div className="scrollable-container">
                            <div className="card-list">
                                {Array.isArray(oneTimeOrderData) &&
                                    oneTimeOrderData.length > 0 ? (
                                    oneTimeOrderData.map((order) => (
                                        <div key={order.subscription_id} className="card">

                                            <div className="topCardDataWrap">
                                                <div className="orderImagWrap">
                                                    <img
                                                        src={order.image}
                                                        alt={order.product_name}
                                                        className="card-img"
                                                    />
                                                </div>
                                                <div className="card-info">
                                                    <h3 className="orderItmName">
                                                        {order.product_name}
                                                    </h3>
                                                    <p className="orderItmWieght">
                                                        {order.weight} {order.weight_unit}
                                                    </p>
                                                    <p className="orderQuantity">
                                                        Pack: {order.quantity} Per day
                                                        {/* ({order.package_name}) */}
                                                    </p>
                                                    {/* <p className="orderLD">
                            Last Delivered:{" "}
                            {order.lastDeliveryDate || "-"}
                          </p> */}
                                                    <p className="orderPrice">
                                                        <small>MRP</small> ₹{order.price}{" "}
                                                        <span>per pack</span>
                                                    </p>
                                                    <p className="orderBalAmt">
                                                        Total Amount : ₹ {order.price * order.quantity}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="dataWraps">

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
                                                        <p>Order Date</p>
                                                        <span>{order.
                                                            delivery_date
                                                            || "-"}</span>
                                                    </div>
                                                </div>




                                                <div className="orderDateRightBox box50">
                                                    <div className="svgWrap">
                                                        {/* <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width={24}
                              height={24}
                            >
                              <path d="M19,2h-1V1c0-.552-.447-1-1-1s-1,.448-1,1v1H8V1c0-.552-.447-1-1-1s-1,.448-1,1v1h-1C2.243,2,0,4.243,0,7v12c0,2.757,2.243,5,5,5h14c2.757,0,5-2.243,5-5V7c0-2.757-2.243-5-5-5ZM5,4h14c1.654,0,3,1.346,3,3v1H2v-1c0-1.654,1.346-3,3-3Zm14,18H5c-1.654,0-3-1.346-3-3V10H22v9c0,1.654-1.346,3-3,3Zm0-8c0,.552-.447,1-1,1H6c-.553,0-1-.448-1-1s.447-1,1-1h12c.553,0,1,.448,1,1Zm-7,4c0,.552-.447,1-1,1H6c-.553,0-1-.448-1-1s.447-1,1-1h5c.553,0,1,.448,1,1Z" />
                            </svg> */}
                                                    </div>
                                                    <div className="innerBox">
                                                        {/* <p>Delivery : </p> */}
                                                        <span>{order.status_name || "-"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="subExpiredText">
                                                {order.status}
                                            </span>
                                            <div className="subscription_idWrap">
                                                <p>Order Id: #{order.order_id}</p>
                                            </div>


                                            <div className="delete-icon"
                                                onClick={() => handleDeleteClick(order)}
                                            >
                                            </div>

                                        </div>
                                    ))
                                ) : (
                                    <p>No order  found.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                <Modal
                    className="delete-modal"
                    title="Cancel Order"
                    visible={isModalVisible}
                    onOk={handleConfirmDelete}
                    onCancel={handleCancelModal}
                    okText="Confirm"
                    cancelText="Cancel"
                >
                    <p className="delete-modal-content">Select a reason to cancel the order:</p>
                    <Radio.Group onChange={handleReasonChange} value={selectedReason}>
                        {cancelReasons.map((reason) => (
                            <Radio key={reason?.id} value={reason?.id} className="delete-radio-btn">
                                {reason?.reason}
                            </Radio>
                        ))}
                    </Radio.Group>
                </Modal>

            </main>
        );
    };

    // ****************header and Footer**************************
    const renderHeader = (): JSX.Element => {
        return (
            <components.Header
                title="Menu"
                showGoBack={true}

            />
        );
    };

    // const renderFooter = (): JSX.Element => {
    //     return <components.Footer />;
    // };

    return (
        <div id="screen" style={{ opacity }}>
            {renderHeader()}
            {renderContent()}
            {/* {renderFooter()} */}
        </div>
    );
};
