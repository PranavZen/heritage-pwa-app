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

export const Order: React.FC = () => {
  const location = useLocation();
  const couponCode = location.state?.couponCode;

  // const selectedAddressId = location.state?.addressId;
  const selectedAddressId = localStorage.getItem("selectedAddressId");

  // console.log('aaaaaaaaaa', selectedAddressId);

  const dispatch = hooks.useDispatch();
  const [opacity, setOpacity] = useState<number>(0);
  const [totalPrice, SetTotalPrice] = useState<any[]>([]);
  const [freeNoOfdeliveries, SetfreeNoOfdeliveries] = useState<any[]>([]);

  // console.log("freeNoOfdeliveries", freeNoOfdeliveries);

  const [addressId, SetAddressId] = useState("");
  const [superPoint, setSuperPoint] = useState<any>(null);

  // console.log("superPoint", superPoint.optionListing
  // );

  const [loading, setLoading] = useState(false);
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

  const [isChecked, setIsChecked] = useState(false);
  const [redeemedAmount, setRedeemedAmount] = useState(0);

  // console.log("sssssss", redeemedAmount);

  const shouldRefresh = useSelector(
    (state: RootState) => state.cartSlice.shouldRefresh
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);

  const [extraDiscount, setExtraDiscount] = useState<any[]>([]);
  const [extraDiscountShow, setExtraDiscountShow] = useState<any[]>([]);

  // console.log("extraDiscountShow", extraDiscountShow);

  const [superPointCoins, SetSuperPoint] = useState<number>(0);

  // console.log("superPointCoins", superPointCoins);

  const handleCheckboxChange = (e: any) => {
    const checked = e.target.checked;
    setIsChecked(checked);
    // setIsApplying(true);
    // setShowModal(true);
    if (checked && superPoint) {
      setRedeemedAmount(superPoint.available_amount);
      SetSuperPoint(superPoint.available_points);
    } else {
      setRedeemedAmount(0);
      SetSuperPoint(0);
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
        // console.log("nmnmnmnmnmnmnmnmmnxxx", response);

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
          response.data.optionListing.map(
            (elem: any) => elem.no_of_deliveries * elem.discount * elem.quantity
          )
        );
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
  }, [cityId, c_id, shouldRefresh]);

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
    const formData = new FormData();
    formData.append("c_id", c_id || "");
    formData.append(
      "addresses_id",
      String(addressId) || selectedAddressId || ""
    );
    formData.append("redeem_reward_points", String(superPointCoins));

    try {
      const response = await axios.post(
        `https://heritage.bizdel.in/app/consumer/services_v11/placeOrder`,
        formData
      );
      if (response.data.status === "success") {
        notification.success({ message: response.data.message });
        // setOrderPlaced(true);
        navigate("/thank-you");
        localStorage.removeItem("couponCode");
      } else if (response.data.status === "fail") {
        notification.error({
          message: response.data.message || "Order placement failed",
        });
      }
    } catch (error) {
      setLoading(false);
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

  const [cId, setCId] = useState<string | null>(null);

  useEffect(() => {
    const storedCId = localStorage.getItem("c_id");
    if (storedCId) {
      setCId(storedCId);
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
  }, []);

  // *******************Super Coupons *******************************
  const { menuLoading, menu } = hooks.useGetMenu();

  const { list, subtotal, delivery, total } = useSelector(
    (state: RootState) => state.cartSlice
  );

  const [codeCoupon, setCodeCoupon] = useState<string | null>(null);

  useEffect(() => {
    const storedCode = localStorage.getItem("couponCode");

    // console.log("storedCodemmmm", storedCode);
    setCodeCoupon(storedCode);
  });

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

    // console.log("cleanedDiscountcleanedDiscount", cleanedDiscount)
    return (
      <div className="couponApplied-main">
        <div className="coupon-details">
          {cleanedDiscount && (
            <>
              <p className="discount-text">
                {cleanedDiscount === "0" ? <> </> : <> {cleanedDiscount}</>}
              </p>
              <hr className="divider" />
            </>
          )}
          <div className="view-cart" onClick={handleCoupon}>
            View All Coupons
          </div>
        </div>
        {codeCoupon && (
          <div onClick={handleRemoveCoupon} className="removeCoupon">
            Remove
          </div>
        )}
      </div>
    );
  };

  const renderButton = (): JSX.Element => {
    return <components.Button text="Checkout" onClick={handleCheckout} />;
  };

  // ********************************Address*******************************
  const selectedAddressIdd = useSelector((state: any) => state);

  // console.log("selectedAddressIdd", selectedAddressIdd);

  const selectedAddress = selectedAddressId
    ? addresses?.find((a) => a.id === selectedAddressId)
    : null;
  const AddressWithButton = (): JSX.Element => {
    return (
      <>
        <div>
          {addresses?.length > 0 ? (
            <div className="">
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
      <main className="container scrollable">
        {cartCount > 0 ? (
          <>
            {renderBackButton()}
            {renderDishes()}
            {couponApplied()}
            {renderSummary()}
            {AddressWithButton()}
            {renderButton()}
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
      <section style={{ marginBottom: 20 }}>
        <ul style={{ paddingTop: 10 }}>
          {totalPrice.map(
            (dish: DishType, index: number, array: DishType[]) => {
              const isLast = index === array.length - 1;
              return (
                <items.OrderItem key={dish.id} dish={dish} isLast={isLast} />
              );
            }
          )}
        </ul>
      </section>
    );
  };

  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    setShowButton(true);
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
      <button onClick={() => handleHomeMenu(TabScreens.Home)}>
        <img src={FaBackward} alt="" width={30} />
      </button>
    );
  };

  const renderSummary = (): JSX.Element => {
    return (
      <>
        <section
          style={{
            padding: 20,
            borderRadius: 10,
            marginBottom: 20,
            border: "1px solid var(--main-turquoise)",
          }}
        >
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

          <div
            className="row-center-space-between"
            style={{
              paddingBottom: 13,
              marginBottom: 20,
              borderBottom: "1px solid #DBE9F5",
            }}
          >
            <span className="t14">
              Extra Discount of {extraDiscountShow ? extraDiscountShow : "0"}{" "}
              applied{" "}
            </span>

            <span className="t14"> ₹{extraDiscountShow} </span>
          </div>
          {/******************************************************** */}
          <div
            className="row-center-space-between"
            style={{
              paddingBottom: 13,
              marginBottom: 20,
              borderBottom: "1px solid #DBE9F5",
            }}
          >
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
              <div
                className="row-center-space-between"
                style={{
                  paddingBottom: 13,
                  marginBottom: 20,
                  borderBottom: "1px solid #DBE9F5",
                }}
              >
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
          <div
            className="row-center-space-between"
            style={{
              paddingBottom: 13,
              marginBottom: 20,
              borderBottom: "1px solid #DBE9F5",
            }}
          >
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
          <div
            className="row-center-space-between"
            style={{
              paddingBottom: 13,
              marginBottom: 20,
              borderBottom: "1px solid #DBE9F5",
            }}
          >
            <div>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={handleCheckboxChange}
              />
              <span className="t14" style={{ paddingLeft: "4px" }}>
                Super Coins
              </span>
              <span className="t14" style={{ paddingLeft: "4px" }}>
                (
                {superPoint?.available_points ? (
                  <> {superPoint?.available_points} </>
                ) : (
                  <> 0</>
                )}
                )
              </span>
            </div>
            <span className="t14">
              ₹{redeemedAmount ? <> {redeemedAmount}</> : <> 0 </>}
            </span>
          </div>

          {/* ***********************Ordereeeeeeeeeeeeeee***************** */}

          <div className="row-center-space-between">
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

                    return total + lineTotal - (Number(extraDiscount) || 0);
                  }, 0) - (redeemedAmount > 0 ? redeemedAmount : 0)
                ).toFixed(2)}
              </h4>
            ) : localStorage.getItem("couponCode") || redeemedAmount > 1 ? (
              <h4>
                ₹{" "}
                {(() => {
                  const cartTotal = totalPrice
                    .reduce((total, elem) => {
                      const deliveryCount =
                        elem.no_of_deliveries === "0"
                          ? 1
                          : Number(elem.no_of_deliveries) -
                            (Number(elem.no_of_free_deliveries) || 0);
                      return total + elem.quantity * elem.price * deliveryCount;
                    }, 0)
                    .toFixed(2);

                  // console.log("aaaaa", cartTotal);

                  let discount = 0;

                  if (localStorage.getItem("couponCode")) {
                    discount = Number(cartDetails?.after_discount_total || 0);
                  }

                  // console.log("bbb", discount)

                  const gst = Number(cartDetails?.gst_tax_total || 0);

                  // console.log("cccc", gst);

                  const deliveryMultiplier = deliveries.reduce(
                    (total, currentValue) => total + Number(currentValue),
                    0
                  );

                  // console.log("ddddd", deliveryMultiplier)

                  // const total = (Number(cartTotal) - discount) + gst - (redeemedAmount > 0 ? redeemedAmount : 0);
                  const total =
                    Number(cartTotal) -
                    discount -
                    (Number(extraDiscount) || 0) +
                    gst -
                    (redeemedAmount > 0 ? redeemedAmount : 0);

                  // console.log("bbbb", total);
                  return total.toLocaleString("en-IN");
                })()}
              </h4>
            ) : (
              <h4>
                ₹{" "}
                {totalPrice
                  .reduce((total, elem) => {
                    const deliveryCount =
                      elem.no_of_deliveries === "0"
                        ? 1
                        : Number(elem.no_of_deliveries);
                    return total + elem.quantity * elem.price * deliveryCount;
                  }, 0)
                  .toFixed(2)}
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
        <div className="popup-modal">
          <div className="popup-content">
            <Lottie
              animationData={SuperCoins}
              style={{ width: 150, height: 150 }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
