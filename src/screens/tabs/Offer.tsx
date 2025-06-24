import React, { useState, useEffect, useRef } from "react";
import { hooks } from "../../hooks";
import { components } from "../../components";
import { useNavigate } from "react-router-dom";
import "../../screens/CouponList.scss";
import svgCoupon from "../../assets/bg/coupon.svg";
import svgWhiteCoupon from "../../assets/bg/coupon-white.svg";

export const Offer: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const [opacity, setOpacity] = useState<number>(0);
  const [coupons, setCoupons] = useState<any[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
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

        const cleanedCoupons = (data.couponListing || []).filter(Boolean);

        setCoupons(cleanedCoupons);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching coupons:", error);
        setLoading(false);
        setError("Unable to load coupons.");
      }
    };

    fetchCoupons();
  }, []);



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

    return (
      <>
        <div className="coupon-list-container">
          <h1>Offers</h1>
          {coupons.filter((coupon) => coupon.c_id !== null).length > 0 ? (
            <div className="coupon-cards-wrapper">
              {coupons
                .filter((coupon) => coupon.c_id !== null)
                .map((coupon) => {
                  const isApplied = appliedCouponCode === coupon.code;
                  return (
                    <div
                      className={`coupon-card ${isApplied ? "applied" : ""}`}
                      key={coupon.coupon_id}
                      ref={(el) => (couponRefs.current[coupon.coupon_id] = el)}
                    >
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
                              Add ₹{coupon.cart_min_amount} more to avail this offer
                            </div>
                          )}
                          <div className="discount-info">
                            Get {coupon.coupon_display}
                          </div>
                        </div>
                        <div className="coupon-details">
                          <div className="coupon-description">
                            Use code {coupon.name} & get {coupon.coupon_display} on
                            orders above ₹{coupon.cart_min_amount || 0}.
                            {coupon.cart_max_amount > 0 &&
                              ` Maximum discount: ₹${coupon.cart_max_amount}.`}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="NoCoupons-available">
              No Offer available at the moment.
            </div>
          )}
        </div>

      </>
    );
  };
  return (
    <div id="screen" style={{ opacity }}>
      {renderContent()}
      {/* Popup Modal */}
      {/* {showModal && (
        <div className="popup-modal">
          <div className="popup-content couponApplied-main">

          </div>
        </div>
      )} */}
    </div>
  );
};
