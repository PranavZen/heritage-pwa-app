import React, { useState, useEffect, useRef } from "react";
import { hooks } from "../hooks";
import { components } from "../components";
import { useNavigate } from "react-router-dom";
import './CouponList.scss';
import Lottie from "lottie-react";
import CouponApply from "../components/Animation/CouponApply.json";

export const CouponList: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const [opacity, setOpacity] = useState<number>(0);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const couponRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const navigate = useNavigate();

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor("#F6F9F9", "#F6F9F9", dispatch);
  hooks.useGetNotifications();

  useEffect(() => {
    // Check if there's already an applied coupon
    const currentCouponCode = localStorage.getItem('couponCode');
    if (currentCouponCode) {
      setAppliedCouponCode(currentCouponCode);
    }

    const fetchCoupons = async () => {
      try {
        const formData = new FormData();
        formData.append("c_id", localStorage.getItem('c_id') || '');
        formData.append("city_id", localStorage.getItem('cityId') || '');
        formData.append("area_id", localStorage.getItem('area_id') || '');

        const response = await fetch('https://heritage.bizdel.in/app/consumer/services_v11/couponListing', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch coupons');
        }

        const data = await response.json();
        setCoupons(data.couponListing);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError('Unable to load coupons.');
      }
    };

    fetchCoupons();
  }, []);

  const renderHeader = (): JSX.Element => {
    return (
      <components.Header showGoBack={true} showBasket={true} />
    );
  };

  const renderContent = (): JSX.Element => {
    if (loading) {
      return (
        <div className="loading">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="loading-icon">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
          Loading coupons...
        </div>
      );
    }

    if (error) {
      return (
        <div className="error">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          Error: {error}
        </div>
      );
    }

    const handleCouponHover = (couponId: string, isHovering: boolean) => {
      setHoveredCard(isHovering ? couponId : null);
    };

    const handleCouponClick = (couponId: string) => {
      setActiveCard(couponId);

      // Add ripple effect
      const card = couponRefs.current[couponId];
      if (card) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple-effect');
        card.appendChild(ripple);

        setTimeout(() => {
          ripple.remove();
        }, 600);
      }
    };

    const applyCoupon = (coupon: any) => {
      if (isApplying) return;

      handleCouponClick(coupon.coupon_id);
      setIsApplying(true);
      localStorage.setItem('couponCode', coupon.code);
      setAppliedCouponCode(coupon.code);

      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        setIsApplying(false);
        navigate('/tab-navigator', {
          state: { couponCode: coupon.code }
        });
      }, 3000);
    };

    return (
      <div className="coupon-list-container">
        <h1>Your Discount Coupons</h1>
        {coupons.length > 0 ? (
          coupons.map((coupon) => (
            <div
              className={`card ${activeCard === coupon.coupon_id ? 'active' : ''} ${appliedCouponCode === coupon.code ? 'applied' : ''}`}
              key={coupon.coupon_id}
              ref={el => couponRefs.current[coupon.coupon_id] = el}
              onMouseEnter={() => handleCouponHover(coupon.coupon_id, true)}
              onMouseLeave={() => handleCouponHover(coupon.coupon_id, false)}
              onClick={() => !appliedCouponCode || appliedCouponCode !== coupon.code ? handleCouponClick(coupon.coupon_id) : null}
            >
              <div className="circle-cutout-left" aria-hidden="true"></div>
              <div className="circle-cutout-right" aria-hidden="true"></div>
              <div className="card-header">
                {appliedCouponCode === coupon.code && (
                  <div className="applied-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                    Applied
                  </div>
                )}
                <h3>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a2.12 2.12 0 0 0-.05 3.69l12.22 6.93a2 2 0 0 0 1.94 0L21 12.51a2.12 2.12 0 0 0-.09-3.67Z"></path>
                    <path d="m3.09 8.84 12.35-6.61a1.93 1.93 0 0 1 1.81 0l3.65 1.9a2.12 2.12 0 0 1 .1 3.69L8.73 14.75a2 2 0 0 1-1.94 0L3 12.51a2.12 2.12 0 0 1 .09-3.67Z"></path>
                    <line x1="12" y1="22" x2="12" y2="13"></line>
                    <path d="M20 13.5v3.37a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13.5"></path>
                  </svg>
                  {coupon.name}
                </h3>
                <span className="discount">
                  {coupon.coupon_display}
                </span>
              </div>
              <div className="card-body">
                <p className="description">{coupon.description}</p>
              </div>
              <div className="card-footer">
                <div className="coupon-info">
                  <div className="max-amount">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M16 8h-6.5a2.5 2.5 0 0 0 0 5h3a2.5 2.5 0 0 1 0 5H6"></path>
                      <path d="M12 18v2"></path>
                      <path d="M12 6v2"></path>
                    </svg>
                    Max Amount: ₹{coupon.cart_max_amount}
                  </div>
                  <div className="uses-left">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20v-6"></path>
                      <path d="M18 20V10"></path>
                      <path d="M6 20v-3"></path>
                      <path d="M18 4V3"></path>
                      <path d="M6 4V3"></path>
                      <path d="M12 4V3"></path>
                      <path d="M12 14v-3"></path>
                      <path d="M18 14v-3"></path>
                      <path d="M6 11V8"></path>
                    </svg>
                    Uses Left: {coupon.uses_total_coupon}
                  </div>
                </div>
                {appliedCouponCode === coupon.code ? (
                  <button
                    className="applied-button"
                    disabled
                    aria-label={`Coupon ${coupon.name} already applied`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                    Applied
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      applyCoupon(coupon);
                    }}
                    aria-label={`Apply coupon ${coupon.name}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 13v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7"></path>
                      <path d="m16 5 5 5"></path>
                      <path d="M21 5h-5v5"></path>
                    </svg>
                    Apply Coupon
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="NoCoupons-available">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a2.12 2.12 0 0 0-.05 3.69l12.22 6.93a2 2 0 0 0 1.94 0L21 12.51a2.12 2.12 0 0 0-.09-3.67Z"></path>
              <path d="m3.09 8.84 12.35-6.61a1.93 1.93 0 0 1 1.81 0l3.65 1.9a2.12 2.12 0 0 1 .1 3.69L8.73 14.75a2 2 0 0 1-1.94 0L3 12.51a2.12 2.12 0 0 1 .09-3.67Z"></path>
              <line x1="12" y1="22" x2="12" y2="13"></line>
              <path d="M20 13.5v3.37a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13.5"></path>
            </svg>
            <p>No coupons available at the moment.<br />Check back later for exciting offers!</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="screen" style={{ opacity }}>
      {renderHeader()}
      {renderContent()}

      {/* Enhanced Popup Modal */}
      {showModal && (
        <div className="popup-modal">
          <div className="popup-content">
            <div className="success-icon">
              <Lottie animationData={CouponApply} style={{ width: 180, height: 180 }} />
            </div>
            <p>Coupon Applied Successfully!</p>
            <div className="coupon-applied-message">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
              <span>Redirecting to your cart...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
