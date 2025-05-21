import React, { useEffect, useState } from "react";
import { components } from "../components";
import { hooks } from "../hooks";
import { Routes, TabScreens } from "../routes";
import "./ThankYouPage.scss";
import Animation from "../components/Animation/ThankYou.json";
import Lottie from "lottie-react";

const ThankYouPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [orderNumber] = useState(
    `ORD-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [currentDate] = useState(
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );

  const message =
    "Your order has been successfully placed. We'll notify you once it's shipped.";
  const navigate = hooks.useNavigate();

  useEffect(() => {
    // Trigger animations after component mounts
    setTimeout(() => {
      setIsVisible(true);
    }, 300);
  }, []);

  const renderHeader = (): JSX.Element => {
    return <components.Header showGoBack={true} showBasket={true} />;
  };

  return (
    <div className="thank-you-container">
      {renderHeader()}

      <div className={`thank-you-page ${isVisible ? "visible" : ""}`}>
        <div className="success-animation">
          <Lottie animationData={Animation} />
        </div>

        <div className="thank-you-content">
          <div className="thank-you-message">
            <h1>Thank You!</h1>
            <p>{message}</p>
          </div>

          <div className="order-details">
            <div className="order-number">
              <div className="mySec">
                <div className="label">Order Number</div>
                <div className="value">{orderNumber}</div>
              </div>
              <div className="mySec">
                <div className="label">Order Date</div>
                <div className="value">{currentDate}</div>
              </div>
            </div>
            
          </div>

          <div className="order-summary">
            <div className="summary-header">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <h2>Order Summary</h2>
            </div>
            <p>We appreciate your business and will process your order soon.</p>
            <p>
              You will receive an email confirmation shortly at your registered
              email address.
            </p>
          </div>

          <div className="action-buttons">
            <button
              onClick={() => navigate("/your-order")}
              className="view-order-button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              View Order
            </button>
            <button
              onClick={() => navigate(TabScreens.Home)}
              className="continue-shopping-button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
