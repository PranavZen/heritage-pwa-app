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


export const Dish: React.FC = () => {
<<<<<<< HEAD


  interface CheckCartData {
    delivery_preference?: string;
    no_of_deliveries?: string;
=======
  interface CheckCartData {
    delivery_preference?: string;
    no_of_deliveries?: string;
    order_type: string;
>>>>>>> roshan
  }

  const navigate = hooks.useNavigate();
  const dispatch = hooks.useDispatch();
  const location = hooks.useLocation();
  const [packageOptions, setPackageOptions] = useState<any[]>([]);
<<<<<<< HEAD
  const [deliveryOptionsPreference, setDeliveryOptionsPreference] = useState<
    any[]
  >([]);
  const [quantity, setQuantity] = useState<number>(1);


  // console.log("aaaaaaa", quantity);
  const [cartId, setCartId] = useState<string[]>([]);
  const [cartItemId, setCartItemId] = useState<string | null>(null);
=======
  const [deliveryOptionsPreference, setDeliveryOptionsPreference] = useState<any[]>([]);


  const shouldRefresh = useSelector((state: RootState) => state.cartSlice.shouldRefresh);
  // console.log("deliveryOptionsPreference", shouldRefresh);
  const [quantity, setQuantity] = useState<number>(1);
  // console.log("aaaaaaa", quantity);

  const [cartId, setCartId] = useState<string[]>([]);
  const [cartItemId, setCartItemId] = useState<string | null>(null);


  // console.log("cartItemIdz", cartItemId);

>>>>>>> roshan
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
<<<<<<< HEAD
  const [deliveryPreference, setDeliveryPreference] = useState<string>("");

  // console.log("deliveryPreference", deliveryPreference);

  const [deliveries, setDeliveries] = useState<number>(15);
  const [customSelectedDays, setCustomSelectedDays] = useState<string[]>([]);

  const [checkCartData, SetCheckCartData] = useState<CheckCartData>({});
=======
  const [deliveryPreference, setDeliveryPreference] = useState<string>('1');

  const [deliveries, setDeliveries] = useState<number>(30);

  const [customSelectedDays, setCustomSelectedDays] = useState<string[]>([]);

  // const [checkCartData, SetCheckCartData] = useState<CheckCartData>({});

  const [checkCartData, SetCheckCartData] = useState<CheckCartData>({
    order_type: '',  // Initial value for `order_type`, adjust as needed
  });

  // console.log("checkCartData", checkCartData);
>>>>>>> roshan

  interface CartItem {
    quantity: number;
  }

  const [cartData, setCartData] = useState<CartItem[] | undefined>(undefined);


  // console.log("ccccccccccccccccc", cartData);

  const dish: DishType = location.state.dish;

  // Ensure dish and the properties exist
  if (dish && dish.product_option_id && dish.product_option_value_id) {
    localStorage.setItem('product_option_id', dish.product_option_id.toString());
    localStorage.setItem('product_option_value_id', dish.product_option_value_id.toString());
  } else {
    console.error('Error: Missing product_option_id or product_option_value_id in dish', dish);
  }


  const c_id = localStorage.getItem("c_id");
  const cityId = localStorage.getItem("cityId");


  // console.log("roshannnnnnnnnnnn", dish);

  // **************************************Modify cart data*************************************************************
  // **************************************Modify cart data*************************************************************
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const formData = new FormData();
        formData.append('city_id', cityId || '');
        formData.append('c_id', c_id || '');
        formData.append('next_id', '0');
        const response = await axios.post(
          'https://heritage.bizdel.in/app/consumer/services_v11/getCartData',
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

          console.log("eeeeeeeeeeeeeee", matchedItem);

          if (matchedItem) {
            setQuantity(Number(matchedItem.quantity) || 1);
            setCartItemId(String(matchedItem.cart_id));
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
<<<<<<< HEAD
=======


    // if (shouldRefresh) {
    //   fetchCartData().finally(() => {
    //     dispatch(setShouldRefresh(true));
    //   });
    // }
>>>>>>> roshan
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
<<<<<<< HEAD
      console.log("rrrrrrrrrrrrrrr", response);
=======

>>>>>>> roshan
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
<<<<<<< HEAD
  const handleUpdateCart = async (
    newQuantity: number,

  ) => {
=======
  const [localQuantity, setLocalQuantity] = useState<number>(1);


  // console.log("localQuantitylocalQuantity", localQuantity);

  const isInCart = !!cartItemId;

  const handleUpdateCart = async (newQuantity: number) => {
>>>>>>> roshan
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
<<<<<<< HEAD
    formData.append('delivery_preference', checkCartData.delivery_preference || '0');
    formData.append('no_of_deliveries', checkCartData.no_of_deliveries || '0');
=======
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
    formData.append('package_id', '13');
    formData.append('quantity', String(quantity));
    formData.append('delivery_preference', '0');
    formData.append('no_of_deliveries', '0');
>>>>>>> roshan
    formData.append('order_date', formattedDate);
    formData.append('order_type', '2');

    try {
      const response = await axios.post(
        "https://heritage.bizdel.in/app/consumer/services_v11/updateCartItem",
        formData
      );

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

<<<<<<< HEAD


  // ((*(((((((((((((((((((((((((((((((((((((((((((((((((())))))))))))))))))))))))))))))))))))))))))))))))))))
  const handleupdatetheAddToCart = async () => {
=======
  const handleupdatetheAddToCartt = async () => {
>>>>>>> roshan
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

<<<<<<< HEAD
=======

>>>>>>> roshan
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
<<<<<<< HEAD

    const formData = new FormData();

=======
    setIsModalOpen(false);
    setIsAlternateModalOpen(false);

    const formData = new FormData();
>>>>>>> roshan
    // Date validation
    const formattedDate = startDate
      ? new Date(startDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
<<<<<<< HEAD

    formData.append('id', cartItemId || '');
    formData.append('c_id', c_id);
    formData.append('package_id', '13');
    formData.append('quantity', String(deliveries));
    formData.append('delivery_preference', deliveryPreference || '0');
    formData.append('no_of_deliveries', String(deliveries));
    formData.append('order_date', formattedDate);
    formData.append('order_type', '2');

=======
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
>>>>>>> roshan
    try {
      const response = await axios.post(
        "https://heritage.bizdel.in/app/consumer/services_v11/updateCartItem",
        formData
      );

<<<<<<< HEAD
      if (response.data.status === "success") {
        notification.success({ message: response.data.message });
        window.location.reload();
=======
      // console.log('zzz', response);

      if (response.data.status === "success") {
        notification.success({ message: response.data.message });
        // window.location.reload();
>>>>>>> roshan
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
      formData.append("product_option_value_id" , String(localStorage.getItem('product_option_value_id')));
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
  const { addToWishlist, removeFromWishlist, ifInWishlist } =
    hooks.useWishlistHandler();

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

<<<<<<< HEAD

=======
>>>>>>> roshan
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
          style={{
            padding: 14,
            position: "absolute",
            right: 0,
            top: 0,
            borderRadius: 4,
          }}
          onClick={(event) => {
            ifInWishlist(dish.option_value_name ?? 0)
              ? removeFromWishlist(dish, event)
              : addToWishlist(dish, event);
          }}
        >
          <svg.HeartSvg dish={dish} />
        </button>
      </div>
    );
  };




  const renderDetails = (): JSX.Element => {
    return (
      <div className="productInfoBox">
        <div className="infoWrap">
          <h3
            className="number-of-lines-1"
            style={{ textTransform: "capitalize" }}
          >
            {dish.option_value_name}
          </h3>
          <span className="t16">{dish.weight} ml</span>
          <div className="ppdBox">
            <span>Packs</span>
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
              >
                <svg.MinusSvg />
              </button>

<<<<<<< HEAD
              <span className="countNum">{quantity}</span>

              {/* {!cartData ? <> <span className="countNum">{quantity}</span> </>
                :
                <>
                  <span className="countNum">
                    {quantity || cartData?.map((elem:any) => elem.quantity)}
                  </span>

                </>
              } */}
=======
              <span className="countNum">
                {isInCart ? quantity : localQuantity}


              </span>
>>>>>>> roshan

              <button
                onClick={() => {
                  if (isInCart) {
                    handleUpdateCart(quantity + 1);
                  } else {
                    setLocalQuantity(localQuantity + 1);
                  }
                }}
                className="cartButton"
              >
                <svg.AddSvg />
              </button>
            </div>
            <span>Per Day</span>
          </div>

          {/* Add to Cart button only if not in cart */}
          {!isInCart && (
            <button
              onClick={() => handleUpdateCart(localQuantity)}
              className="addToCartButton"
            >
              {/* Add to Cart */}
            </button>
          )}

          <div className="priceWrap">
            <span>
              <small>MRP</small> ₹ {dish.price}
            </span>
          </div>
          <span className="ppText">Per Pack</span>
          <p className="fatText">Fat 3.0%, SNF 8.5%</p>
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
<<<<<<< HEAD

=======
>>>>>>> roshan
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
<<<<<<< HEAD
              text="update "
              onClick={handleupdatetheAddToCart}
              containerStyle={{marginBottom: 10}}
            /> </div>
=======
            text="update "
            onClick={handleupdatetheAddToCart}
            containerStyle={{ marginBottom: 10 }}
          /> </div>
>>>>>>> roshan
        }

        {/* add quantity */}

        <components.Button
          text="Daily"
          onClick={handleOpenModal}
          containerStyle={{ marginBottom: 10 }}
        />
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
      <components.Modal title="Delivery Preferences"
        onClose={setIsModalOpenDaily}
      >
        <div className="main-card-daily-delivery">
          <div className="main-card-daily-delivery-box">
            <label>Start Date:- </label>
<<<<<<< HEAD
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={minDate}
=======
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
              placeholderText="Select a date"

>>>>>>> roshan
              required
            />
          </div>
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
                deliveryOptionsPreference.map((elem) => {
                  return elem.packages && elem.packages.length > 0
                    ? elem.packages.map((option: any) => {
                      if (option.package_name === "Daily") {
                        return option.no_of_deliveries
                          .split(",")
                          .map((delivery: string, index: number) => (
                            <option key={index} value={delivery}>
                              {`${delivery}`}
                            </option>
                          ));
                      }
                    })
                    : null;
                })}
            </select>
          </div>
        </div>
        <div>

          {
<<<<<<< HEAD
            !cartItemId ? <> <components.Button
              text="Confirm and Add to Cart"
              onClick={handleAddToCartWithPreferences}
            /> </> : <> <components.Button
              text="update and Add to Cart"
              onClick={handleupdatetheAddToCart}
            /></>
=======
            !cartItemId
              ? <>
                <components.Button
                  text="Confirm and Add to Cart"
                  onClick={handleAddToCartWithPreferences}
                />
              </> : 
              <>
                <components.Button
                  text="update and Add to Cart"
                  onClick={handleupdatetheAddToCartt}
                />
              </>
>>>>>>> roshan
          }


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
            <label>Start Date:- </label>
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
              placeholderText="Select a date"

              required
            />
          </div>
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
              {deliveryOptionsPreference && deliveryOptionsPreference.length > 0 &&
                deliveryOptionsPreference.map((elem) => {
                  return elem.packages && elem.packages.length > 0
                    ? elem.packages.map((option: any) => {
                      if (option.package_name === "Alternate Days") {
                        return option.no_of_deliveries
                          .split(",")
                          .map((delivery: string, index: number) => (
                            <option key={index} value={delivery}>
                              {`${delivery}`}
                            </option>
                          ));
                      }
                    })
                    : null;
                })}
            </select>
          </div>
        </div>

        <div>
          {
            !cartItemId ? <> <components.Button
              text="Confirm and Add to Cart"
              onClick={handleAddToCartWithAlternate}
            /> </> : <> <components.Button
              text="update and Add to Cart"
              onClick={handleupdatetheAddToCart}
            /></>
          }
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
