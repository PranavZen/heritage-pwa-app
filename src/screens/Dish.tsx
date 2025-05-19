import React, { useEffect, useState } from "react";
import { hooks } from "../hooks";
import { Routes } from "../routes";
import { svg } from "../assets/svg";
import { DishType } from "../types";
import { components } from "../components";
import { actions } from "../store/actions";
import axios from "axios";
import { Modal, notification } from "antd";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { setCartCount } from "../store/slices/cartSlice";
import { useSelector } from "react-redux";
import { RootState } from "../store/index";
import { setShouldRefresh } from "../store/slices/cartSlice";
import {
  fetchWishlist,
  toggleWishlistItem,
} from "../store/slices/wishlistSlice";

export const Dish: React.FC = () => {
  interface CheckCartData {
    delivery_preference?: string;
    no_of_deliveries?: string;
    order_type: string;
  }

  const navigate = hooks.useNavigate();
  const dispatch = hooks.useDispatch();
  const location = hooks.useLocation();
  const [packageOptions, setPackageOptions] = useState<any[]>([]);
  const [deliveryOptionsPreference, setDeliveryOptionsPreference] = useState<
    any[]
  >([]);

  const shouldRefresh = useSelector(
    (state: RootState) => state.cartSlice.shouldRefresh
  );
  // console.log("deliveryOptionsPreference", shouldRefresh);
  const [quantity, setQuantity] = useState<number>(1);
  // console.log("aaaaaaa", quantity);

  const [cartId, setCartId] = useState<string[]>([]);
  const [cartItemId, setCartItemId] = useState<string | null>(null);
  const [cartType, setCartType] = useState<string | null>(null);

  // console.log("cartItemIdz", cartType);

  const [opacity, setOpacity] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [isAlternateModalOpen, setIsAlternateModalOpen] =
    useState<boolean>(false);
  // const [startDate, setStartDate] = useState<string>("");

  // console.log("isAlternateModalOpen", isAlternateModalOpen);

  const setIsModalOpenDaily = () => {
    setIsModalOpen(false);
  };
  // console.log("isModalOpen", isModalOpen);

  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [deliveryPreference, setDeliveryPreference] = useState<string>("1");

  const [deliveries, setDeliveries] = useState<number>(30);

  const [customSelectedDays, setCustomSelectedDays] = useState<string[]>([]);

  // const [checkCartData, SetCheckCartData] = useState<CheckCartData>({});

  const [checkCartData, SetCheckCartData] = useState<CheckCartData>({
    order_type: "", // Initial value for `order_type`, adjust as needed
  });

  // console.log("checkCartData", checkCartData);

  interface CartItem {
    quantity: number;
  }

  const [cartData, setCartData] = useState<CartItem[] | undefined>(undefined);

  // console.log("ccccccccccccccccc", cartData);

  const dish: DishType = location.state.dish;

  const showSubscribe = location.state.showSubscribe;

  // console.log("vvvvvvvvv", showSubscribe);

  // Ensure dish and the properties exist
  if (dish && dish.product_option_id && dish.product_option_value_id) {
    localStorage.setItem(
      "product_option_id",
      dish.product_option_id.toString()
    );
    localStorage.setItem(
      "product_option_value_id",
      dish.product_option_value_id.toString()
    );
  } else {
    // console.error('Error: Missing product_option_id or product_option_value_id in dish', dish);
  }

  const c_id = localStorage.getItem("c_id");
  const cityId = localStorage.getItem("cityId");

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
          product_option_id: Number(dish.option_id),
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

  // console.log("roshannnnnnnnnnnn", dish);

  // **************************************Modify cart data*************************************************************
  // **************************************Modify cart data*************************************************************
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const formData = new FormData();
        formData.append("city_id", cityId || "");
        formData.append("c_id", c_id || "");
        formData.append("area_id", localStorage.getItem("area_id") || "");
        formData.append("next_id", "0");
        formData.append("cart_type", "2");
        const response = await axios.post(
          "https://heritage.bizdel.in/app/consumer/services_v11/getCartDatasrv",
          formData
        );

        // console.log("ssssssssssssssssss", response.data.optionListing);

        if (response.data.optionListing) {
          const cartItems = response.data.optionListing.map(
            (item: any) => item.cart_product_option_value_id
          );
          setCartId(cartItems);

          const matchedItem = response.data.optionListing.find(
            (item: any) =>
              String(item.cart_product_option_value_id) ===
              String(
                dish.cart_product_option_value_id ||
                  dish.product_option_value_id
              )
          );
          if (matchedItem) {
            setQuantity(Number(matchedItem.quantity) || 1);
            setCartItemId(String(matchedItem.cart_id));
            setCartType(matchedItem.order_type);
            SetCheckCartData(matchedItem);
          } else {
            setQuantity(1);
            setCartItemId(null);
          }
        }
      } catch (error) {
        console.error("Error fetching cart data:", error);
      }
    };
    // if (shouldRefresh) {
    //   fetchCartData().finally(() => {
    //     dispatch(setShouldRefresh(true));
    //   });
    // }
    fetchCartData();
  }, [cityId, c_id, dish.product_option_value_id, shouldRefresh]);

  const handleRemoveFromCart = async (event: React.MouseEvent) => {
    event.stopPropagation();

    if (!cartItemId) return;

    if (quantity > 1) {
      handleUpdateCart(quantity - 1);
    } else {
      try {
        const formData = new FormData();
        formData.append("id", String(cartItemId));
        formData.append("c_id", c_id || "");

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
          setQuantity(1);
          setCartItemId(null);
          dispatch(setCartCount(Number(response.data.cart_count)));
          dispatch(setShouldRefresh(true));
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
  // *******************************************************************************************************
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };
  const [startDate, setStartDate] = useState(getTomorrowDate());

  const handleAddToCart = async (cartData: any) => {
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
      const formData = new FormData();

      const productOptionId =
        dish.product_option_id || localStorage.getItem("product_option_id");
      const productOptionValueId =
        dish.product_option_value_id ||
        localStorage.getItem("product_option_value_id");

      if (!productOptionId || !productOptionValueId) {
        console.error(
          "Error: product_option_id or product_option_value_id is missing"
        );
        notification.error({
          message: "Error",
          description: "Missing product options. Please try again.",
        });
        return;
      }

      formData.append("c_id", c_id);
      formData.append("product_id", String(dish.product_id));
      formData.append("package_id", "13");
      formData.append("product_option_id", String(productOptionId)); // Use the fallback value here
      formData.append("product_option_value_id", String(productOptionValueId)); // Use the fallback value here
      formData.append("quantity", String(localQuantity));
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
        setQuantity(1);
        dispatch(setShouldRefresh(true));

        const newCartId =
          response.data.cart_id ||
          response.data.data?.cart_id ||
          response.data.data?.id ||
          null;

        if (newCartId) {
          setCartItemId(String(newCartId));
        } else {
          // await fetchCartData();
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

  // console.log("deliveryOptionsPreferencedeliveryOptionsPreference", deliveryOptionsPreference);

  // ***************************************ADDddddddddddddddddddddddddddddddddddddd
  const addToCartApi = async (cartData: any) => {
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
      formData.append("quantity", String(localQuantity));
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

  // ******************update api start*****************************
  const [localQuantity, setLocalQuantity] = useState<number>(1);

  // console.log("localQuantitylocalQuantity", localQuantity);

  const isInCart = !!cartItemId;

  const handleUpdateCart = async (newQuantity: number) => {
    if (newQuantity < 1) return;

    const c_id = localStorage.getItem("c_id");

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

    const formData = new FormData();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split("T")[0];

    formData.append("id", cartItemId || "");
    formData.append("c_id", c_id);
    formData.append("package_id", "13");
    formData.append("quantity", String(newQuantity));
    formData.append(
      "delivery_preference",
      checkCartData.delivery_preference || "0"
    );
    formData.append("no_of_deliveries", checkCartData.no_of_deliveries || "0");
    formData.append("order_date", formattedDate);
    const orderType = checkCartData.delivery_preference !== "0" ? "1" : "2";
    formData.append("order_type", orderType);

    try {
      const response = await axios.post(
        "https://heritage.bizdel.in/app/consumer/services_v11/updateCartItem",
        formData
      );

      if (response.data.status === "success") {
        setQuantity(newQuantity);
        notification.success({ message: response.data.message });
      } else {
        notification.error({ message: "Please first add the item." });
      }
    } catch (error) {
      notification.error({ message: "Error updating cart." });
    }
  };

  // ((*(((((((((((((((((((((((((((((((((((((((((((((((((())))))))))))))))))))))))))))))))))))))))))))))))))))
  const handleupdatetheAddToCart = async () => {
    if (cartType === "1") {
      Modal.confirm({
        content:
          "Are you sure do you want to convert Subscription Order to One Time  Order.",
        onOk: async () => {
          const c_id = localStorage.getItem("c_id");
          if (!c_id) {
            notification.error({ message: "User not signed in." });
            return;
          }

          if (!cartItemId) {
            notification.error({
              message: "Please add the item to cart first.",
            });
            return;
          }

          const formData = new FormData();
          const formattedDate = startDate
            ? new Date(startDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0];

          formData.append("id", cartItemId || "");
          formData.append("c_id", c_id);
          formData.append("package_id", "13");
          formData.append("quantity", String(quantity));
          formData.append("delivery_preference", "0");
          formData.append("no_of_deliveries", "0");
          formData.append("order_date", formattedDate);
          formData.append("order_type", "2");

          try {
            const response = await axios.post(
              "https://heritage.bizdel.in/app/consumer/services_v11/updateCartItem",
              formData
            );

            if (response.data.status === "success") {
              notification.success({ message: response.data.message });
              navigate("/");
            } else {
              notification.error({
                message: "Failed to update cart. Try again!",
              });
            }
          } catch (error) {
            notification.error({ message: "Error updating cart!" });
          }
        },
        onCancel() {},
        cancelText: "Cancel",
        okText: "Yes",
      });
      return;
    }

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
    setIsAlternateModalOpen(false);

    const formData = new FormData();
    const formattedDate = startDate
      ? new Date(startDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    formData.append("id", cartItemId || "");
    formData.append("c_id", c_id);
    formData.append("package_id", "13");
    formData.append("quantity", String(quantity));
    formData.append("delivery_preference", "0");
    formData.append("no_of_deliveries", "0");
    formData.append("order_date", formattedDate);
    formData.append("order_type", "2");

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
    setIsAlternateModalOpen(false);

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

  // ((((())))))))))))))))))(((((()()()))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))

  //*******************************************update api end**********************************************

  useEffect(() => {
    const deliveryData = async () => {
      const formData = new FormData();
      formData.append("c_id", c_id || "null");
      formData.append("city_id", cityId || "null");
      formData.append(
        "product_option_value_id",
        String(localStorage.getItem("product_option_value_id"))
      );
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

  //********************************************************************

  const today = new Date();
  today.setDate(today.getDate() + 1);
  const minDate = today.toISOString().split("T")[0];

  const { getDishQty } = hooks.useCartHandler();
  // const { addToWishlist, removeFromWishlist, ifInWishlist } =
  //   hooks.useWishlistHandler();

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor("#F6F9F9", "#F6F9F9", dispatch);

  const handleOpenModal = () => {
    const c_id = localStorage.getItem("c_id");
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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // const handleOpenCustomModal = () => {
  //   setIsCustomModalOpen(true);
  // };

  // const handleCloseCustomModal = () => {
  //   setIsCustomModalOpen(false);
  // };

  const handleOpenModalAlternateDays = () => {
    const c_id = localStorage.getItem("c_id");

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

    setIsAlternateModalOpen(true);
    setIsModalOpen(true);
  };

  const handleCloseModalAlternateDays = () => {
    setIsAlternateModalOpen(false);
    // console.log("aaaaaaaaaaaaaaaaaaaaaaaaa");
  };

  const handleAddToCartWithPreferences = async () => {
    const dishWithPreferences = {
      ...dish,
      startDate,
      selectedDays,
      deliveryPreference,
      deliveries: deliveries ?? 0,
    };
    const cartCount = await addToCartApi(dishWithPreferences);
    // console.log('lllllll', cartData);
    if (cartCount) {
      dispatch(actions.addToCart(dishWithPreferences));
      setIsModalOpen(false);
    }
  };

  // *********************************Alternate add to cart*********************************************
  const handleAddToCartWithAlternate = async () => {
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
      setIsAlternateModalOpen(false);
    }
  };

  // ********************************Alternate add to cart************************************************

  // const handleAddToCartWithCustomPreferences = async () => {
  //   const dishWithCustomPreferences = {
  //     c_id: c_id || "null",
  //     // package_id: 13,
  //     package_days: 0,
  //     product_id: dish.product_id,
  //     product_option_id: 6,
  //     product_option_value_id: 11,
  //     quantity: 1,
  //     weight: dish.weight,
  //     weight_unit: "g",
  //     delivery_preference: deliveryPreference,
  //     no_of_deliveries: deliveries,
  //     order_date: startDate,
  //     order_type: 2,
  //   };

  //   const cartCount = await addToCartApi(dishWithCustomPreferences);
  //   if (cartCount) {
  //     // Optionally update the cart count in your app state or UI
  //     // For example, dispatch(actions.updateCartCount(cartCount));
  //     handleCloseCustomModal();
  //   }
  // };

  // const handleCustomDaySelection = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { value, checked } = e.target;

  //   const upperCaseValue = value.toUpperCase();

  //   setCustomSelectedDays((prevSelectedDays) => {
  //     if (checked) {
  //       return [...prevSelectedDays, upperCaseValue];
  //     } else {
  //       return prevSelectedDays.filter((day) => day !== upperCaseValue);
  //     }
  //   });
  // };

  const renderHeader = (): JSX.Element => {
    return <components.Header showGoBack={true} showBasket={true} />;
  };

  const renderImage = (): JSX.Element => {
    return (
      <div className="upperBox">
        <div className="productImgWrap">
          <img
            src={dish.option_value_image}
            alt={dish.option_name}
            className="productImg"
          />
          {dish.isNew && (
            <img
              alt="New"
              src={require("../assets/icons/14.png")}
              style={{
                width: 58.09,
                height: "auto",
                position: "absolute",
                top: 21,
                left: 20,
                filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
                animation: "pulse 2s infinite",
              }}
            />
          )}
          {dish.isHot && (
            <img
              alt="Hot"
              src={require("../assets/icons/15.png")}
              style={{
                width: 30,
                height: "auto",
                position: "absolute",
                top: 20,
                left: 20,
                filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
                animation: "pulse 2s infinite",
              }}
            />
          )}
        </div>
        <button
          onClick={wishlistHandler}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className="wishlist-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            style={{
              fill: isInWishlist ? "#e74c3c" : "rgba(255, 255, 255, 0.8)",
              transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              filter: isInWishlist
                ? "drop-shadow(0 0 3px rgba(231, 76, 60, 0.5))"
                : "none",
              transform: isInWishlist ? "scale(1.1)" : "scale(1)",
            }}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>
    );
  };

  const renderDetails = (): JSX.Element => {
    return (
      <div className="productInfoBox">
        {/* <span className="product-category">{dish.category_name || "Dairy Product"}</span> */}
        <div className="product-info-container">
          <div className="infoWrap">
            <h3
              className="number-of-lines-1"
              style={{ textTransform: "capitalize" }}
            >
              {dish.option_value_name}
            </h3>

            {/* Product features */}
            <div className="product-features">
              <span className="feature-title">Product Details</span>
              <div className="features-list">
                <span className="feature-item">
                  {dish.weight} {dish.weight_unit}
                </span>
                {/* {dish.fat && <span className="feature-item">Fat {dish.fat}%</span>}
                {dish.snf && <span className="feature-item">SNF {dish.snf}%</span>}
                {dish.isOrganic && <span className="feature-item">Organic</span>}
                {dish.isFresh && <span className="feature-item">Fresh</span>} */}
              </div>
            </div>

            {/* Price section */}
            <div className="priceWrap">
              <div className="price-container">
                {Number(dish.discount ?? 0) > 0 ? (
                  <>
                    <div className="original-price">
                      <span className="currency">₹</span>
                      <span>{dish.price}</span>
                    </div>
                    <div className="discount-price">
                      <span className="currency">₹</span>
                      <span className="amount">
                        {Number(dish.price ?? 0) - Number(dish.discount ?? 0)}
                      </span>
                      <span
                        className="discount-badge"
                        aria-label={`${Math.round(
                          (Number(dish.discount) / Number(dish.price)) * 100
                        )}% off`}
                      >
                        {Math.round(
                          (Number(dish.discount) / Number(dish.price)) * 100
                        )}
                        % OFF
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="current-price">
                    <span className="currency">₹</span>
                    <span className="amount">{dish.price}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity selector */}
            <div className="ppdBox">
              <span className="quantity-label">Quantity</span>
              <div className="cartButtonWrap">
                <button
                  onClick={(event) => {
                    if (isInCart) {
                      quantity === 1
                        ? handleRemoveFromCart(event)
                        : handleUpdateCart(quantity - 1);
                    } else {
                      if (localQuantity > 1) {
                        setLocalQuantity(localQuantity - 1);
                      }
                    }
                  }}
                  className="cartButton"
                  aria-label="Decrease quantity"
                >
                  <svg.MinusSvg />
                </button>

                <span
                  className="countNum"
                  aria-label={`Quantity: ${
                    isInCart ? quantity : localQuantity
                  }`}
                >
                  {isInCart ? quantity : localQuantity}
                </span>

                <button
                  onClick={() => {
                    if (isInCart) {
                      handleUpdateCart(quantity + 1);
                    } else {
                      setLocalQuantity(localQuantity + 1);
                    }
                  }}
                  className="cartButton"
                  aria-label="Increase quantity"
                >
                  <svg.AddSvg />
                </button>
              </div>
              <span className="per-day-label">Per Day</span>
            </div>

            {/* Add to Cart button only if not in cart */}
            {/* {!isInCart && (
              <button
                onClick={() => handleUpdateCart(localQuantity)}
                className="addToCartButton"
                aria-label="Add to cart"
              >
                Add to Cart
              </button>
            )} */}
          </div>
        </div>
      </div>
    );
  };

  const renderButtons = (): JSX.Element => {
    return (
      <div className="infoBtnsWrap">
        <h2 className="Choose-your-delivery-plan">Choose your delivery plan</h2>

        {/* One-time order button */}
        {!cartItemId ? (
          <components.Button
            text="+ Add to cart"
            onClick={() =>
              handleAddToCart({
                product_id: dish.product_id || "",
                product_option_id: dish.product_option_id || "",
                product_option_value_id: dish.product_option_value_id || "",
                weight: dish.weight || "0",
                weight_unit: dish.weight_unit || "kg",
                deliveryPreference: deliveryPreference || "1",
                deliveries: deliveries || "1",
                startDate: startDate || new Date().toISOString().split("T")[0],
              })
            }
            containerStyle={{ marginBottom: 16 }}
          />
        ) : (
          <components.Button
            text="Update One Time Order"
            onClick={handleupdatetheAddToCart}
            containerStyle={{ marginBottom: 16 }}
          />
        )}

        {/* Subscription button */}
        {showSubscribe &&
          (!cartItemId ? (
            <components.Button
              text="Subscribe for Regular Delivery"
              onClick={handleOpenModal}
              containerStyle={{ marginBottom: 16 }}
            />
          ) : (
            <components.Button
              text="Update Subscription"
              onClick={handleOpenModal}
              containerStyle={{ marginBottom: 16 }}
            />
          ))}

        {/* Alternate days button - commented out but styled for future use */}
        {/* <components.Button
          text="Alternate Days Delivery"
          onClick={handleOpenModalAlternateDays}
          containerStyle={{ marginBottom: 16 }}
        /> */}

        {/* Custom button - commented out but styled for future use */}
        {/* <components.Button
          text="Custom Delivery Schedule"
          onClick={handleOpenCustomModal}
          containerStyle={{ marginBottom: 16 }}
        /> */}
      </div>
    );
  };

  const renderModal = (): JSX.Element => {
    if (!isModalOpen) return <> </>;
    return (
      <components.Modal
        title="Delivery Preferences"
        onClose={setIsModalOpenDaily}
      >
        <div className="main-card-daily-delivery">
          <div className="main-card-daily-delivery-box">
            <label>Start Date:</label>
            <DatePicker
              selected={startDate ? new Date(startDate) : null}
              onChange={(date: Date | null) => {
                if (date) {
                  setStartDate(date.toISOString().split("T")[0]);
                } else {
                  setStartDate("");
                }
              }}
              minDate={new Date(minDate)}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select a date"
              required
            />
          </div>
          <div className="main-card-daily-delivery-box">
            <label>Order Instruction:</label>
            <select
              value={deliveryPreference}
              onChange={(e) => setDeliveryPreference(e.target.value)}
            >
              {deliveryOptionsPreference &&
              deliveryOptionsPreference.length > 0 ? (
                deliveryOptionsPreference.map((elem) => (
                  <>
                    {elem.deliveryPreference &&
                    elem.deliveryPreference.length > 0 ? (
                      elem.deliveryPreference.map((option: any) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))
                    ) : (
                      <option key="no-preference" value="">
                        No delivery options available
                      </option>
                    )}
                  </>
                ))
              ) : (
                <option value="">No delivery options available</option>
              )}
            </select>
          </div>
          <div className="delivery-dropdown">
            <label>Select Days:</label>
            <select
              value={deliveries}
              onChange={(e) => {
                const selectedValue = Number(e.target.value);
                // console.log("Selected Delivery :", selectedValue);
                setDeliveries(selectedValue);
              }}
            >
              {deliveryOptionsPreference &&
                deliveryOptionsPreference.length > 0 &&
                deliveryOptionsPreference.flatMap((elem) => {
                  if (!elem.packages || elem.packages.length === 0) return [];

                  return elem.packages.flatMap((option: any) => {
                    if (option.package_name === "Daily") {
                      return option.no_of_deliveries
                        .split(",")
                        .map((delivery: string, index: number) => (
                          <option key={index} value={delivery}>
                            {`${delivery}`}
                          </option>
                        ));
                    }
                    return [];
                  });
                })}
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
      </components.Modal>
    );
  };

  // *************************Alternate Days**************************************************
  const renderAlternateModal = (): JSX.Element => {
    if (!isAlternateModalOpen) return <></>;

    return (
      <components.Modal
        title="Delivery Preferences"
        onClose={handleCloseModalAlternateDays}
      >
        <div className="main-card-daily-delivery">
          <div className="main-card-daily-delivery-box">
            <label>Start Date: </label>
            <DatePicker
              selected={startDate ? new Date(startDate) : null}
              onChange={(date: Date | null) => {
                if (date) {
                  setStartDate(date.toISOString().split("T")[0]);
                } else {
                  setStartDate("");
                }
              }}
              minDate={new Date(minDate)}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select a date"
              required
            />
          </div>
          <div className="main-card-daily-delivery-box">
            <label>Order Instruction:</label>
            <select
              value={deliveryPreference}
              onChange={(e) => setDeliveryPreference(e.target.value)}
            >
              {deliveryOptionsPreference &&
              deliveryOptionsPreference.length > 0 ? (
                deliveryOptionsPreference.map((elem) => (
                  <>
                    {elem.deliveryPreference &&
                    elem.deliveryPreference.length > 0 ? (
                      elem.deliveryPreference.map((option: any) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))
                    ) : (
                      <option key="no-preference" value="">
                        No delivery options available
                      </option>
                    )}
                  </>
                ))
              ) : (
                <option value="">No delivery options available</option>
              )}
            </select>
          </div>
          <div className="delivery-dropdown">
            <label>Select Days:</label>
            <select
              value={deliveries}
              onChange={(e) => {
                const selectedValue = Number(e.target.value);
                // console.log("Selected Delivery :", selectedValue);
                setDeliveries(selectedValue);
              }}
            >
              {deliveryOptionsPreference &&
                deliveryOptionsPreference.length > 0 &&
                deliveryOptionsPreference.flatMap((elem) => {
                  if (!elem.packages || elem.packages.length === 0) return [];

                  return elem.packages.flatMap((option: any) => {
                    if (option.package_name === "Alternate Days") {
                      return option.no_of_deliveries
                        .split(",")
                        .map((delivery: string, index: number) => (
                          <option key={index} value={delivery}>
                            {`${delivery}`}
                          </option>
                        ));
                    }
                    return [];
                  });
                })}
            </select>
          </div>
        </div>

        <div>
          {!cartItemId ? (
            <>
              {" "}
              <components.Button
                text="Confirm and Add to Cart"
                onClick={handleAddToCartWithAlternate}
              />{" "}
            </>
          ) : (
            <>
              {" "}
              <components.Button
                text="update and Add to Cart"
                onClick={handleupdatetheAddToCart}
              />
            </>
          )}
        </div>
      </components.Modal>
    );
  };

  // ***************************Custom************************************************
  const renderContent = (): JSX.Element => {
    return (
      <section className="scrollable">
        {renderImage()}
        {renderDetails()}
        {renderButtons()}
      </section>
    );
  };

  return (
    <div id="screen" style={{ opacity }}>
      {renderHeader()}
      {renderContent()}
      {renderModal()}
      {/* {renderCustomModal()} */}
      {renderAlternateModal()}
    </div>
  );
};
