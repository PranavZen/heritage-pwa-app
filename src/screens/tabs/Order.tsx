import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { hooks } from "../../hooks";
import { items } from "../../items";
import { Routes, TabScreens } from "../../routes";
import { RootState } from "../../store";
import type { DishType } from "../../types";
import { components } from "../../components";
import { MenuType } from "../../types/MenuType";
import axios from "axios";
import { notification } from "antd";
import { SubscriptionOrder } from "./SubscriptionOrder";
import { SubscriptionOrderCheck } from "./SubscriptionOrderCheck";
import { useLocation } from "react-router-dom";
import { setShouldRefresh } from "../../store/slices/cartSlice";
import SuperCoins from "../../components/Animation/SuperCoinsApply.json";
import Lottie from "lottie-react";
import { actions } from "../../store/actions";
import FaBackward from "../../assets/icons/left.png";
import NoCartData from "../NoCartData";
import "../../scss/order.scss";

interface Address {
  id: string;
  flat_plot_no: string;
  wing: string;
  building_name: string;
  address1: string;
  address2: string;
  area_name: string;
  city_name: string;
  state_name: string;
  pincode: string;
  is_default: string;
  firstname: string;
  lastname: string;
}

interface Props {
  addresses: Address[];
}

// export const Order: React.FC = () => {
// const Order = () => {

 export const Order: React.FC = () => {

  const location = useLocation();
  const couponCode = location.state?.couponCode;

  // console.log("wwwwwwwww",  couponCode);

  // const selectedAddressId = location.state?.addressId;
  const selectedAddressId = localStorage.getItem("selectedAddressId");

  // console.log('aaaaaaaaaa', selectedAddressId);

  const dispatch = hooks.useDispatch();
  const [opacity, setOpacity] = useState<number>(0);
  const [totalPrice, SetTotalPrice] = useState<any[]>([]);
  const [freeNoOfdeliveries, SetfreeNoOfdeliveries] = useState<any[]>([]);
  const [Subtotal, setSubtotal] = useState<any>({});

  // console.log("freeNoOfdeliveries", freeNoOfdeliveries);

  const [addressId, SetAddressId] = useState("");
  const [superPoint, setSuperPoint] = useState<any>(null);

  // console.log("superPoint", superPoint);

  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [cartDetails, setCartDetails] = useState<any>(null);
  // console.log("cartDetails", cartDetails)
  const [deliveries, SetDeliveries] = useState<any[]>([]);

  const [addresses, setAddresses] = useState<any[]>([]);

  const [getrewardbalance, setGetrewardBalance] = useState<any[]>([]);

  const [showAll, setShowAll] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const defaultAddress = Array.isArray(addresses)
    ? addresses.find((addr) => addr.is_default === "1")
    : null;
  const otherAddresses = Array.isArray(addresses)
    ? addresses.filter((addr) => addr.is_default !== "1")
    : [];

  const [redeemedAmount, setRedeemedAmount] = useState(0);
  const [passPoints, setPassPoints] = useState(0);
  const [coinAnimating, setCoinAnimating] = useState(false);
  const [amountAnimating, setAmountAnimating] = useState(false);

  const [superPointCoins, SetSuperPoint] = useState<number>(0);

  // console.log("setRedeemedAmount", redeemedAmount);
  // console.log("setRedeemedAmount", redeemedAmount);

  const maxRedeemableAmount = Math.floor(superPointCoins / 10);

  const adjustedRedeemedAmount = Math.min(redeemedAmount, maxRedeemableAmount);
  const PassPointsInCheckout = adjustedRedeemedAmount * 10;

  // console.log("Adjusted Redeemed Amount:", adjustedRedeemedAmount);

  // console.log("PassPointsInCheckout:", PassPointsInCheckout);

  // console.log("sssssss", PassPointsInCheckout);

  const shouldRefresh = useSelector(
    (state: RootState) => state.cartSlice.shouldRefresh
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);

  const [extraDiscount, setExtraDiscount] = useState<any[]>([]);

  const [extraDiscountShow, setExtraDiscountShow] = useState<any[]>([]);
  const [isCouponAnimating, setIsCouponAnimating] = useState(false);

  // console.log("extraDiscount", extraDiscount);

  // console.log("extraDiscount", extraDiscount);
  const [isChecked, setIsChecked] = useState<boolean>(() => {
    const stored = localStorage.getItem("isChecked");
    return stored === "true";
  });

  //  console.log("aaaaaaaazzzzzzzz", superPoint.available_amount)

  const shouldMount = useSelector(
    (state: RootState) => state.cartSlice.shouldRefresh
  );

  useEffect(() => {
    const isChecked = localStorage.getItem("isChecked") === "true";

    if (isChecked) {
      setIsChecked(true);

      if (superPoint) {
        setRedeemedAmount(superPoint.available_amount);
        SetSuperPoint(superPoint.available_points);
      }
    }
  }, [superPoint]);

  const handleCheckboxChange = (e: any) => {
    const checked = e.target.checked;
    setIsChecked(checked);

    localStorage.setItem("isChecked", JSON.stringify(checked));

    localStorage.setItem("isChecked", JSON.stringify(checked));

    setCoinAnimating(true);
    setAmountAnimating(true);

    setTimeout(() => setCoinAnimating(false), 600);
    setTimeout(() => setAmountAnimating(false), 500);
    setTimeout(() => setCoinAnimating(false), 600);
    setTimeout(() => setAmountAnimating(false), 500);

    if (checked) {
      setShowModal(true);
      setTimeout(() => setShowModal(false), 2000);
      setTimeout(() => setShowModal(false), 2000);

      if (superPoint) {
        setRedeemedAmount(superPoint.available_amount);
        SetSuperPoint(superPoint.available_points);
      }
    } else {
      setRedeemedAmount(0);
      SetSuperPoint(0);
      localStorage.removeItem("superPointChecked");
      localStorage.removeItem("superPointChecked");
    }
  };




  setTimeout(() => {
    setShowModal(false);
    setIsApplying(false);
  }, 5000);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor("#F6F9F9", "#F6F9F9", dispatch);

  const navigate = hooks.useNavigate();

  const c_id = localStorage.getItem("c_id");
  const cityId = localStorage.getItem("cityId");

  // ***************************************************************************************
  useEffect(() => {
    const fetchAddresses = async () => {
      const formData = new FormData();
      formData.append("c_id", c_id || "0");
      try {
        setLoading(true);
        const response = await axios.post(
          "https://heritage.bizdel.in/app/consumer/services_v11/getAllAddressById",
          formData
        );
        // console.log('xxxxxxxxxxxxxxx', response.data.addresses);
        setAddresses(response.data.addresses);

        setLoading(false);
      } catch (error) {
        setLoading(false);
        // console.error("Error fetching addresses:", error);
      }
    };
    fetchAddresses();
  }, [c_id, shouldRefresh]);

  // *************************************************************************************

  useEffect(() => {
    const getAddToCartData = async () => {
      const formData = new FormData();
      formData.append("city_id", cityId || "");
      formData.append("c_id", c_id || "");
      formData.append("area_id", localStorage.getItem("area_id") || "");
      formData.append("next_id", "0");
      formData.append("cart_type", "2");
      try {
        const response = await axios.post(
          `https://heritage.bizdel.in/app/consumer/services_v11/getCartDatasrv`,
          formData
        );

        SetTotalPrice(response.data.optionListing);
        SetDeliveries(
          response.data.optionListing.map((elem: any) => elem.no_of_deliveries)
        );
        SetfreeNoOfdeliveries(
          response.data.optionListing.map(
            (elem: any) => elem.no_of_free_deliveries
          )
        );
        setExtraDiscount(
          response.data.optionListing.map(
            (elem: any) =>
              (elem.no_of_deliveries - elem.no_of_free_deliveries) *
              elem.discount *
              elem.quantity
          )
        );
        setExtraDiscountShow(
          response.data.optionListing.map((elem: any) => {
            const deliveries =
              Number(elem.no_of_deliveries) === 0
                ? 1
                : Number(elem.no_of_deliveries);
            const discount = Number(elem.discount);
            const quantity = Number(elem.quantity);
            return (deliveries * discount * quantity).toString();
          })
        );
        setSubtotal(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    if (shouldRefresh) {
      getAddToCartData().finally(() => {
        dispatch(setShouldRefresh(false));
      });
    }
    getAddToCartData();
  }, [cityId, c_id, shouldRefresh, dispatch]);

  useEffect(() => {
    const getAddress = async () => {
      const formData = new FormData();
      formData.append("c_id", c_id || "");
      try {
        const response = await axios.post(
          `https://heritage.bizdel.in/app/consumer/services_v11/getAllAddressById`,
          formData
        );

        const addresses = response.data.addresses;

        // const defaultAddress = addresses.find((addr: any) => addr.is_default === 1);

        // if (defaultAddress) {
        //   SetAddressId(defaultAddress.id);
        // } else if (addresses.length > 0) {
        //   SetAddressId(addresses[0].id);
        // }
        if (Array.isArray(addresses)) {
          const defaultAddress = addresses.find(
            (addr: any) => addr.is_default === 1
          );

          if (defaultAddress) {
            SetAddressId(defaultAddress.id);
          } else if (addresses.length > 0) {
            SetAddressId(addresses[0].id);
          }
        } else {
          // console.warn('addresses is not an array', addresses);
        }
      } catch (error) {
        // console.error("Failed to fetch addresses", error);
      }
    };

    getAddress();
  }, [c_id, shouldRefresh]);

  const handleCheckout = async () => {
    setLoading(true);
    setButtonLoading(true); // Set button loading state to true

    const formData = new FormData();
    formData.append("c_id", c_id || "");
    formData.append(
      "addresses_id",
      selectedAddressId ? String(selectedAddressId) : String(addressId || "")
    );
    formData.append("redeem_reward_points", String(superPointCoins));

    try {
      const response = await axios.post(
        `https://heritage.bizdel.in/app/consumer/services_v11/placeOrder`,
        formData
      );
      if (response.data.status === "success") {
        notification.success({ message: response.data.message });
        navigate("/thank-you");
        localStorage.removeItem("couponCode");
      } else if (response.data.status === "fail") {
        setButtonLoading(false); // Reset button loading state on failure
        setLoading(false); // Reset global loading state on failure
        notification.error({
          message: response.data.message || "Order placement failed",
        });
      }
    } catch (error) {
      setButtonLoading(false); // Reset button loading state on error
      setLoading(false); // Reset global loading state on error
      console.error(error);
      notification.error({
        message: "An error occurred while placing your order.",
      });
    }
  };

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const formData = new FormData();
        formData.append("c_id", localStorage.getItem("c_id") || "");
        formData.append("city_id", localStorage.getItem("cityId") || "");
        formData.append("area_id", localStorage.getItem("area_id") || "");
        formData.append("next_id", "0");
        formData.append("cart_type", "2");
        formData.append(
          "coupon_code",
          localStorage.getItem("couponCode") || ""
        );
        formData.append("is_coupon_appiled", "1");

        const response = await axios.post(
          "https://heritage.bizdel.in/app/consumer/services_v11/getCartDatasrv",
          formData
        );
        const data = response.data;

        // console.log("iiiiiiiiiiiiiii", response);

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
          localStorage.setItem("discount_total", data.discount_total || "0");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching coupons:", error);
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [couponCode, shouldRefresh]);

  // ********************Super Coupons*********************************
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const formData = new FormData();
        formData.append("c_id", localStorage.getItem("c_id") || "");
        // formData.append("c_id",  '123207');
        formData.append("city_id", localStorage.getItem("cityId") || "");
        formData.append("area_id", localStorage.getItem("area_id") || "");
        formData.append("next_id", "0");

        const response = await axios.post(
          "https://heritage.bizdel.in/app/consumer/services_v11/getrewardbalance",
          formData
        );
        //  console.log("rrtttttttttt", response)

        if (response.data.status === "success") {
          setGetrewardBalance(response.data.points);
          localStorage.setItem("reward_balance", response.data.points);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching coupons:", error);
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [shouldRefresh]);

  useEffect(() => {
    // Check if c_id exists in localStorage
    const storedCId = localStorage.getItem("c_id");
    if (!storedCId) {
      console.warn("No customer ID found in localStorage");
    }
  }, []);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const formData = new FormData();
        formData.append("c_id", localStorage.getItem("c_id") || "");
        formData.append("city_id", localStorage.getItem("cityId") || "");
        formData.append("area_id", localStorage.getItem("area_id") || "");
        formData.append("next_id", "0");
        formData.append("cart_type", "2");
        formData.append(
          "redeem_points",
          String(localStorage.getItem("reward_balance") || "")
        );

        // console.log('Passing redeem_points:', getrewardbalance);

        const response = await axios.post(
          "https://heritage.bizdel.in/app/consumer/services_v11/getCartDatasrv",
          formData
        );

        const data = response.data;

        // console.log("vvvvvvvvvvv", data);

        // if (data && data.redeemed_points && data.redeemed_amount) {
        //   setSuperPoint({
        //     redeemed_points: data.redeemed_points,
        //     redeemed_amount: data.redeemed_amount,
        //   });
        // }
        setSuperPoint(data);

        // setLoading(false);
      } catch (error) {
        console.error("Error fetching coupons:", error);
        setLoading(false);
      }
    };
    fetchCoupons();
  }, [shouldRefresh, shouldMount]);

  // *******************Super Coupons *******************************
  const { menuLoading } = hooks.useGetMenu();

  const [codeCoupon, setCodeCoupon] = useState<string | null>(null);

  useEffect(() => {
    const storedCode = localStorage.getItem("couponCode");
    setCodeCoupon(storedCode);
  }, []);

  const handleRemoveCoupon = () => {
    localStorage.removeItem("couponCode");
    localStorage.removeItem("discount_total");
    setCodeCoupon(null);
  };

  // const couponApply = (): JSX.Element => {
  //   return (
  //     <div className='couponApply-main'>
  //       <div onClick={handleCoupon}>View All Coupon</div>

  //       {codeCoupon ? (
  //         // <div onClick={handleRemoveCoupon} className='removeCoupon'>Remove</div>
  //         <></>
  //       ) : (
  //         <></>
  //       )}
  //     </div>
  //   );
  // };
  function stripHtmlTags(str: string): string {
    if (!str) return "";
    return str.replace(/<[^>]*>?/gm, "");
  }

  const discountSuccessfull = localStorage.getItem("discount_total") || "";

  const couponApplied = (): JSX.Element => {
    const cleanedDiscount = stripHtmlTags(discountSuccessfull);

    const handleCouponClick = (e: React.MouseEvent<HTMLDivElement>) => {
      // Prevent triggering if we're clicking on a child interactive element
      if (
        (e.target as HTMLElement).closest(".view-cart") ||
        (e.target as HTMLElement).closest(".removeCoupon")
      ) {
        return;
      }

      // Add clicked class for animation
      e.currentTarget.classList.add("clicked");
      setIsCouponAnimating(true);

      // Create ripple effect
      const ripple = document.createElement("span");
      ripple.classList.add("ripple-effect");

      // Position the ripple at click coordinates
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      // Add ripple to element
      e.currentTarget.appendChild(ripple);

      // Remove the ripple and clicked class after animation completes
      // const target = e.currentTarget;
      // const rippleEl = ripple;

      const target = e.currentTarget;
      const rippleEl = ripple;

      setTimeout(() => {
        if (target) target.classList.remove("clicked");
        if (rippleEl && rippleEl.remove) rippleEl.remove();
        if (target) target.classList.remove("clicked");
        if (rippleEl && rippleEl.remove) rippleEl.remove();
        setIsCouponAnimating(false);
      }, 600);


      // Navigate to coupon list on mobile
      if (window.innerWidth <= 767) {
        handleCoupon();
      }
    };

    // Determine if we should show "Apply Coupon" or "View All Coupons"
    const couponButtonText =
      window.innerWidth <= 767 ? "Apply" : "View All Coupons";

    // Format discount amount for better display
    const formatDiscount = (discount: string) => {
      if (discount === "0") return "No discount applied";

      // Check if the discount already has a currency symbol
      if (discount.includes("₹")) return `Discount: ${discount}`;
      return `Discount: ₹${discount}`;
    };

    return (
      <div
        className={`couponApplied-main ${isCouponAnimating ? "animating" : ""}`}
        onMouseEnter={(e) => e.currentTarget.classList.add("hovered")}
        onMouseLeave={(e) => e.currentTarget.classList.remove("hovered")}
        onClick={handleCouponClick}
        role="button"
        aria-label="Coupon section"
      >
        <div className="coupon-icon" aria-hidden="true">
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
            className="coupon-svg"
          >
            <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <div className="coupon-icon-bg"></div>
        </div>
        <div className="coupon-details">
          <div className="coupon-header">
            <h3>{codeCoupon ? "Applied Coupon" : "Discount Coupon"}</h3>
            {/* {codeCoupon && <span className="coupon-code">{codeCoupon}</span>} */}
             <div
            className="view-cart"
            onClick={(e) => {
              e.stopPropagation();
              handleCoupon();
            }}
            role="button"
            aria-label="View all available coupons"
          >
            <span>{couponButtonText}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6"></path>
            </svg>
          </div>
          </div>
          {cleanedDiscount && (
            <>
              <p className="discount-text">
                <span>{formatDiscount(cleanedDiscount)}</span>
              </p>
              {/* <hr className="divider" /> */}
            </>
          )}

        </div>
        {codeCoupon && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveCoupon();
            }}
            className="removeCoupon"
            role="button"
            aria-label="Remove coupon"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
        )}
        <div className="coupon-shine" aria-hidden="true"></div>
      </div>
    );
  };

  const renderButton = (): JSX.Element => {
    return (
      <button
        className={`checkout-button ${buttonLoading ? 'loading' : ''}`}
        onClick={handleCheckout}
        disabled={buttonLoading}
      >
        {buttonLoading ? (
          <>
            <span className="spinner-container">
              <span className="spinner"></span>
            </span>
            Processing...
          </>
        ) : (
          <>
            Proceed to Checkout
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
              style={{ marginLeft: "10px" }}
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </>
        )}
      </button>
    );
  };

  // ********************************Address*******************************

  const selectedAddress = selectedAddressId
    ? addresses?.find((a) => a.id === selectedAddressId)
    : null;
  const AddressWithButton = (): JSX.Element => {
    return (
      <>
        <div className="address-section">
          <div className="section-header addHeader">
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
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <h2>Delivery Address</h2>
          </div>
          {addresses?.length > 0 ? (
            <div>
              <div className="myAddressBoxWrap">
                {/* Show selected address if available */}
                {selectedAddress ? (
                  <div className="myaddress-getting-separate selected-address">
                    <label className="address-label">
                      <span>
                        {selectedAddress.flat_plot_no} {selectedAddress.wing}{" "}
                        {selectedAddress.building_name},<br />
                        {selectedAddress.address1} {selectedAddress.address2},{" "}
                        {selectedAddress.area_name},<br />
                        {selectedAddress.city_name},{" "}
                        {selectedAddress.state_name} - {selectedAddress.pincode}
                      </span>
                    </label>
                    <span
                      onClick={() => {
                        navigate("/select-Address", {
                          state: { id: selectedAddress.id },
                        });
                      }}
                      className="myAddressBoxWrap-Order-Edit"
                      style={{
                        marginTop: 10,
                        display: "inline-block",
                        cursor: "pointer",
                      }}
                    >
                      <i className="fa fa-edit" /> Edit
                    </span>
                  </div>
                ) : (
                  defaultAddress && (
                    <div className="myaddress-getting-separate default-address">
                      <label className="address-label">
                        <span>
                          {defaultAddress.flat_plot_no} {defaultAddress.wing}{" "}
                          {defaultAddress.building_name},<br />
                          {defaultAddress.address1} {defaultAddress.address2},{" "}
                          {defaultAddress.area_name},<br />
                          {defaultAddress.city_name},{" "}
                          {defaultAddress.state_name} - {defaultAddress.pincode}
                        </span>
                      </label>
                      <span
                        onClick={() => {
                          navigate("/select-Address", {
                            state: { id: defaultAddress.id },
                          });
                        }}
                        className="myAddressBoxWrap-Order-Edit"
                        style={{
                          marginTop: 10,
                          display: "inline-block",
                          cursor: "pointer",
                        }}
                      >
                        <i className="fa fa-edit" /> Edit
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                borderRadius: 10,
                marginBottom: 10,
                backgroundColor: "var(--white-color)",
                padding: 20,
              }}
            >
              <p style={{ textAlign: "center" }}>No addresses found.</p>
            </div>
          )}
        </div>
      </>
    );
  };

  // ********************************************************Address*******************************
  const cartCount = useSelector(
    (state: RootState) => state.cartSlice.cartCount
  );

  // console.log("shouldRefresh", shouldRefresh);

  // useEffect(() => {
  //   if (cartCount === 0) {
  //     localStorage.removeItem('curScreen');
  //   }
  // },[]);

  const renderContent = (): JSX.Element | null => {
    return (
      <main className="container scrollable order-container">
        {cartCount > 0 ? (
          <>
            <div className="order-header">
              <div className="header-left">{renderBackButton()}</div>
            </div>
            <div className="order-content">
              <div className="order-main-section">
                {AddressWithButton()}
                {renderDishes()}
                {couponApplied()}
                {renderSummary()}
                {renderButton()}
              </div>
            </div>
          </>
        ) : (
          <>
            <NoCartData />
          </>
        )}
      </main>
    );
  };

  const renderDishes = (): JSX.Element => {
    return (
      <section className="order-items">
        <div className="section-header">
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
          <h2>Your Items</h2>
        </div>
        <ul className="items-list">
          {totalPrice.map(
            (dish: DishType, index: number, array: DishType[]) => {
              const isLast = index === array.length - 1;
              return (
                <li key={dish.id} style={{ animationDelay: `${index * 0.1}s` }}>
                  <items.OrderItem dish={dish} isLast={isLast} />
                </li>
              );
            }
          )}
        </ul>
      </section>
    );
  };

  // Animation effect for the page
  useEffect(() => {
    // Set opacity to 1 after component mounts for fade-in effect
    setTimeout(() => setOpacity(1), 100);
  }, []);

  const handleHomeMenu = (screen: TabScreens) => {
    if (screen) {
      dispatch(actions.setScreen(screen));
    } else {
      console.error("Screen is not defined");
    }
  };

  const renderBackButton = (): JSX.Element => {
    return (
      <button
        className="back-button"
        onClick={() => handleHomeMenu(TabScreens.Home)}
      >
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
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>
    );
  };

  const renderSummary = (): JSX.Element => {
    return (
      <>
        <section className="summary-section">
          <div className="section-header">
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
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            <h2>Order Summary</h2>
          </div>
          <div
            className="row-center-space-between"
            style={{ marginBottom: 13 }}
          >
            <span
              className="t14"
              style={{ color: "var(--main-color)", fontWeight: 500 }}
            >
              Subtotal
            </span>
            <span className="t14" style={{ color: "var(--main-color)" }}>
              ₹{" "}
              {totalPrice
                .reduce((total, elem) => {
                  return (
                    total +
                    elem.quantity *
                    elem.price *
                    (elem.no_of_deliveries === "0"
                      ? "1"
                      : elem.no_of_deliveries)
                  );
                }, 0)
                .toFixed(2)}
            </span>
          </div>

          <div className="row-center-space-between rowLine">
            <span className="t14">
              Extra Discount of ₹
              {extraDiscountShow.reduce(
                (acc, val) => acc + parseInt(val, 10),
                0
              )}{" "}
              applied
            </span>
            <span className="t14">
              ₹
              {extraDiscountShow.reduce(
                (acc, val) => acc + parseInt(val, 10),
                0
              )}
            </span>
          </div>
          {/******************************************************** */}
          <div className="row-center-space-between rowLine">
            <span className="t14"> Discount on Free Deliveries</span>
            <span className="t14">
              ₹{" "}
              {superPoint &&
                superPoint.optionListing &&
                superPoint.optionListing.length > 0
                ? superPoint.optionListing
                  .map((elem: any) => {
                    return (
                      (elem.price - elem.discount) *
                      elem.no_of_free_deliveries
                    );
                  })
                  .reduce((acc: number, current: number) => acc + current, 0)
                : 0}
            </span>
          </div>
          {/* *************************************************** */}

          {localStorage.getItem("coupon") ? (
            <>
              {" "}
              <div className="row-center-space-between rowLine">
                {localStorage.getItem("coupon") ? <> </> : <></>}

                <span className="t14">
                  Coupon {localStorage.getItem("couponCode") || "₹ 0"} applied
                  {localStorage.getItem("couponCode") &&
                    ` of ₹${cartDetails?.after_discount_total || 0}`}
                  !
                </span>
                {localStorage.getItem("couponCode") ? (
                  <>
                    <span className="t14">
                      ₹{cartDetails?.after_discount_total}
                    </span>{" "}
                  </>
                ) : (
                  <> ₹ 0 </>
                )}
              </div>{" "}
            </>
          ) : (
            <></>
          )}
          <div className="row-center-space-between rowLine">
            <span className="t14">GST</span>
            {localStorage.getItem("couponCode") ? (
              <>
                <span className="t14">₹{cartDetails?.gst_tax_total}</span>{" "}
              </>
            ) : (
              <> ₹ 0 </>
            )}
          </div>

          {/* ***************************yyyy*******************Orderrrrrrrrrrr */}
          <div className="row-center-space-between rowLine super-coins-row">
            <div className="super-coins-wrapper">
              <label className="custom-coin-checkbox">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                />
                <div className="silver-coin">
                  <div className="coin-inner">
                    <div className="coin-face">
                      {isChecked ? (
                        // Applied coin SVG - checkmark icon
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
                          <path
                            d="M7 13l3 3 7-7"
                            strokeWidth="2"
                            stroke="#1a712e"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        // Default coin SVG - plus icon
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
                          <path d="M12 6v12M8 12h8" />
                        </svg>
                      )}
                    </div>
                    <div className="coin-edge"></div>
                  </div>
                </div>
                <span
                  className="t14 super-coins-label"
                  style={{ color: "#1a712e" }}
                >
                  Super Coins
                </span>
              </label>
              <div
                className={`coins-value ${amountAnimating ? "animate" : ""}`}
              >
                <span className="t14 coins-amount" style={{ color: "#1a712e" }}>
                  {superPoint?.available_points ? (
                    <>({superPoint?.available_points})</>
                  ) : (
                    <>(0)</>
                  )}
                </span>
              </div>
            </div>
            <div className="coins-redemption">
              <span
                className={`t14 redemption-amount ${
                  amountAnimating ? "animate" : ""
                }`}
              >
                ₹{redeemedAmount ? <>{redeemedAmount}</> : <>0</>}
              </span>
              <span className="redemption-label">savings</span>
            </div>
          </div>

          {/* ***********************Ordereeeeeeeeeeeeeee***************** */}

          <div className='row-center-space-between'>
            <h4>Total</h4>

            {/* Case when no cart total is available */}
            {!cartDetails?.cart_final_grand_total ? (
              <h4>
                ₹{" "}
                {(
                  totalPrice.reduce((total, elem) => {
                    if (
                      !elem ||
                      isNaN(Number(elem.quantity)) ||
                      isNaN(Number(elem.price)) ||
                      typeof elem.no_of_deliveries === "undefined"
                    ) {
                      return total;
                    }
                    const deliveryCount =
                      elem.no_of_deliveries === "0"
                        ? 1
                        : Number(elem.no_of_deliveries) -
                          (Number(elem.no_of_free_deliveries) || 0);
                    const lineTotal =
                      Number(elem.quantity) *
                      Number(elem.price) *
                      deliveryCount;
                    return total + lineTotal;
                  }, 0) -
                  extraDiscountShow.reduce((sum, val) => sum + Number(val), 0) -
                  (Number(extraDiscount) || 0) -
                  (redeemedAmount > 0 ? redeemedAmount : 0)
                ).toFixed(2)}
              </h4>
            ) : localStorage.getItem("couponCode") || redeemedAmount > 1 ? (
              <h4>
                {/* {cartDetails?.after_discount_total} */}₹{" "}
                {(() => {
                  const cartTotal = Subtotal.cart_grand_total;
                  //  totalPrice
                  //   .reduce((total, elem) => {
                  //     // console.log("aaaa", total);
                  //     const deliveryCount = elem.no_of_deliveries === '0'
                  //       ? 1
                  //       : Number(elem.no_of_deliveries) - (Number(elem.no_of_free_deliveries) || 0);
                  //     return total + elem.quantity * elem.price * deliveryCount;
                  //   }, 0)
                  //   .toFixed(2);
                  let discount = 0;
                  if (localStorage.getItem("couponCode")) {
                    discount = Number(cartDetails?.after_discount_total || 0);
                  }
                  const gst = Number(cartDetails?.gst_tax_total || 0);
                  const total =
                    Number(cartTotal) -
                    (Number(extraDiscount) || 0) +
                    gst -
                    (redeemedAmount > 0 ? redeemedAmount : 0) -
                    discount;
                  return total.toLocaleString("en-IN");
                })()}
              </h4>
            ) : (
              <h4>
                ₹{" "}
                {/* {totalPrice
                    .reduce((total, elem) => {
                      const deliveryCount = elem.no_of_deliveries === '0' ? 1 : Number(elem.no_of_deliveries);
                      return total + elem.quantity * elem.price * deliveryCount;
                    }, 0)
                    .toFixed(2)} */}
                {(
                  totalPrice.reduce((total, elem) => {
                    if (
                      !elem ||
                      isNaN(Number(elem.quantity)) ||
                      isNaN(Number(elem.price)) ||
                      isNaN(Number(elem.discount)) ||
                      typeof elem.no_of_deliveries === "undefined"
                    ) {
                      return total;
                    }
                    const deliveryCount =
                      elem.no_of_deliveries === "0"
                        ? 1
                        : Number(elem.no_of_deliveries) -
                          (Number(elem.no_of_free_deliveries) || 0);
                    const lineTotal =
                      Number(elem.quantity) *
                      Number(elem.price) *
                      deliveryCount;
                    return total + lineTotal;
                  }, 0) -
                  totalPrice.reduce((discountTotal, elem) => {
                    if (
                      !elem ||
                      isNaN(Number(elem.discount)) ||
                      isNaN(Number(elem.quantity))
                    ) {
                      return discountTotal;
                    }
                    return (
                      discountTotal +
                      Number(elem.discount) * Number(elem.quantity)
                    );
                  }, 0) -
                  (Number(extraDiscount) || 0) -
                  (redeemedAmount > 0 ? redeemedAmount : 0)
                ).toFixed(2)}
              </h4>
            )}
          </div>

        </section>
      </>
    );
  };

  const handleCoupon = () => {
    navigate("/coupon-list");
  };

  const renderLoading = (): JSX.Element | null => {
    if (loading || menuLoading) return <components.Loader />;
    return null;
  };

  return (
    <div id="screen" style={{ opacity }}>
      {renderContent()}
      {renderLoading()}
      {showModal && (
        <div className="popup-modal super-coins-modal">
          <div className="popup-content">
            <div className="coins-animation">
              <Lottie
                animationData={SuperCoins}
                style={{ width: 150, height: 150 }}
              />
            </div>
            <div className="coins-message">
              <p>Applying Super Coins!</p>
              <div className="coins-value-display">
                <span className="coins-label">Redeeming</span>
                <span className="coins-amount">
                  {superPoint?.available_points || 0}
                </span>
                <span className="coins-label">coins for</span>
                <span className="discount-amount">₹{redeemedAmount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



