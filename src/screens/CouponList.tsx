import React, { useState, useEffect } from "react";
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

  const navigate = useNavigate();

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor("#F6F9F9", "#F6F9F9", dispatch);
  hooks.useGetNotifications();

  useEffect(() => {
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
      return <div className="loading">Loading coupons...</div>;
    }

    if (error) {
      return <div className="error">{`Error: ${error}`}</div>;
    }

    return (
      <>
        <div>
          <h1>Your Discount Coupons</h1>
          {coupons.length > 0 ? (
            coupons.map((coupon) => (
              <div className="card" key={coupon.coupon_id}>
                <div className="card-header">
                  <h3>{coupon.name}</h3>
                  <span className="discount">{coupon.coupon_display}</span>
                </div>
                <div className="card-body">
                  <p className="description">{coupon.description}</p>
                </div>
                <div className="card-footer">
                  <div className="max-amount">Max Cart Amount: ₹{coupon.cart_max_amount}</div>
                  <div className="uses-left">Uses Left: {coupon.uses_total_coupon}</div>
                  <button
                    onClick={() => {
                      if (isApplying) return;
                      setIsApplying(true);
                      localStorage.setItem('couponCode', coupon.code);

                      setShowModal(true);
                      setTimeout(() => {
                        setShowModal(false);
                        setIsApplying(false);
                        navigate('/tab-navigator', {
                          state: { couponCode: coupon.code }
                        });
                      }, 3000); 
                    }}
                  >
                    Apply Coupon
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="NoCoupons-available">No coupons available at the moment.</div>
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
          <div className="popup-content">
            <Lottie animationData={CouponApply} style={{ width: 150, height: 150 }} />
            {/* <p>Coupon Applied Successfully!</p> */}
          </div>
        </div>
      )}
    </div>
  );
};
