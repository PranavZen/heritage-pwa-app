import React, { useState, useEffect } from "react";
import axios from "axios";
import { hooks } from "../hooks";
import { components } from "../components";
import { useLocation } from "react-router-dom";
import { svg } from "../assets/svg";

export const ClientNotificationDetails: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();
  const location = useLocation();
  const { notification_id } = location.state || {};
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [opacity, setOpacity] = useState<number>(0);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor("#F6F9F9", "#F6F9F9", dispatch);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      const cityId = localStorage.getItem("c_id");
      const formData = new FormData();
      formData.append("c_id", cityId || "null");
      formData.append("next_id", "0");

      try {
        const response = await axios.post(
          "https://heritage.bizdel.in/app/consumer/services_v11/notificationList",
          formData
        );
        const filteredNotifications = notification_id
          ? response.data.notificationList.filter(
              (notification: any) =>
                notification.notification_id === notification_id
            )
          : response.data.notificationList;

        // Set the filtered notifications
        setNotifications(filteredNotifications || []);
      } catch (error) {
        setError("Failed to fetch notifications.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [notification_id]); // Add notification_id to the dependency array

  const renderHeader = (): JSX.Element => {
    return <components.Header title="Notifications" showGoBack={true} />;
  };

  const renderContent = (): JSX.Element => {
    if (loading) return <components.Loader />;
    if (error) return <p>{error}</p>;

    return (
      <main className="scrollable x">
        <section className="clientNotificationWrap" style={{ paddingTop: 10 }}>
          {notifications.length === 0 ? (
            <div className="empty-notification">
              <div className="empty-icon">
                <svg.BellTabSvg />
              </div>
              <p>No notifications available</p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <div key={index} className="notification-client notification-detail">
                <div className="notification-icon">
                  <svg.BellTabSvg />
                </div>
                <div className="notification-content">
                  <h3 className="mainText">{notification.title}</h3>
                  {notification.message
                    .split("\r\n\r\n")
                    .map(
                      (
                        sentence:
                          | string
                          | number
                          | boolean
                          | React.ReactElement<
                              any,
                              string | React.JSXElementConstructor<any>
                            >
                          | Iterable<React.ReactNode>
                          | React.ReactPortal
                          | null
                          | undefined,
                        index: React.Key | null | undefined
                      ) => (
                        <p key={index} className="subText">{sentence}</p>
                      )
                    )}
                  <p className="notifyDate">{notification.created_date}</p>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    );
  };

  return (
    <div id="screen" style={{ opacity }}>
      {renderHeader()}
      {renderContent()}
    </div>
  );
};
