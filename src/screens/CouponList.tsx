import React, { useState, useEffect } from "react";
import { hooks } from "../hooks";
import { components } from "../components";
import { useNavigate } from "react-router-dom";
import './CouponList.scss';

export const CouponList: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const [opacity, setOpacity] = useState<number>(0);
  const [coupons, setCoupons] = useState<any[]>([]); // Store coupon data
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor("#F6F9F9", "#F6F9F9", dispatch);
  hooks.useGetNotifications();

  // Fetch coupons from the API using FormData
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
                      localStorage.setItem('couponCode', coupon.code); 
                      navigate('/tab-navigator', {
                        state: { couponCode: coupon.code }
                      });
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
    </div>
  );
};
