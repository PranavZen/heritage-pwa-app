import React, { useEffect, useState } from "react";
import { hooks } from "../hooks";
import { svg } from "../assets/svg";
import { Modal, notification } from "antd";
import axios from "axios";
import { DishType } from "../types";
import { actions } from "../store/actions";
import { setCartCount, setShouldRefresh } from "../store/slices/cartSlice";
import {
  fetchWishlist,
  toggleWishlistItem,
} from "../store/slices/wishlistSlice";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { components } from "../components";
import DatePicker from "react-datepicker";
import { addItemToCartAPI } from "../store/slices/addItemToCartApi";

type Props = {
  dish: DishType;
  isLast: boolean;
  selectedCategory: string;
};

export const MenuListItem: React.FC<Props> = ({
  dish,
  isLast,
  selectedCategory,
}) => {
  const showSubscribe = dish.subscription_product;
  // console.log("dishdishdishdishdish", showSubscribe);
  const dispatch = hooks.useDispatch();
  const [cartId, setCartId] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const shouldRefresh = useSelector(
    (state: RootState) => state.cartSlice.shouldRefresh
  );

  const [orderType, setOrderType] = useState<number>(0);
  console.log("orderType", orderType);
  const [cartItemId, setCartItemId] = useState<string | null>(null);
  const [refreshData, setRefreshData] = useState<boolean>(false);

  useEffect(() => {
    if (shouldRefresh) {
      setOrderType(0);
      setShouldRefresh(false);
    }
  }, [shouldRefresh]);

  // console.log("aaasssss", cartItemId);

  const c_id = localStorage.getItem("c_id") || "";

  const cityId = localStorage.getItem("cityId") || "";

  const handleRemoveFromCart = async (event: React.MouseEvent) => {
    event.stopPropagation();

    if (!cartItemId) return;

    if (quantity > 1) {
      handleUpdateCart(quantity - 1);
    } else {
      try {
        const formData = new FormData();
        formData.append("id", cartItemId);
        formData.append("c_id", c_id);

        const response = await axios.post(
          "https://heritage.bizdel.in/app/consumer/services_v11/deleteCartItem",
          formData
        );

        if (response.data.status === "success") {
          notification.success({
            message: "Success",
            description: response.data.message,
          });
          dispatch(actions.removeItemCompletely({ ...dish }));
          setQuantity(0);
          setCartItemId(null);
          dispatch(setCartCount(Number(response.data.cart_count)));
          setOrderType(0);
          dispatch(setShouldRefresh(true));
        } else {
          notification.error({
            message: "Error",
            description: response.data.message || "Failed to remove item.",
          });
        }
      } catch (error) {
        // console.error('Error removing item from cart:', error);
        notification.error({
          message: "Error",
          description: "Failed to remove item from cart.",
        });
      }
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const fetchCartData = async () => {
    try {
      const formData = new FormData();
      formData.append("city_id", cityId);
      formData.append("c_id", c_id);
      formData.append("next_id", "0");
      formData.append("area_id", localStorage.getItem("area_id") || "");
      formData.append("cart_type", "2");

      const response = await axios.post(
        "https://heritage.bizdel.in/app/consumer/services_v11/getCartDatasrv",
        formData
      );

      if (response.data.optionListing) {
        const matchedItem = response.data.optionListing.find(
          (item: any) =>
            item.cart_product_option_value_id === dish.product_option_value_id
        );
        setLoading(true);

        if (matchedItem) {
          setQuantity(Number(matchedItem.quantity) || 1);
          setCartItemId(String(matchedItem.cart_id));
          setOrderType(matchedItem.order_type);
          dispatch(setShouldRefresh(true));
        } else {
          setQuantity(0);
          setCartItemId(null);
        }
      }
    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, [cityId, c_id, dish, shouldRefresh, refreshData]);

  const HandleAddToCart = async () => {
    if (!c_id) {
      Modal.confirm({
        title: "Please Sign In",
        content: "You need to sign in to add items to your cart.",
        onOk() {
          navigate("/");
        },
        onCancel() {},
        cancelText: "Cancel",
        okText: "Sign In",
      });
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("c_id", c_id);
      formData.append("product_id", String(dish.product_id));
      formData.append("package_id", "13");
      formData.append("product_option_id", String(dish.product_option_id));
      formData.append(
        "product_option_value_id",
        String(dish.product_option_value_id)
      );
      formData.append("quantity", "1");
      formData.append("weight", String(dish.weight));
      formData.append("weight_unit", String(dish.weight_unit));
      formData.append("delivery_preference", "0");
      formData.append("no_of_deliveries", "0");
      formData.append("order_date", getTomorrowDate());
      formData.append("order_type", "2");

      const response = await axios.post(
        "https://heritage.bizdel.in/app/consumer/services_v11/addItemToCart",
        formData
      );

      if (response.data.status === "success") {
        notification.success({
          message: "Success",
          description: response.data.message,
        });

        dispatch(actions.addToCart({ ...dish, quantity: 1 }));
        // setQuantity(1);
        dispatch(setShouldRefresh(true));
        const newCartId =
          response.data.cart_id ||
          response.data.data?.cart_id ||
          response.data.data?.id ||
          null;

        if (newCartId) {
          setCartItemId(String(newCartId));
        } else {
          await fetchCartData();
        }
        dispatch(setShouldRefresh(true));
      } else {
        notification.error({
          message: "Error",
          description: response.data.message || "Something went wrong.",
        });
      }
    } catch (error) {
      // console.error('Error adding to cart:', error);
      notification.error({
        message: "Error",
        description: "Failed to add item to cart.",
      });
    }
  };
  const handleupdatetheAddToCartt = async () => {
    if (deliveries < 1) {
      notification.error({ message: "Please select valid delivery days." });
      return;
    }

    const c_id = localStorage.getItem("c_id");
    if (!cartItemId) {
      Modal.confirm({
        title: "Please Add the Item",
        content: "You need to add to cart first.",
        onCancel() {},
        cancelText: "Cancel",
        okText: "Ok",
      });
      return;
    }

    if (!c_id) {
      Modal.confirm({
        title: "Please Sign In",
        content: "You need to sign in to update the cart.",
        onOk() {
          navigate("/");
        },
        onCancel() {},
        cancelText: "Cancel",
        okText: "Sign In",
      });
      return;
    }
    setIsModalOpen(false);
    // setIsAlternateModalOpen(false);

    const formData = new FormData();
    // Date validation
    const formattedDate = startDate
      ? new Date(startDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];
    formData.append("id", cartItemId || "");
    formData.append("c_id", c_id);
    formData.append("package_days", "mon,tue,wed,thu,fri,sat,sun");
    formData.append("package_id", "13");
    formData.append("quantity", String(quantity));
    formData.append("delivery_preference", String(deliveryPreference));
    formData.append("no_of_deliveries", String(deliveries));
    formData.append("order_date", formattedDate);
    const orderType = deliveryPreference !== "0" ? "1" : "2";
    formData.append("order_type", orderType);
    try {
      const response = await axios.post(
        "https://heritage.bizdel.in/app/consumer/services_v11/updateCartItem",
        formData
      );

      // console.log('zzz', response);

      if (response.data.status === "success") {
        notification.success({ message: response.data.message });
        // window.location.reload();
      } else {
        notification.error({ message: "Failed to update cart. Try again!" });
      }
    } catch (error) {
      notification.error({ message: "Error updating cart!" });
    }
  };
  const handleUpdateCart = async (newQuantity: number) => {
    if (newQuantity < 0 || !cartItemId) return;

    try {
      const formData = new FormData();
      formData.append("id", cartItemId);
      formData.append("c_id", c_id);
      formData.append("package_id", "13");
      formData.append("quantity", String(newQuantity));
      formData.append("delivery_preference", "0");
      formData.append("no_of_deliveries", "0");
      formData.append("order_date", getTomorrowDate());
      formData.append("order_type", "2");

      const response = await axios.post(
        "https://heritage.bizdel.in/app/consumer/services_v11/updateCartItem",
        formData
      );

      if (response.data.status === "success") {
        setQuantity(newQuantity);
        notification.success({
          message: "Success",
          description: response.data.message,
        });
        dispatch(setShouldRefresh(true));
      } else {
        notification.error({
          message: "Error",
          description: response.data.message || "Failed to update quantity.",
        });
      }
    } catch (error) {
      // console.error('Error updating cart:', error);
      notification.error({
        message: "Error",
        description: "Failed to update item quantity.",
      });
    }
  };

  const navigate = hooks.useNavigate();
  // const { ifInWishlist, addToWishlist, removeFromWishlist } =
  hooks.useWishlistHandler();

  // if (loading) {
  //   return <components.Loader />;
  // }

  const wishlist = useSelector((state: RootState) => state.wishlistSlice.list);

  const wishlistHandler = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();

    const c_id_num = parseInt(localStorage.getItem("c_id") || "0");
    if (!c_id_num) {
      Modal.confirm({
        title: "Please Sign In",
        content: "You need to sign in to manage your wishlist.",
        onOk() {
          navigate("/");
        },
        cancelText: "Cancel",
        okText: "Sign In",
      });
      return;
    }

    const isInWishlist = wishlist.some(
      (item) => item.option_value_id === dish.option_value_id
    );

    const type = isInWishlist ? 2 : 1;

    try {
      const resultAction = await dispatch(
        toggleWishlistItem({
          product_id: dish.product_id,
          product_option_id: dish.product_option_id,
          product_option_value_id: dish.product_option_value_id,
          c_id: c_id_num,
          type,
        })
      );

      if (toggleWishlistItem.fulfilled.match(resultAction)) {
        dispatch(fetchWishlist());
      }
    } catch (error) {
      console.error("Wishlist action failed:", error);
    }
  };

  const isInWishlist = wishlist.some(
    (item) => item.option_value_id === dish.option_value_id
  );

  // ****************************************************************************************

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState(getTomorrowDate());
  const [deliveryPreference, setDeliveryPreference] = useState("1");

  // console.log("deliveryPreference", deliveryPreference);

  const [deliveryOptionsPreference, setDeliveryOptionsPreference] = useState<
    any[]
  >([]);
  const [deliveries, setDeliveries] = useState<number>(30);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const today = new Date();
  today.setDate(today.getDate() + 1);
  const minDate = today.toISOString().split("T")[0];

  const handleOpenModal = () => {
    const c_id = localStorage.getItem("c_id");
    if (!c_id) {
      Modal.confirm({
        title: "Please Sign In",
        content: "You need to sign in to add items to your cart.",
        okText: "Sign In",
        cancelText: "Cancel",
        className: "sign-in-modal",
        centered: true,
        onOk() {
          navigate("/");
        },
      });
      return;
    }
    setIsModalOpen(true);
  };

  const setIsModalOpenDaily = () => {
    setIsModalOpen(false);
  };

  const addToCartApi = async (cartData: any) => {
    if (!c_id) {
      Modal.confirm({
        title: "Please Sign In",
        content: "You need to sign in to add items to your cart.",
        okText: "Sign In",
        cancelText: "Cancel",
        className: "sign-in-modal",
        centered: true,
        onOk() {
          navigate("/");
        },
        onCancel() {},
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("c_id", String(c_id || "1"));
      formData.append("product_id", String(cartData.product_id));
      formData.append("package_id", "13");
      formData.append("package_days", "0");

      // Apply fallback for product_option_id and product_option_value_id
      const productOptionId =
        cartData.product_option_id || localStorage.getItem("product_option_id");
      const productOptionValueId =
        cartData.product_option_value_id ||
        localStorage.getItem("product_option_value_id");

      // If both are still missing, handle the error
      if (!productOptionId || !productOptionValueId) {
        console.error(
          "Error: product_option_id or product_option_value_id is missing"
        );
        notification.error({
          message: "Error",
          description: "Missing product options. Please try again.",
        });
        return null;
      }

      formData.append("product_option_id", String(productOptionId));
      formData.append("product_option_value_id", String(productOptionValueId));
      // formData.append('quantity', String(localQuantity));
      formData.append("quantity", String("1"));
      formData.append("weight", String(cartData.weight));
      formData.append("weight_unit", String(cartData.weight_unit));
      formData.append(
        "delivery_preference",
        String(cartData.deliveryPreference) || String(1)
      );
      formData.append("no_of_deliveries", String(cartData.deliveries));
      formData.append("order_date", startDate);
      formData.append("order_type", "1");

      const response = await axios.post(
        "https://heritage.bizdel.in/app/consumer/services_v11/addItemToCart",
        formData
      );

      if (response.data.status === "success") {
        notification.success({
          message: "Success",
          description: response.data.message,
        });
        dispatch(actions.addToCart({ ...dish, quantity: 1 }));
        setRefreshData(true);
        setQuantity(1);
        dispatch(setShouldRefresh(true));

        return response.data.cart_count;
      } else {
        notification.error({
          message: "Error",
          description: response.data.message || "Something went wrong.",
        });
        return null;
      }
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Error",
        description: "Failed to add item to cart. Please try again later.",
      });
      return null;
    }
  };

  const handleAddToCartWithPreferences = async () => {
    try {
      const dishWithPreferences = {
        ...dish,
        startDate,
        selectedDays,
        deliveryPreference,
        deliveries: deliveries ?? 0,
      };

      const cartCount = await addToCartApi(dishWithPreferences);

      if (cartCount) {
        dispatch(actions.addToCart(dishWithPreferences));
        dispatch(setShouldRefresh(true));
        setIsModalOpen(false);
      } else {
        notification.error({
          message: "Failed to add to cart. Please try again.",
        });
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      notification.error({
        message: "Something went wrong while adding to cart.",
      });
    }
  };

  const handleUpdateCartSubscription = async () => {
    if (deliveries < 1) {
      notification.error({ message: "Please select valid delivery days." });
      return;
    }

    const c_id = localStorage.getItem("c_id");
    if (!cartItemId) {
      Modal.confirm({
        title: "Please Add the Item",
        content: "You need to add to cart first.",
        cancelText: "Cancel",
        okText: "Ok",
      });
      return;
    }

    if (!c_id) {
      Modal.confirm({
        title: "Please Sign In",
        content: "You need to sign in to update the cart.",
        onOk() {
          navigate("/");
        },
        cancelText: "Cancel",
        okText: "Sign In",
      });
      return;
    }

    setIsModalOpen(false);

    const formData = new FormData();
    const formattedDate = startDate
      ? new Date(startDate).toISOString().split("T")[0]
      : getTomorrowDate();
    formData.append("id", cartItemId || "");
    formData.append("c_id", c_id);
    formData.append("package_days", "mon,tue,wed,thu,fri,sat,sun");
    formData.append("package_id", "13");
    formData.append("quantity", String(quantity));
    formData.append("delivery_preference", deliveryPreference);
    formData.append("no_of_deliveries", String(deliveries));
    formData.append("order_date", formattedDate);
    const orderType = deliveryPreference !== "0" ? "1" : "2";
    formData.append("order_type", orderType);

    try {
      const response = await axios.post(
        "https://heritage.bizdel.in/app/consumer/services_v11/updateCartItem",
        formData
      );

      if (response.data.status === "success") {
        notification.success({ message: response.data.message });
      } else {
        notification.error({ message: "Failed to update cart. Try again!" });
      }
    } catch (error) {
      notification.error({ message: "Error updating cart!" });
    }
  };

  useEffect(() => {
    const deliveryData = async () => {
      const formData = new FormData();
      formData.append("c_id", c_id || "null");
      formData.append("city_id", cityId || "null");
      formData.append("product_option_value_id", "326");
      try {
        const response = await axios.post(
          `https://heritage.bizdel.in/app/consumer/services_v11/productDetailsByOption`,
          formData
        );

        // console.log("paaaaaaaaaaaaaaa", response);

        setDeliveryOptionsPreference(response.data.productDetails);
      } catch (error) {
        // console.log(error);
      }
    };
    deliveryData();
  }, []);
  return (
    <>
      <div className="product-item">
        <button
          className="wishlist-button"
          onClick={wishlistHandler}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            style={{
              fill: isInWishlist ? "#dc3545" : "#aaaaaa",
              transition: "fill 0.3s ease",
            }}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>

        <div className="product-content">
          <div
            className="product-image-container"
            onClick={() =>
              navigate(`/dish/${dish.option_name}`, {
                state: { dish, showSubscribe },
              })
            }
          >
            {Number(dish.discount ?? 0) > 0 && (
              <div className="discount-badge">
                {Math.round((Number(dish.discount) / Number(dish.price)) * 100)}
                % OFF
              </div>
            )}
            <img src={dish.option_value_image} alt={dish.name} loading="lazy" />
          </div>
          <div className="product-details">
            <div>
              <h3
                className="product-name"
                onClick={() =>
                  navigate(`/dish/${dish.option_name}`, {
                    state: { dish, showSubscribe },
                  })
                }
              >
                {dish.option_value_name}
              </h3>
              <span className="product-weight">
                {dish.weight} {dish.weight_unit}
              </span>
              <div className="product-price">
                {Number(dish.discount ?? 0) > 0 ? (
                  <>
                    <span className="original-price">₹{dish.price}</span>
                    <span>
                      ₹{Number(dish.price ?? 0) - Number(dish.discount ?? 0)}
                    </span>
                  </>
                ) : (
                  <span>₹{dish.price}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="product-actions">
          <div className="cart-controls">
            {quantity < 1 && orderType !== 1 ? (
              <button className="cart-button" onClick={HandleAddToCart}>
                <span> Add </span>
              </button>
            ) : (
              String(orderType) === "2" && (
                <>
                  <button
                    className="cart-button quantity-button"
                    onClick={(event) =>
                      quantity === 1
                        ? handleRemoveFromCart(event)
                        : handleUpdateCart(quantity - 1)
                    }
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12H19"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <span className="quantity">{quantity}</span>
                  <button
                    className="cart-button quantity-button"
                    onClick={() => handleUpdateCart(quantity + 1)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 5V19"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5 12H19"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </>
              )
            )}

            {/* Subscribe / Update Subscription */}

            {String(showSubscribe) === "1" &&
              String(orderType) !== "2" &&
              (cartItemId ? (
                <button
                  className="cart-button"
                  style={{
                    marginLeft: "10px",
                    backgroundColor: "#17a2b8",
                    color: "#fff",
                  }}
                  onClick={handleOpenModal}
                >
                  Upgrade
                </button>
              ) : (
                <button
                  className="cart-button"
                  style={{
                    marginLeft: "10px",
                    backgroundColor: "#ffc107",
                    color: "#333",
                  }}
                  onClick={handleOpenModal}
                >
                  Subscribe
                </button>
              ))}
            {String(orderType) === "2" && (
              <span
                className="redSmallText"
                // style={{
                //   marginLeft: "10px",
                //   color: "red",
                //   fontSize: 10
                // }}
              >
                Deliver Once
              </span>
            )}
          </div>
        </div>
      </div>
      <Modal
        closable
        onCancel={setIsModalOpenDaily}
        open={isModalOpen}
        title="Select Delivery Options"
        footer={null}
      >
        <div className="main-card-daily-delivery">
          <div className="main-card-daily-delivery-box">
            <label>Start Date: </label>
            <DatePicker
              selected={startDate ? new Date(startDate) : null}
              onChange={(date: Date | null) => {
                setStartDate(date ? date.toISOString().split("T")[0] : "");
              }}
              minDate={new Date(minDate)}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select a date"
              required
            />
          </div>

          <div>
            <label>Delivery Preference:</label>
            <select
              value={deliveryPreference}
              onChange={(e) => setDeliveryPreference(e.target.value)}
            >
              {deliveryOptionsPreference.length > 0 ? (
                deliveryOptionsPreference.flatMap((elem) =>
                  elem.deliveryPreference?.map((option: any) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))
                )
              ) : (
                <option value="">No delivery options available</option>
              )}
            </select>
          </div>

          <div className="delivery-dropdown">
            <label>Select Days:</label>
            <select
              value={deliveries}
              onChange={(e) => setDeliveries(Number(e.target.value))}
            >
              {deliveryOptionsPreference.flatMap((elem) =>
                elem.packages
                  ?.filter((pkg: any) => pkg.package_name === "Daily")
                  .flatMap((pkg: any) =>
                    pkg.no_of_deliveries
                      .split(",")
                      .map((day: string, index: number) => (
                        <option key={index} value={day}>
                          {day}
                        </option>
                      ))
                  )
              )}
            </select>
          </div>
        </div>
        <div>
          {!cartItemId ? (
            <>
              <components.Button
                text="Confirm and Add to Cart"
                onClick={handleAddToCartWithPreferences}
              />
            </>
          ) : (
            <>
              <components.Button
                text="update and Add to Cart"
                onClick={handleupdatetheAddToCartt}
              />
            </>
          )}
        </div>
      </Modal>
    </>
  );
};
