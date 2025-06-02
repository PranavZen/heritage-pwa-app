import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { hooks } from "../hooks";
import { DishType } from "../types";
import { svg } from "../assets/svg";
import { RootState } from "../store";
import { actions } from "../store/actions";
import { components } from "../components";
import axios from "axios";
import { notification, Modal } from "antd";
import { setCartCount, setShouldRefresh } from "../store/slices/cartSlice";
import { toggleWishlistItem } from "../store/slices/wishlistSlice";
import { fetchWishlist } from "../store/slices/wishlistSlice";

type Props = {
  index: number;
  dish: DishType;
  isLast: boolean;
};

interface SubscriptionData {
  delivery_preference: string;
  no_of_deliveries?: string;
  cart_order_date?: string;
}

export const RecomendedItem: React.FC<Props> = ({ index, dish, isLast }) => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();

  const [quantity, setQuantity] = useState<number>(0);
  const [cartItemId, setCartItemId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [prevQuantity, setPrevQuantity] = useState<number>(0);
  const [orderType, setOrderType] = useState<number>(0);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const c_id = localStorage.getItem("c_id") || "";
  const cityId = localStorage.getItem("cityId") || "";
  const wishlist = useSelector((state: RootState) => state.wishlistSlice.list);

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
      formData.append("area_id", localStorage.getItem("area_id") || "");
      formData.append("next_id", "0");
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

        if (matchedItem) {
          setQuantity(Number(matchedItem.quantity) || 1);
          setCartItemId(String(matchedItem.cart_id));
          setOrderType(matchedItem.order_type);
          setSubscriptionData(matchedItem);
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
  }, [cityId, c_id, dish.product_option_value_id]);

  const HandleAddToCart = async () => {
    if (!c_id) {
      Modal.confirm({
        title: "Please Sign In",
        content: "You need to sign in to add items to your cart.",
        onOk() {
          navigate("/");
        },
        cancelText: "Cancel",
        okText: "Sign In",
      });
      return;
    }

    try {
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
        dispatch(setShouldRefresh(true));
        dispatch(actions.addToCart({ ...dish, quantity: 1 }));
        setPrevQuantity(quantity);
        setQuantity(1);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);

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
      } else {
        notification.error({
          message: "Error",
          description: response.data.message || "Something went wrong.",
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      notification.error({
        message: "Error",
        description: "Failed to add item to cart.",
      });
    }
  };
  const handleUpdateCart = async (newQuantity: number) => {
    if (newQuantity < 0 || !cartItemId) return;
    const preferenceName = subscriptionData?.delivery_preference || "0";
    const noOfDeliveries = subscriptionData?.no_of_deliveries || "0";
    const orderDate = subscriptionData?.cart_order_date || getTomorrowDate() || "0";
    const orderType = (
      subscriptionData?.delivery_preference &&
      Number(subscriptionData?.no_of_deliveries ?? 0) > 1
    ) ? "1" : "2";
    try {
      const formData = new FormData();
      formData.append("id", cartItemId);
      formData.append("c_id", c_id);
      formData.append("package_id", "13");
      formData.append("quantity", String(newQuantity));
      formData.append("delivery_preference", preferenceName);
      formData.append("no_of_deliveries", noOfDeliveries);
      formData.append("order_date", orderDate);
      formData.append("order_type", orderType);
      const response = await axios.post(
        "https://heritage.bizdel.in/app/consumer/services_v11/updateCartItem",
        formData
      );

      if (response.data.status === "success") {
        setPrevQuantity(quantity);
        setQuantity(newQuantity);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);
        notification.success({
          message: "Success",
          description: response.data.message,
        });
      } else {
        notification.error({
          message: "Error",
          description: response.data.message || "Failed to update quantity.",
        });
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      notification.error({
        message: "Error",
        description: "Failed to update item quantity.",
      });
    }
  };
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
          setPrevQuantity(quantity);
          setQuantity(0);
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 500);
          setCartItemId(null);
          dispatch(setCartCount(Number(response.data.cart_count)));
        } else {
          notification.error({
            message: "Error",
            description: response.data.message || "Failed to remove item.",
          });
        }
      } catch (error) {
        console.error("Error removing item from cart:", error);
        notification.error({
          message: "Error",
          description: "Failed to remove item from cart.",
        });
      }
    }
  };

  const wishlistHandler = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();

    const c_id_num = parseInt(localStorage.getItem("c_id") || "0");
    if (!c_id_num) {
      Modal.confirm({
        title: "Please Sign In",
        content: "You need to sign in to manage your wishlist.",
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

  return (
    <div className="proCardWrap">
      <div className="itemImgWrap">
        <img
          src={dish.option_value_image}
          alt={dish.name}
          onClick={() =>
            navigate(`/dish/${dish.option_value_name}`, {
              state: {
                dish,
                showSubscribe: dish.subscription_product
              }
            })
          }

        />
      </div>

      {dish.isHot && (
        <img
          alt="Hot"
          src={require("../assets/icons/15.png")}
          style={{
            width: 18,
            left: 0,
            top: 0,
            marginLeft: 14,
            marginTop: 14,
            height: "auto",
            position: "absolute",
          }}
        />
      )}

      {dish.isNew && (
        <img
          alt="New"
          src={require("../assets/icons/14.png")}
          style={{
            width: 34,
            height: "auto",
            margin: 14,
            left: 0,
            top: 0,
            position: "absolute",
          }}
        />
      )}

      <div className="boxWrap">
        <button
          onClick={wishlistHandler}
          style={{
            position: "absolute",
            right: 0,
            bottom: 46,
            padding: 15,
            borderRadius: 10,
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            style={{
              transition: "fill 0.3s ease",
            }}
          >
            <path
              fill={isInWishlist ? "red" : "#1a712e"}
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
          {/* <svg
                xmlns='http://www.w3.org/2000/svg'
                width={24}
                height={24}
                fill='none'
              >
                <path
                  fill={
                    isInWishlist
                      ? 'red'
                      : '#1a712e'
                  }
                  fillOpacity={0}
                  d='M16.422 3.3c-1.928 0-3.6 1.116-4.423 2.746C11.176 4.416 9.504 3.3 7.576 3.3 4.833 3.3 2.61 5.56 2.61 8.346c0 5.503 9.389 11.742 9.389 11.742s9.389-6.239 9.389-11.742c0-2.787-2.224-5.046-4.966-5.046Z'
                />
                <path
                  fill={
                    isInWishlist
                      ? 'red'
                      : '#1a712e'
                  }
                  fillRule='evenodd'
                  d='M20.3 4.706a6.093 6.093 0 0 1 1.333 1.94c.326.758.492 1.562.49 2.39 0 .78-.16 1.593-.476 2.42a10.722 10.722 0 0 1-1.13 2.133c-.769 1.146-1.826 2.341-3.138 3.553a35.517 35.517 0 0 1-4.42 3.453l-.556.356a.753.753 0 0 1-.809 0l-.555-.357a35.071 35.071 0 0 1-4.42-3.452c-1.313-1.211-2.37-2.407-3.139-3.553a10.843 10.843 0 0 1-1.13-2.133c-.316-.827-.475-1.64-.475-2.42a6.057 6.057 0 0 1 1.826-4.329A6.219 6.219 0 0 1 8.07 2.93 6.26 6.26 0 0 1 12 4.315a6.26 6.26 0 0 1 3.93-1.385 6.219 6.219 0 0 1 4.37 1.776ZM12 19.096l.162.253h.002l.005-.004.018-.012.072-.047.268-.18a34.152 34.152 0 0 0 3.848-3.051c1.053-.972 2.114-2.1 2.914-3.291.798-1.187 1.355-2.465 1.355-3.729 0-2.56-2.116-4.624-4.713-4.624-1.64 0-3.086.821-3.931 2.07a4.735 4.735 0 0 0-3.93-2.07c-2.598 0-4.714 2.064-4.714 4.624 0 1.264.557 2.542 1.355 3.729.8 1.191 1.861 2.32 2.914 3.29a34.146 34.146 0 0 0 4.116 3.232l.072.047.018.012.005.003.002.001.162.104.162-.104-.162-.252Zm8.344-10.06Zm-8.506 10.313.162-.252-.162.252ZM8.07 4.711c-2.133 0-3.913 1.482-4.324 3.453.411-1.97 2.19-3.453 4.324-3.453A4.433 4.433 0 0 1 12 7.064a4.433 4.433 0 0 1 3.93-2.353c-1.713 0-3.199.956-3.93 2.353a4.426 4.426 0 0 0-3.93-2.353Z'
                  clipRule='evenodd'
                />
              </svg> */}
        </button>

        <span className="t14 number-of-lines-1" style={{ marginBottom: 5 }}>
          {dish.option_value_name}
        </span>

        {Number(dish.discount ?? 0) > 0 ? (
          <>
            <span
              className="proPrice"
              style={{ textDecoration: "line-through", color: "#888" }}
            >
              ₹ {dish.price}
            </span>
            <span className="proPrice" style={{ marginLeft: "8px" }}>
              ₹ {Number(dish.price ?? 0) - Number(dish.discount ?? 0)}
            </span>
          </>
        ) : (
          <span className="proPrice">₹ {dish.price}</span>
        )}


        <div className="cartButtonWrap">
          {quantity < 1 ? (
            <button className="cartButton" onClick={HandleAddToCart}>
              + Add
            </button>
          ) : (
            (
              <>
                <button
                  className="cartButton"
                  onClick={(event) =>
                    quantity === 1
                      ? handleRemoveFromCart(event)
                      : handleUpdateCart(quantity - 1)
                  }
                >
                  <svg.MinusSvg />
                </button>

                <div className="countNum">
                  {isAnimating ? (
                    <span
                      className={
                        quantity > prevQuantity ? "scroll-up" : "scroll-down"
                      }
                    >
                      {quantity}
                    </span>
                  ) : (
                    <span>{quantity}</span>
                  )}
                </div>

                <button
                  className="cartButton"
                  onClick={() => handleUpdateCart(quantity + 1)}
                >
                  <svg.AddSvg />
                </button>
              </>
            )
          )}
        </div>



      </div>
    </div>
  );
};
