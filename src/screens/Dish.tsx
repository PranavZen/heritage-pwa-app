import React, { useEffect, useState } from 'react';
import { hooks } from '../hooks';
import { Routes } from '../routes';
import { svg } from '../assets/svg';
import { DishType } from '../types';
import { components } from '../components';
import { actions } from '../store/actions';
import axios from 'axios';
import { Modal, notification } from 'antd';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { setCartCount } from '../store/slices/cartSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../store/index';
import { setShouldRefresh } from '../store/slices/cartSlice';
import { fetchWishlist, toggleWishlistItem } from '../store/slices/wishlistSlice';


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
  const [deliveryOptionsPreference, setDeliveryOptionsPreference] = useState<any[]>([]);


  const shouldRefresh = useSelector((state: RootState) => state.cartSlice.shouldRefresh);
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
  }
  // console.log("isModalOpen", isModalOpen);

  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [deliveryPreference, setDeliveryPreference] = useState<string>('1');

  const [deliveries, setDeliveries] = useState<number>(30);

  const [customSelectedDays, setCustomSelectedDays] = useState<string[]>([]);

  // const [checkCartData, SetCheckCartData] = useState<CheckCartData>({});

  const [checkCartData, SetCheckCartData] = useState<CheckCartData>({
    order_type: '',  // Initial value for `order_type`, adjust as needed
  });

  // console.log("checkCartData", checkCartData);

  interface CartItem {
    quantity: number;
  }

  const [cartData, setCartData] = useState<CartItem[] | undefined>(undefined);


  // console.log("ccccccccccccccccc", cartData);

  const dish: DishType = location.state.dish;

  const showSubscribe = location.state.showSubscribe

  // Ensure dish and the properties exist
  if (dish && dish.product_option_id && dish.product_option_value_id) {
    localStorage.setItem('product_option_id', dish.product_option_id.toString());
    localStorage.setItem('product_option_value_id', dish.product_option_value_id.toString());
  } else {
    // console.error('Error: Missing product_option_id or product_option_value_id in dish', dish);
  }

  const c_id = localStorage.getItem("c_id");
  const cityId = localStorage.getItem("cityId");

  const wishlist = useSelector((state: RootState) => state.wishlistSlice.list);

  const wishlistHandler = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    const c_id_num = parseInt(localStorage.getItem('c_id') || '0');
    if (!c_id_num) {
      Modal.confirm({
        title: 'Please Sign In',
        content: 'You need to sign in to manage your wishlist.',
        onOk() {
          navigate('/');
        },
        cancelText: 'Cancel',
        okText: 'Sign In',
      });
      return;
    }

    const isInWishlist = wishlist.some(
      (item) => item.option_value_id === dish.option_value_id
    );

    const type = isInWishlist ? 2 : 1;

    try {
      const resultAction = await dispatch(toggleWishlistItem({
        product_id: dish.product_id,
        product_option_id: Number(dish.option_id),
        product_option_value_id: dish.product_option_value_id,
        c_id: c_id_num,
        type
      }));

      if (toggleWishlistItem.fulfilled.match(resultAction)) {
        dispatch(fetchWishlist());
      }
    } catch (error) {
      console.error('Wishlist action failed:', error);
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
        formData.append('city_id', cityId || '');
        formData.append('c_id', c_id || '');
        formData.append('area_id', localStorage.getItem('area_id') || '');
        formData.append('next_id', '0');
        formData.append('cart_type', '2');
        const response = await axios.post(
          'https://heritage.bizdel.in/app/consumer/services_v11/getCartDatasrv',
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
              String(item.cart_product_option_value_id) === String(dish.cart_product_option_value_id || dish.product_option_value_id
              )
          );
          if (matchedItem) {
            setQuantity(Number(matchedItem.quantity) || 1);
            setCartItemId(String(matchedItem.cart_id));
            setCartType(matchedItem.order_type)
            SetCheckCartData(matchedItem);
          } else {
            setQuantity(1);
            setCartItemId(null);
          }
        }
      } catch (error) {
        console.error('Error fetching cart data:', error);
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
        formData.append('id', String(cartItemId));
        formData.append('c_id', c_id || '');

        const response = await axios.post(
          'https://heritage.bizdel.in/app/consumer/services_v11/deleteCartItem',
          formData
        );

        if (response.data.status === 'success') {
          notification.success({ message: 'Success', description: response.data.message });
          dispatch(actions.removeItemCompletely({ ...dish }));
          setQuantity(1);
          setCartItemId(null);
          dispatch(setCartCount(Number(response.data.cart_count)));
          dispatch(setShouldRefresh(true));
        } else {
          notification.error({ message: 'Error', description: response.data.message || 'Failed to remove item.' });
        }
      } catch (error) {
        console.error('Error removing item from cart:', error);
        notification.error({ message: 'Error', description: 'Failed to remove item from cart.' });
      }
    }
  };
  // *******************************************************************************************************
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };
  const [startDate, setStartDate] = useState(getTomorrowDate());

  const handleAddToCart = async (cartData: any) => {
    if (!c_id) {
      Modal.confirm({
        title: 'Please Sign In',
        content: 'You need to sign in to add items to your cart.',
        onOk() {
          navigate('/');
        },
        onCancel() { },
        cancelText: 'Cancel',
        okText: 'Sign In',
      });
      return;
    }

    try {
      const formData = new FormData();

      const productOptionId = dish.product_option_id || localStorage.getItem('product_option_id');
      const productOptionValueId = dish.product_option_value_id || localStorage.getItem('product_option_value_id');

      if (!productOptionId || !productOptionValueId) {
        console.error('Error: product_option_id or product_option_value_id is missing');
        notification.error({
          message: 'Error',
          description: 'Missing product options. Please try again.',
        });
        return;
      }

      formData.append('c_id', c_id);
      formData.append('product_id', String(dish.product_id));
      formData.append('package_id', '13');
      formData.append('product_option_id', String(productOptionId));  // Use the fallback value here
      formData.append('product_option_value_id', String(productOptionValueId));  // Use the fallback value here
      formData.append('quantity', String(localQuantity));
      formData.append('weight', String(dish.weight));
      formData.append('weight_unit', String(dish.weight_unit));
      formData.append('delivery_preference', '0');
      formData.append('no_of_deliveries', '0');
      formData.append('order_date', getTomorrowDate());
      formData.append('order_type', '2');

      const response = await axios.post(
        'https://heritage.bizdel.in/app/consumer/services_v11/addItemToCart',
        formData
      );

      if (response.data.status === 'success') {
        notification.success({
          message: 'Success',
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
          message: 'Error',
          description: response.data.message || 'Something went wrong.',
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to add item to cart.',
      });
    }
  };

  // console.log("deliveryOptionsPreferencedeliveryOptionsPreference", deliveryOptionsPreference);

  // ***************************************ADDddddddddddddddddddddddddddddddddddddd
  const addToCartApi = async (cartData: any) => {
    if (!c_id) {
      Modal.confirm({
        title: 'Please Sign In',
        content: 'You need to sign in to add items to your cart.',
        onOk() {
          navigate('/');
        },
        onCancel() { },
        cancelText: 'Cancel',
        okText: 'Sign In',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('c_id', String(c_id || '1'));
      formData.append('product_id', String(cartData.product_id));
      formData.append('package_id', '13');
      formData.append('package_days', '0');

      // Apply fallback for product_option_id and product_option_value_id
      const productOptionId = cartData.product_option_id || localStorage.getItem('product_option_id');
      const productOptionValueId = cartData.product_option_value_id || localStorage.getItem('product_option_value_id');

      // If both are still missing, handle the error
      if (!productOptionId || !productOptionValueId) {
        console.error('Error: product_option_id or product_option_value_id is missing');
        notification.error({
          message: 'Error',
          description: 'Missing product options. Please try again.',
        });
        return null;
      }

      formData.append('product_option_id', String(productOptionId));
      formData.append('product_option_value_id', String(productOptionValueId));
      formData.append('quantity', String(localQuantity));
      formData.append('weight', String(cartData.weight));
      formData.append('weight_unit', String(cartData.weight_unit));
      formData.append('delivery_preference', String(cartData.deliveryPreference) || String(1));
      formData.append('no_of_deliveries', String(cartData.deliveries));
      formData.append('order_date', startDate);
      formData.append('order_type', '1');

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

    const c_id = localStorage.getItem('c_id');

    if (!c_id) {
      Modal.confirm({
        title: 'Please Sign In',
        content: 'You need to sign in to add items to your cart.',
        onOk() {
          navigate('/');
        },
        onCancel() { },
        cancelText: 'Cancel',
        okText: 'Sign In',
      });
      return;
    }

    const formData = new FormData();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split('T')[0];

    formData.append('id', cartItemId || '');
    formData.append('c_id', c_id);
    formData.append('package_id', '13');
    formData.append('quantity', String(newQuantity));
    formData.append(
      'delivery_preference',
      checkCartData.delivery_preference || '0'
    );
    formData.append(
      'no_of_deliveries',
      checkCartData.no_of_deliveries || '0'
    );
    formData.append('order_date', formattedDate);
    const orderType = checkCartData.delivery_preference !== '0' ? '1' : '2';
    formData.append('order_type', orderType);

    try {
      const response = await axios.post(
        'https://heritage.bizdel.in/app/consumer/services_v11/updateCartItem',
        formData
      );

      if (response.data.status === 'success') {
        setQuantity(newQuantity);
        notification.success({ message: response.data.message });
      } else {
        notification.error({ message: 'Please first add the item.' });
      }
    } catch (error) {
      notification.error({ message: 'Error updating cart.' });
    }
  };

  // ((*(((((((((((((((((((((((((((((((((((((((((((((((((())))))))))))))))))))))))))))))))))))))))))))))))))))
  const handleupdatetheAddToCart = async () => {
    if (cartType === '1') {
      Modal.confirm({
        content: 'Are you sure do you want to convert Subscription Order to One Time  Order.',
        onOk: async () => {
          const c_id = localStorage.getItem('c_id');
          if (!c_id) {
            notification.error({ message: 'User not signed in.' });
            return;
          }

          if (!cartItemId) {
            notification.error({ message: 'Please add the item to cart first.' });
            return;
          }

          const formData = new FormData();
          const formattedDate = startDate
            ? new Date(startDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];

          formData.append('id', cartItemId || '');
          formData.append('c_id', c_id);
          formData.append('package_id', '13');
          formData.append('quantity', String(quantity));
          formData.append('delivery_preference', '0');
          formData.append('no_of_deliveries', '0');
          formData.append('order_date', formattedDate);
          formData.append('order_type', '2');

          try {
            const response = await axios.post(
              'https://heritage.bizdel.in/app/consumer/services_v11/updateCartItem',
              formData
            );

            if (response.data.status === 'success') {
              notification.success({ message: response.data.message });
              navigate('/');
            } else {
              notification.error({ message: 'Failed to update cart. Try again!' });
            }
          } catch (error) {
            notification.error({ message: 'Error updating cart!' });
          }
        },
        onCancel() { },
        cancelText: 'Cancel',
        okText: 'Yes',
      });
      return;
    }

    if (deliveries < 1) {
      notification.error({ message: "Please select valid delivery days." });
      return;
    }

    const c_id = localStorage.getItem('c_id');
    if (!cartItemId) {
      Modal.confirm({
        title: 'Please Add the Item',
        content: 'You need to add to cart first.',
        onCancel() { },
        cancelText: 'Cancel',
        okText: 'Ok',
      });
      return;
    }

    if (!c_id) {
      Modal.confirm({
        title: 'Please Sign In',
        content: 'You need to sign in to update the cart.',
        onOk() {
          navigate('/');
        },
        onCancel() { },
        cancelText: 'Cancel',
        okText: 'Sign In',
      });
      return;
    }

    setIsModalOpen(false);
    setIsAlternateModalOpen(false);

    const formData = new FormData();
    const formattedDate = startDate
      ? new Date(startDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    formData.append('id', cartItemId || '');
    formData.append('c_id', c_id);
    formData.append('package_id', '13');
    formData.append('quantity', String(quantity));
    formData.append('delivery_preference', '0');
    formData.append('no_of_deliveries', '0');
    formData.append('order_date', formattedDate);
    formData.append('order_type', '2');

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

    const c_id = localStorage.getItem('c_id');
    if (!cartItemId) {
      Modal.confirm({
        title: 'Please Add the Item',
        content: 'You need to add to cart first.',
        onCancel() { },
        cancelText: 'Cancel',
        okText: 'Ok',
      });
      return;
    }


    if (!c_id) {
      Modal.confirm({
        title: 'Please Sign In',
        content: 'You need to sign in to update the cart.',
        onOk() {
          navigate('/');
        },
        onCancel() { },
        cancelText: 'Cancel',
        okText: 'Sign In',
      });
      return;
    }
    setIsModalOpen(false);
    setIsAlternateModalOpen(false);

    const formData = new FormData();
    // Date validation
    const formattedDate = startDate
      ? new Date(startDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    formData.append('id', cartItemId || '');
    formData.append('c_id', c_id);
    formData.append('package_days', 'mon,tue,wed,thu,fri,sat,sun');
    formData.append('package_id', '13');
    formData.append('quantity', String(quantity));
    formData.append('delivery_preference', String(deliveryPreference));
    formData.append('no_of_deliveries', String(deliveries));
    formData.append('order_date', formattedDate);
    const orderType = deliveryPreference !== '0' ? '1' : '2';
    formData.append('order_type', orderType);
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
      formData.append("product_option_value_id", String(localStorage.getItem('product_option_value_id')));
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
    const c_id = localStorage.getItem('c_id');
    if (!c_id) {
      Modal.confirm({
        title: 'Please Sign In',
        content: 'You need to sign in to add items to your cart.',
        onOk() {
          navigate('/');
        },
        onCancel() {
        },
        cancelText: 'Cancel',
        okText: 'Sign In',
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
    const c_id = localStorage.getItem('c_id');

    if (!c_id) {
      Modal.confirm({
        title: 'Please Sign In',
        content: 'You need to sign in to add items to your cart.',
        onOk() {
          navigate('/');
        },
        onCancel() {
        },
        cancelText: 'Cancel',
        okText: 'Sign In',
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
              alt={dish.option_name}
              src={require("../assets/icons/14.png")}
              style={{
                width: 58.09,
                height: "auto",
                position: "absolute",
                top: 21,
                left: 20,
              }}
            />
          )}
          {dish.isHot && (
            <img
              alt="Hot"
              src={require("../assets/icons/15.png")}
              style={{
                width: 24,
                left: 0,
                top: 0,
                marginLeft: 20,
                marginTop: 20,
                height: "auto",
                position: "absolute",
              }}
            />
          )}
        </div>
        <button
          onClick={wishlistHandler}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            padding: 15,
            borderRadius: 10,
            backgroundColor: 'transparent',
            border: 'none',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            style={{
              fill: isInWishlist ? 'red' : 'gray',
              transition: 'fill 0.3s ease',
            }}
          >
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
        </button>
      </div>
    );
  };




  const renderDetails = (): JSX.Element => {
    const discountPercentage = Math.round((Number(dish.discount ?? 0) / Number(dish.price ?? 1)) * 100);

    return (
      <div className="productInfoBox">
        {/* Product category */}
        <div className="product-category" aria-label="Product category">Premium Dairy</div>

        {/* Product info container */}
        <div className="product-info-container">
          <div className="infoWrap">
            {/* Product title */}
            <h3 className="number-of-lines-1" style={{ textTransform: "capitalize" }}>
              {dish.option_value_name}
            </h3>

            {/* Product meta info */}
            <div className="product-meta">
              <div className="meta-item" aria-label="Product rating: 4.8 out of 5 stars, 124 reviews">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                </svg>
                4.8 (124 reviews)
              </div>
              <div className="meta-item" aria-label="Delivery information: Same day delivery available">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="currentColor" />
                </svg>
                Same day delivery
              </div>
            </div>

            {/* Product description */}
            <span className="t16">{dish.weight} ml</span>

            {/* Product features */}
            <div className="product-features">
              <div className="feature-title" id="features-heading">Features</div>
              <div className="features-list" aria-labelledby="features-heading">
                <div className="feature-item" tabIndex={0}>Farm Fresh</div>
                <div className="feature-item" tabIndex={0}>No Preservatives</div>
                <div className="feature-item" tabIndex={0}>100% Natural</div>
              </div>
            </div>

            {/* Divider */}
            <div className="divider" aria-hidden="true"></div>

            {/* Price section */}
            <div className="priceWrap">
              {Number(dish.discount ?? 0) > 0 ? (
                <div className="price-container">
                  <div className="original-price" aria-label={`Original price: ${dish.price} rupees`}>
                    <span className="currency">₹</span>
                    <span className="amount">{dish.price}</span>
                  </div>
                  <div className="discount-price">
                    <span className="currency">₹</span>
                    <span className="amount" aria-label={`Current price: ${Number(dish.price ?? 0) - Number(dish.discount ?? 0)} rupees`}>
                      {Number(dish.price ?? 0) - Number(dish.discount ?? 0)}
                    </span>
                    <div className="discount-badge" aria-label={`${discountPercentage}% discount`}>
                      <span>{discountPercentage}% OFF</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="price-container">
                  <div className="current-price" aria-label={`Price: ${dish.price} rupees`}>
                    <span className="currency">₹</span>
                    <span className="amount">{dish.price}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quantity selector */}
            <div className="ppdBox" role="group" aria-label="Quantity selector">
              <div className="quantity-label" id="quantity-label">Quantity</div>
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
                  aria-controls="quantity-value"
                  disabled={isInCart ? quantity <= 1 : localQuantity <= 1}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M19 13H5V11H19V13Z" fill="currentColor" />
                  </svg>
                </button>
                <span className="countNum" id="quantity-value" aria-live="polite" aria-atomic="true" aria-labelledby="quantity-label">
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
                  aria-controls="quantity-value"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor" />
                  </svg>
                </button>
              </div>
              <div className="per-day-label">Per Day</div>
            </div>

            {/* Add to Cart button */}
            {!isInCart && (
              <button
                onClick={() => handleUpdateCart(localQuantity)}
                className="addToCartButton"
                aria-label={`Add ${localQuantity} items to cart`}
              >
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };


  const renderButtons = (): JSX.Element => {
    return (
      <div className="infoBtnsWrap" style={{ padding: 20 }}>
        <div>
          <p className="Choose-your-delivery-plan">Choose your delivery plan</p>
        </div>

        {/* add quantity */}
        {
          !cartItemId ? <>   <components.Button
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
            containerStyle={{ marginBottom: 10 }}
          />
          </> : <div> <components.Button
            text="Update One Time Order"
            onClick={handleupdatetheAddToCart}
            containerStyle={{ marginBottom: 10 }}
          /> </div>
        }

        {/* add quantity */}

        {String(showSubscribe) === '1' ?
          <>
            {!cartItemId ? <><components.Button
              text="Subscription"
              onClick={handleOpenModal}
              containerStyle={{ marginBottom: 10 }}
            /> </> :
              <><components.Button
                text="Update Subscription"
                onClick={handleOpenModal}
                containerStyle={{ marginBottom: 10 }}
              /> </>
            }
          </> : <> </>}

        {/* <components.Button
          text="Alternate Days"
          onClick={handleOpenModalAlternateDays}
          containerStyle={{ marginBottom: 10 }}
        /> */}
        {/* <components.Button
          text="Custom"
          onClick={handleOpenCustomModal}
          containerStyle={{ marginBottom: 10 }}
        /> */}
      </div>
    );
  };

  const renderModal = (): JSX.Element => {
    if (!isModalOpen) return <> </>;
    return (
      <div className="delivery-preferences-modal">
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Delivery Preferences</h3>
              <button
                className="close-button"
                onClick={setIsModalOpenDaily}
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="modal-content">
              <div className="main-card-daily-delivery">
                {/* Date picker section */}
                <div className="delivery-section date-picker-section">
                  <div className="section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    Choose Start Date
                  </div>
                  <div className="main-card-daily-delivery-box">
                    <label>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      When would you like to start?
                    </label>
                    <DatePicker
                      selected={startDate ? new Date(startDate) : null}
                      onChange={(date: Date | null) => {
                        if (date) {
                          setStartDate(date.toISOString().split('T')[0]);
                        } else {
                          setStartDate('');
                        }
                      }}
                      minDate={new Date(minDate)}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select a start date"
                      required
                    />
                  </div>
                </div>

                {/* Delivery preference section */}
                <div className="delivery-section">
                  <div className="section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    Delivery Preference
                  </div>
                  <div className="select-wrapper">
                    <select
                      value={deliveryPreference}
                      onChange={(e) => setDeliveryPreference(e.target.value)}
                      aria-label="Select delivery preference"
                    >
                      {deliveryOptionsPreference &&
                        deliveryOptionsPreference.length > 0 ? (
                        deliveryOptionsPreference.map((elem, elemIndex) => (
                          <React.Fragment key={`elem-${elemIndex}`}>
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
                          </React.Fragment>
                        ))
                      ) : (
                        <option value="">No delivery options available</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Select days section */}
                <div className="delivery-section">
                  <div className="delivery-dropdown">
                    <label>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                      </svg>
                      Select Number of Days:
                    </label>
                    <div className="select-wrapper">
                      <select
                        value={deliveries}
                        onChange={(e) => {
                          const selectedValue = Number(e.target.value);
                          setDeliveries(selectedValue);
                        }}
                        aria-label="Select number of days"
                      >
                        {deliveryOptionsPreference &&
                          deliveryOptionsPreference.length > 0 &&
                          deliveryOptionsPreference.map((elem, elemIndex) => {
                            return elem.packages && elem.packages.length > 0
                              ? elem.packages.map((option: any, optionIndex: number) => {
                                if (option.package_name === "Daily") {
                                  return option.no_of_deliveries
                                    .split(",")
                                    .map((delivery: string, index: number) => (
                                      <option key={`${elemIndex}-${optionIndex}-${index}`} value={delivery}>
                                        {`${delivery} days`}
                                      </option>
                                    ));
                                }
                                return null;
                              })
                              : null;
                          })}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="action-buttons">
                  <button
                    className="cancel-button"
                    onClick={setIsModalOpenDaily}
                  >
                    Cancel
                  </button>

                  {!cartItemId ? (
                    <button
                      className="confirm-button"
                      onClick={handleAddToCartWithPreferences}
                    >
                      Confirm and Add to Cart
                    </button>
                  ) : (
                    <button
                      className="confirm-button"
                      onClick={handleupdatetheAddToCartt}
                    >
                      Update and Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // *************************Alternate Days**************************************************
  const renderAlternateModal = (): JSX.Element => {
    if (!isAlternateModalOpen) return <></>;

    return (
      <div className="delivery-preferences-modal">
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Alternate Days Delivery</h3>
              <button
                className="close-button"
                onClick={handleCloseModalAlternateDays}
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="modal-content">
              <div className="main-card-daily-delivery">
                {/* Date picker section */}
                <div className="delivery-section date-picker-section">
                  <div className="section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    Choose Start Date
                  </div>
                  <div className="main-card-daily-delivery-box">
                    <label>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      When would you like to start?
                    </label>
                    <DatePicker
                      selected={startDate ? new Date(startDate) : null}
                      onChange={(date: Date | null) => {
                        if (date) {
                          setStartDate(date.toISOString().split('T')[0]);
                        } else {
                          setStartDate('');
                        }
                      }}
                      minDate={new Date(minDate)}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select a start date"
                      required
                    />
                  </div>
                </div>

                {/* Delivery preference section */}
                <div className="delivery-section">
                  <div className="section-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    Delivery Preference
                  </div>
                  <div className="select-wrapper">
                    <select
                      value={deliveryPreference}
                      onChange={(e) => setDeliveryPreference(e.target.value)}
                      aria-label="Select delivery preference"
                    >
                      {deliveryOptionsPreference &&
                        deliveryOptionsPreference.length > 0 ? (
                        deliveryOptionsPreference.map((elem, elemIndex) => (
                          <React.Fragment key={`alt-elem-${elemIndex}`}>
                            {elem.deliveryPreference &&
                              elem.deliveryPreference.length > 0 ? (
                              elem.deliveryPreference.map((option: any) => (
                                <option key={option.id} value={option.id}>
                                  {option.name}
                                </option>
                              ))
                            ) : (
                              <option key="alt-no-preference" value="">
                                No delivery options available
                              </option>
                            )}
                          </React.Fragment>
                        ))
                      ) : (
                        <option value="">No delivery options available</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Select days section */}
                <div className="delivery-section">
                  <div className="delivery-dropdown">
                    <label>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                      </svg>
                      Select Number of Days:
                    </label>
                    <div className="select-wrapper">
                      <select
                        value={deliveries}
                        onChange={(e) => {
                          const selectedValue = Number(e.target.value);
                          setDeliveries(selectedValue);
                        }}
                        aria-label="Select number of days"
                      >
                        {deliveryOptionsPreference &&
                          deliveryOptionsPreference.length > 0 &&
                          deliveryOptionsPreference.map((elem, elemIndex) => {
                            return elem.packages && elem.packages.length > 0
                              ? elem.packages.map((option: any, optionIndex: number) => {
                                if (option.package_name === "Alternate Days") {
                                  return option.no_of_deliveries
                                    .split(",")
                                    .map((delivery: string, index: number) => (
                                      <option key={`alt-${elemIndex}-${optionIndex}-${index}`} value={delivery}>
                                        {`${delivery} days`}
                                      </option>
                                    ));
                                }
                                return null;
                              })
                              : null;
                          })}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="action-buttons">
                  <button
                    className="cancel-button"
                    onClick={handleCloseModalAlternateDays}
                  >
                    Cancel
                  </button>

                  {!cartItemId ? (
                    <button
                      className="confirm-button"
                      onClick={handleAddToCartWithAlternate}
                    >
                      Confirm and Add to Cart
                    </button>
                  ) : (
                    <button
                      className="confirm-button"
                      onClick={handleupdatetheAddToCart}
                    >
                      Update and Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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