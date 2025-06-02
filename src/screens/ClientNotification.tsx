import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { hooks } from '../hooks';
import { components } from '../components';
import { Routes } from '../routes';
import { svg } from '../assets/svg';

export const ClientNotification: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();


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
        setNotifications(response.data.notificationList || []);
      } catch (error) {
        setError('Failed to fetch notifications.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const renderHeader = (): JSX.Element => {
    return <components.Header title="Notifications" showGoBack={true} />;
  };

  const renderContent = (): JSX.Element => {
    if (loading) return <components.Loader />;
    if (error) return <p>{error}</p>;

    return (
      <main className="scrollable s">
        <div className="clientNotificationWrap">
          {notifications.length === 0 ? (
            <div className="empty-notification">
              <div className="empty-icon">
                <svg.BellTabSvg />
              </div>
              <p>No notifications available</p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <div
                key={index}
                className='notification-client'
                onClick={() => {
                  navigate(Routes.ClientNotificationDetails, { state: { notification_id: notification.notification_id } });
                }}
              >
                <div className="notification-icon">
                  <svg.BellTabSvg />
                </div>
                <div className="notification-content">
                  <p className='notifytext'>{notification.message}</p>
                  <p className='notifyDate'>{notification.created_date}</p>
                </div>
              </div>
            ))
          )}
        </div>
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
