import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { components } from "../components";
import { notification, Modal, Spin } from "antd";
import './SubscriptionModify.css';

export const SubscriptionModify: React.FC = () => {
  const location = useLocation();
  const { subscription } = location.state || {};
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerData, setCustomerData] = useState<any[]>([]);

  // console.log("oneTimeOrderoneTimeOrder", customerData);

  const [oneTimeOrder, SetOneTimeOrder] = useState<any[]>([]);



  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // console.log("selectedOrder", selectedOrder)

  const [quantity, setQuantity] = useState<number>(1);

  const [quantityy, setQuantityy] = useState<number>(1);

  const [declinedQuantity, setDeclinedQuantity] = useState<number>(0);

  // console.log("declinedQuantity", declinedQuantity);
  const [extraQuantity, setExtraQuantity] = useState<number>(1);

  const navigate = useNavigate();

  const fetchSubscriptionData = async (date: string) => {
    if (!date) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("c_id", subscription?.c_id || "");
    formData.append("order_date", date || "");
    try {
      const response = await fetch("https://heritage.bizdel.in/app/consumer/services_v11/customerOrderCalendar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.status === "success") {
        notification.success({ message: data.message });
        setCustomerData(data.subscriptionOrders);
        SetOneTimeOrder(data.oneTimeOrders);
      } else if (data.status === "fail") {
        setCustomerData([]);
        SetOneTimeOrder([]);
        notification.error({ message: data.message });
      }
    } catch (error) {
      console.error("Error fetching subscription data", error);
      notification.error({ message: "Error fetching subscription data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchSubscriptionData(selectedDate);
    }
  }, [selectedDate]);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = event.target.value;
    setSelectedDate(date);
  };

  const checkIfTomorrow = (date: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];
    return date === tomorrowDate;
  };

  const showModal = (orderData: any) => {
    if (checkIfTomorrow(selectedDate)) {
      setSelectedOrder(orderData);
      setQuantity(orderData.quantity || 1);
      setDeclinedQuantity(orderData.declined_quantity || 0);
      setExtraQuantity(orderData.extra_quantity || 1);
      setIsModalOpen(true);
    } else {
      notification.error({ message: "You cannot update today's or past orders." });
    }
  };

  const handleUpdateSubscription = async () => {
    if (!selectedOrder) {
      notification.error({ message: "No order selected." });
      return;
    }

    const orderId = selectedOrder?.order_id || "";
    const cId = selectedOrder?.c_id || "";
    const subscriptionId = selectedOrder?.subscription_id || "";
    const defaultQuantity = selectedOrder?.default_quantity || 1;
    const prevOrderStatus = selectedOrder?.order_status_id || 0;

    const quantityToSend = quantityy || 1;
    const declinedQuantityToSend = declinedQuantity || 0;
    const extraQuantityToSend = extraQuantity || 1;

    if (!orderId || !cId || !subscriptionId) {
      notification.error({ message: "Missing required fields to update the subscription." });
      return;
    }

    const formData = new FormData();
    formData.append("order_id", orderId.toString());
    formData.append("c_id", cId.toString());
    formData.append("subscription_id", subscriptionId.toString());
    formData.append("default_quantity", defaultQuantity.toString());
    formData.append("quantity", quantityToSend.toString());
    formData.append("declined_quantity", declinedQuantityToSend.toString());
    formData.append("extra_quantity", extraQuantityToSend.toString());
    formData.append("order_date", selectedDate);
    formData.append("prevOrderStatus", prevOrderStatus.toString());

    try {
      const response = await fetch("https://heritage.bizdel.in/app/consumer/services_v11/updateSubscriptionOrder", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.status === "success") {
        notification.success({ message: data.message });
        setIsModalOpen(false);
      } else if (data.status === "fail") {
        notification.error({ message: data.message });
      }
    } catch (error) {
      console.error("Error updating subscription", error);
      notification.error({ message: "Error updating subscription" });
    }
  };

  const renderHeader = (): JSX.Element => {
    return <components.Header title="Modify Subscription" showGoBack={true} showBasket={true} />;
  };

  const renderContent = (): JSX.Element => {
    return (
      <section className="subscription-section">
        <h3 className="section-title">Modify Your Subscription</h3>

        <div className="date-picker-container">
          <label htmlFor="datePicker">Select Order Date: </label>
          <input
            type="date"
            id="datePicker"
            value={selectedDate}
            onChange={handleDateChange}
            className="date-picker"
          />
        </div>

        <div className="order-container">
          <div className="order-group">
            {loading ? (
              <div className="spinner">
                <Spin size="large" />
              </div>
            ) : (
              <>
                {customerData.length > 0 ? (
                  customerData.map((elem: any) => (
                    <div key={elem.id} className="order-card">
                      <img src={elem.image} onClick={() => showModal(elem)} alt="Subscription Item" className="order-image" />
                      <div className="order-info">
                        <p className="order-status">{elem.order_status_name}</p>
                        <p className="order-name">{elem.name}</p>
                        <p className="order-name">Pack :{elem.quantity}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-orders">No subscription orders available.</p>
                )}
              </>
            )}
          </div>

          <div className="order-group">
            {loading ? (
              <div className="spinner">
                <Spin size="large" />
              </div>
            ) : (
              <>
                {oneTimeOrder.length > 0 ? (
                  oneTimeOrder.map((elem: any) => {
                    // console.log("1111111111",elem);    
                    return (
                      <div key={elem.id} className="order-card">
                        <img src={elem.image} alt="One-Time Item" className="order-image" />
                        <div className="order-info">
                          <p className="order-name">{elem.name}</p>
                          <p className="order-status">{elem.order_status_name}</p>
                          <p className="order-status">{elem.quantity}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="no-orders">No one-time orders available.</p>
                )}

              </>
            )}
          </div>
        </div>

        <Modal
          title="Modify Subscription"
          open={isModalOpen}
          onOk={handleUpdateSubscription}
          onCancel={() => setIsModalOpen(false)}
        >
          <div className="modal-content">
            <div className="quantity-container">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button
                  className="quantity-button"
                  onClick={() => setQuantityy(prev => Math.max(1, prev - 1))}
                >
                  -
                </button>

               
                <p className="quantity-display">{quantityy}</p>  
                
                <button
                  className="quantity-button"
                  onClick={() => setQuantityy(prev => prev + 1)}
                >
                  +
                </button>
              </div>
            </div>
            <div className="quantity-info">
              <p>Current quantity: {quantity}</p>
            </div>
          </div>
        </Modal>


      </section>
    );
  };

  return (
    <div id="screen">
      {renderHeader()}
      {renderContent()}
    </div>
  );
};
