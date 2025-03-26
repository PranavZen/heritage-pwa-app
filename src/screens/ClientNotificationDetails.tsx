import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { hooks } from '../hooks';
import { components } from '../components';
import { useLocation } from 'react-router-dom';

export const ClientNotificationDetails: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();
  const location = useLocation();

  console.log('Location state:', location.state);

  // Destructuring notification_id from location.state
  const { notification_id } = location.state || {};

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [opacity, setOpacity] = useState<number>(0);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor('#F6F9F9', '#F6F9F9', dispatch);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      const cityId = localStorage.getItem('c_id');
      const formData = new FormData();
      formData.append('c_id', cityId || 'null');
      formData.append('next_id', '0');

      try {
        const response = await axios.post(
          'https://heritage.bizdel.in/app/consumer/services_v11/notificationList',
          formData
        );
        console.log('Notification response:', response.data.notificationList);

        // Filter notifications if notification_id is available
        const filteredNotifications = notification_id
          ? response.data.notificationList.filter(
              (notification: any) => notification.notification_id === notification_id
            )
          : response.data.notificationList;

        // Set the filtered notifications
        setNotifications(filteredNotifications || []);
      } catch (error) {
        setError('Failed to fetch notifications.');
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
        <section className="accordion" style={{ paddingTop: 10 }}>
          {notifications.length === 0 ? (
            <div
              style={{
                borderRadius: 10,
                marginBottom: 10,
                border: '1px solid red',
                backgroundColor: 'var(--white-color)',
                padding: 20,
              }}
            >
              <p>No notifications available</p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <div key={index} className="notification-client">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <p style={{ textAlign: 'end' }}>{notification.created_date}</p>
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
