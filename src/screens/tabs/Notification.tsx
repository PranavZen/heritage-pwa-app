import React, { useState } from "react";

import { hooks } from "../../hooks";
import { svg } from "../../assets/svg";
import { components } from "../../components";

export const Notification: React.FC = () => {
  const dispatch = hooks.useDispatch();

  const [opacity, setOpacity] = useState<number>(0);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor("#F6F9F9", "#F6F9F9", dispatch);

  const { notificationsLoading, notifications } = hooks.useGetNotifications();
  const [readNotifications, setReadNotifications] = useState<Set<string>>(
    new Set()
  );

  const handleMarkAsRead = (id: string) => {
    setReadNotifications((prev) => new Set(prev).add(id));
  };

  const renderContent = (): JSX.Element => {
    if (notificationsLoading) return <components.Loader />;

    return (
      <main className="scrollable d">
        <ul className="notificationListWrap">
          {notifications.map((notification, index, array) => {
            const isLast = index === array.length - 1;
            const isRead = readNotifications.has(String(notification.id));

            return (
              <li
                key={notification.id}
                style={{
                  marginBottom: isLast ? 0 : 5,
                }}
                className="notofiationList"
              >
                <div style={{ opacity: isRead ? 0.5 : 1 }}>
                  <div
                    style={{ gap: 8, marginBottom: 14 }}
                    className="row-center"
                  >
                    {notification.title === "Order Out for Delivery" && (
                      <svg.NotificationCheckSvg />
                    )}
                    {notification.title === "Limited-Time Deal" && (
                      <svg.GiftSvg />
                    )}
                    {notification.title === "Reservation Confirmed" && (
                      <svg.NotificationCheckSvg />
                    )}
                    <h5 className="number-of-lines-1">{notification.title}</h5>
                  </div>
                  <p className="t14" style={{ marginBottom: 14 }}>
                    {notification.description}
                  </p>
                  <div className="row-center-space-between">
                    <span className="t12">{notification.date}</span>
                    {!isRead && (
                      <span
                        className="t12 clickable"
                        onClick={() =>
                          handleMarkAsRead(String(notification.id))
                        }
                      >
                        Mark as read
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </main>
    );
  };

  return (
    <div id="screen" style={{ opacity }}>
      {renderContent()}
    </div>
  );
};
