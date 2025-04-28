import React, { useState, useEffect } from "react";
import { hooks } from "../hooks";
import { components } from "../components";
import { useNavigate, useLocation } from "react-router-dom";
import './CouponSummary.scss';
import axios from "axios";
import { notification } from "antd";

export const CouponSummary: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const [opacity, setOpacity] = useState<number>(0);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cartDetails, setCartDetails] = useState<any>(null);
  const [showCartDetails, setShowCartDetails] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();
  const couponCode = location.state?.couponCode;

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
        formData.append('next_id', '0');
        formData.append('cart_type', '2');
        formData.append('coupon_code', couponCode);
        formData.append('is_coupon_appiled', '1');

        const response = await axios.post(
          'https://heritage.bizdel.in/app/consumer/services_v11/getCartDatasrv',
          formData
        );

        const data = response.data;

        if (data) {
          setCoupons(data);
          setCartDetails({
            company_state_id: data.company_state_id,
            cut_off_time: data.cut_off_time,
            discount_total: data.discount_total,
            after_discount_total: data.after_discount_total,
            subs_total: data.subs_total,
            del_charges_total: data.del_charges_total,
            gst_tax_total: data.gst_tax_total,
            tr_current: data.tr_current,
            current_cart_grand_total: data.current_cart_grand_total,
            cart_grand_total: data.cart_grand_total,
            cart_final_grand_total: data.cart_final_grand_total,
            tr: data.tr,
            updatedWalletAmount: data.updatedWalletAmount,
          });
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching coupons:', error);
        setError('Failed to fetch coupons');
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [couponCode]);

  const handleCheckout = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('c_id', localStorage.getItem('c_id') || '');
    formData.append('addresses_id', '93459');
    formData.append('coupon_code', couponCode)
    formData.append('is_coupon_appiled', '1')

    try {
      const response = await axios.post(
        `https://heritage.bizdel.in/app/consumer/services_v11/placeOrder`,
        formData
      );

      setLoading(false);

      if (response.data.status === 'success') {
        notification.success({ message: response.data.message });
        navigate('/your-order');

      } else if (response.data.status === 'fail') {
        notification.error({ message: response.data.message || 'Order placement failed' });
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
      notification.error({ message: 'An error occurred while placing your order.' });
    }
  };

  const toggleCartDetails = () => {
    setShowCartDetails((prev) => !prev);
  };

  const renderCartDetails = (): JSX.Element => {
    if (!cartDetails) return <></>;

    return (
      <div className="coupon-cart-wrapper">
        <div className="coupon-cart-toggle" onClick={toggleCartDetails}>
          <h2>Cart Summary</h2>
          <span>{showCartDetails ? '▲' : '▼'}</span>
        </div>

        {showCartDetails && (
          <div className="coupon-cart-details">
            {[
              { label: 'Company State ID', value: cartDetails.company_state_id },
              { label: 'Cut-off Time', value: cartDetails.cut_off_time },
              { label: 'Discount', value: <span dangerouslySetInnerHTML={{ __html: cartDetails.discount_total }} /> },
              { label: 'Total After Discount', value: `₹${cartDetails.after_discount_total}` },
              { label: 'Subscription Total', value: `₹${cartDetails.subs_total}` },
              { label: 'Delivery Charges', value: `₹${cartDetails.del_charges_total}` },
              { label: 'GST Tax', value: `₹${cartDetails.gst_tax_total}` },
              { label: 'Current Cart Grand Total', value: `₹${cartDetails.current_cart_grand_total}` },
              { label: 'Cart Grand Total', value: `₹${cartDetails.cart_grand_total}` },
              { label: 'Final Cart Total', value: `₹${cartDetails.cart_final_grand_total}` },
              { label: 'Wallet Amount', value: `₹${cartDetails.updatedWalletAmount}` },
            ].map((item, index) => (
              <div key={index} className="coupon-cart-summary-item">
                <strong>{item.label}:</strong> {item.value}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderContent = (): JSX.Element => {
    // if (loading) return <div className="coupon-loading">Loading coupons...</div>;
    if (error) return <div className="coupon-error">Error: {error}</div>;

    return (
      <div>
        {coupons.length > 0 ? (
          coupons.map((coupon) => (
            <div className="coupon-card" key={coupon.coupon_id}>
            </div>
          ))
        ) : (
          <div className="coupon-empty"></div>
        )}

        {renderCartDetails()}
      </div>
    );
  };


  const renderHeader = (): JSX.Element => {
    return (
      <components.Header showGoBack={true} showBasket={true} />
    );
  };


  const renderButton = (): JSX.Element => {
    return (

      <div style={{margin:"13px"}}>
        <components.Button
          text="Checkout"
          onClick={handleCheckout}
        />
      </div>
    );
  };


  return (
    <div id="screen" style={{ opacity }}>
      {renderHeader()}
      {renderContent()}
      {renderButton()}
    </div>
  );
};
