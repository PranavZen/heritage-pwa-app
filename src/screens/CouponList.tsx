import React, { useState, useEffect, useRef } from "react";
import { hooks } from "../hooks";
import { components } from "../components";
import { useNavigate } from "react-router-dom";
import "./CouponList.scss";
import Lottie from "lottie-react";
import CouponApply from "../components/Animation/CouponApply.json";
import svgCoupon from "../assets/bg/coupon.svg";
import svgWhiteCoupon from "../assets/bg/coupon-white.svg";

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
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(
    null
  );
  const couponRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const navigate = useNavigate();

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor("#F6F9F9", "#F6F9F9", dispatch);
  hooks.useGetNotifications();

  useEffect(() => {
    // Check if there's already an applied coupon
    const currentCouponCode = localStorage.getItem("couponCode");
    if (currentCouponCode) {
      setAppliedCouponCode(currentCouponCode);
    }

    const fetchCoupons = async () => {
      try {
        const formData = new FormData();
        formData.append("c_id", localStorage.getItem("c_id") || "");
        formData.append("city_id", localStorage.getItem("cityId") || "");
        formData.append("area_id", localStorage.getItem("area_id") || "");

        const response = await fetch(
          "https://heritage.bizdel.in/app/consumer/services_v11/couponListing",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch coupons");
        }

        const data = await response.json();
        setCoupons(data.couponListing);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError("Unable to load coupons.");
      }
    };

    fetchCoupons();
  }, []);

  const renderHeader = (): JSX.Element => {
    return <components.Header showGoBack={true} showBasket={true} />;
  };

  const renderContent = (): JSX.Element => {
    if (loading) {
      return <div className="loading">Loading coupons...</div>;
    }

    if (error) {
      return <div className="error">{`Error: ${error}`}</div>;
    }

    const handleCouponHover = (couponId: string, isHovering: boolean) => {
      setHoveredCard(isHovering ? couponId : null);
    };

    const handleCouponClick = (couponId: string) => {
      setActiveCard(couponId);

      // Add ripple effect
      const card = couponRefs.current[couponId];
      if (card) {
        const ripple = document.createElement("span");
        ripple.classList.add("ripple-effect");
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
      localStorage.setItem("couponCode", coupon.code);
      setAppliedCouponCode(coupon.code);

      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        setIsApplying(false);
        navigate("/tab-navigator", {
          state: { couponCode: coupon.code },
        });
      }, 3000);
    };

    return (
      <>
        <div className="coupon-list-container">
          <h1>Coupons Cards</h1>
          {coupons.length > 0 ? (
            <div className="coupon-cards-wrapper">
              {coupons.map((coupon) => {
                const isApplied = appliedCouponCode === coupon.code;
                return (
                  <div
                    className={`coupon-card ${isApplied ? "applied" : ""}`}
                    key={coupon.coupon_id}
                    ref={(el) => (couponRefs.current[coupon.coupon_id] = el)}
                  >
                    {/* {isApplied && (
                      <div className="coupon-applied-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5"/>
                        </svg>
                        Applied
                      </div>
                    )} */}
                    <div className="coupon-left-section">
                      <div className="coupon-svg-icon">
                        {isApplied ? (
                          <img src={svgCoupon} alt={coupon.name} />
                        ) : (
                          <img src={svgWhiteCoupon} alt={coupon.name} />
                        )}
                      </div>
                    </div>

                    <div className="coupon-content">
                      <div className="coupon-code">{coupon.name}</div>
                      <div className="coupon-amount-info">
                        {coupon.cart_min_amount > 0 && (
                          <div className="amount-needed">
                            Add ₹{coupon.cart_min_amount} more to avail this
                            offer
                          </div>
                        )}
                        <div className="discount-info">
                          Get {coupon.coupon_display}
                        </div>
                      </div>
                      <div className="coupon-details">
                        <div className="coupon-description">
                          Use code {coupon.name} & get {coupon.coupon_display}{" "}
                          on orders above ₹{coupon.cart_min_amount || 0}.
                          {coupon.cart_max_amount > 0 &&
                            ` Maximum discount: ₹${coupon.cart_max_amount}.`}
                        </div>
                      </div>
                    </div>

                    <div className="coupon-action">
                      {isApplied ? (
                        <div className="coupon-applied-status">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6 9 17l-5-5"/>
                          </svg>
                          <span>APPLIED</span>
                        </div>
                      ) : (
                        <button
                          className="apply-button"
                          onClick={() => {
                            if (isApplying) return;
                            setIsApplying(true);
                            localStorage.setItem("couponCode", coupon.code);
                            setAppliedCouponCode(coupon.code);

                            setShowModal(true);
                            setTimeout(() => {
                              setShowModal(false);
                              setIsApplying(false);
                              navigate("/tab-navigator", {
                                state: { couponCode: coupon.code },
                              });
                            }, 3000);
                          }}
                          disabled={isApplying}
                        >
                          {isApplying ? (
                            <div className="button-loader">
                              <div className="spinner"></div>
                              <span>APPLYING...</span>
                            </div>
                          ) : (
                            "APPLY"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="NoCoupons-available">
              No coupons available at the moment.
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div id="screen" style={{ opacity }}>
      {renderHeader()}
      {renderContent()}

      {/* Popup Modal */}
      {showModal && (
        <div className="popup-modal">
          <div className="popup-content couponApplied-main">
            <Lottie
              animationData={CouponApply}
              style={{ width: 150, height: 150, margin: "0 auto" }}
            />
            <div className="success-message">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <h3>Coupon Applied Successfully!</h3>
              <p>Your discount will be applied at checkout</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
