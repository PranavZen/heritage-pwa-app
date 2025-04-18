import React, { useEffect, useState } from 'react';
import { hooks } from '../hooks';
import { Routes } from '../routes';
import { svg } from '../assets/svg';
import { DishType } from '../types';
import { components } from '../components';
import { actions } from '../store/actions';
import axios from 'axios';
import { Modal, notification } from 'antd';

export const Dish: React.FC = () => {


  interface CheckCartData {
    delivery_preference?: string;
    no_of_deliveries?: string;
  }

  const navigate = hooks.useNavigate();
  const dispatch = hooks.useDispatch();
  const location = hooks.useLocation();
  const [packageOptions, setPackageOptions] = useState<any[]>([]);
  const [deliveryOptionsPreference, setDeliveryOptionsPreference] = useState<
    any[]
  >([]);
  const [quantity, setQuantity] = useState<number>(1);


  // console.log("aaaaaaa", quantity);
  const [cartId, setCartId] = useState<string[]>([]);
  const [cartItemId, setCartItemId] = useState<string | null>(null);
  const [opacity, setOpacity] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [isAlternateModalOpen, setIsAlternateModalOpen] =
    useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [deliveryPreference, setDeliveryPreference] = useState<string>("");

  // console.log("deliveryPreference", deliveryPreference);

  const [deliveries, setDeliveries] = useState<number>(15);
  const [customSelectedDays, setCustomSelectedDays] = useState<string[]>([]);

  const [checkCartData, SetCheckCartData] = useState<CheckCartData>({});

  interface CartItem {
    quantity: number;
  }

  const [cartData, setCartData] = useState<CartItem[] | undefined>(undefined);


  // console.log("ccccccccccccccccc", cartData);

  const dish: DishType = location.state.dish;
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
    fetchCartData();
  }, [cityId, c_id, dish.product_option_value_id]);

  const handleRemoveFromCart = async (event: React.MouseEvent) => {
    event.stopPropagation();

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
          window.location.reload();
          setQuantity(0);
          // setCartItemId(null);
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

  const handleAddToCart = async (cartData: any) => {

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
    try {
      const formData = new FormData();
      formData.append("c_id", String(c_id || "1"));
      formData.append("product_id", String(cartData.product_id ?? ""));
      formData.append("package_id", "13");
      formData.append(
        "product_option_id",
        String(cartData.product_option_id ?? "")
      );
      formData.append(
        "product_option_value_id",
        String(cartData.product_option_value_id ?? "")
      );
      formData.append("quantity", "1");
      formData.append("weight", String(cartData.weight ?? ""));
      formData.append("weight_unit", String(cartData.weight_unit ?? ""));

      formData.append('delivery_preference', '0');
      formData.append('no_of_deliveries', '0');
      formData.append('order_date', getTomorrowDate());
      formData.append('order_type', '2');

      const response = await axios.post(
        "https://heritage.bizdel.in/app/consumer/services_v11/addItemToCart",
        formData
      );
      // console.log("wwwwwww", response)
      if (response.data.status) {
        notification.success({ message: response.data.message });
        window.location.reload();
        dispatch(actions.addToCart(response.data.cartItem));
      } else {
        console.error("Failed to add item to cart:", response.data.message);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
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
        onCancel() {
        },
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
      formData.append('product_option_id', String(cartData.product_option_id));
      formData.append('product_option_value_id', String(cartData.product_option_value_id));
      formData.append('quantity', '1');
      formData.append('weight', String(cartData.weight));
      formData.append('weight_unit', String(cartData.weight_unit));
      formData.append('delivery_preference', String(cartData.deliveryPreference));
      formData.append('no_of_deliveries', String(cartData.deliveries));
      formData.append('order_date', getTomorrowDate());
      formData.append('order_type', '1');

      // console.log("formData", formData);
      const response = await axios.post(
        "https://heritage.bizdel.in/app/consumer/services_v11/addItemToCart",
        formData
      );
      console.log("rrrrrrrrrrrrrrr", response);
      if (response.data.status === "success") {
        notification.success({
          message: "Success",
          description: response.data.message,
        });
        window.location.reload();
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
  const handleUpdateCart = async (
    newQuantity: number,

  ) => {
    if (newQuantity < 1) return;

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
    formData.append('delivery_preference', checkCartData.delivery_preference || '0');
    formData.append('no_of_deliveries', checkCartData.no_of_deliveries || '0');
    formData.append('order_date', formattedDate);
    formData.append('order_type', '2');

    try {
      const response = await axios.post(
        "https://heritage.bizdel.in/app/consumer/services_v11/updateCartItem",
        formData
      );

      if (response.data.status === "success") {
        setQuantity(newQuantity);
        notification.success({ message: response.data.message });
        window.location.reload();
      } else {
        notification.error({ message: "Please 1st add the item." });
      }
    } catch (error) {
      notification.error({ message: "Error updating cart:" });
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

    const formData = new FormData();

    // Date validation
    const formattedDate = startDate
      ? new Date(startDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    formData.append('id', cartItemId || '');
    formData.append('c_id', c_id);
    formData.append('package_id', '13');
    formData.append('quantity', String(deliveries));
    formData.append('delivery_preference', deliveryPreference || '0');
    formData.append('no_of_deliveries', String(deliveries));
    formData.append('order_date', formattedDate);
    formData.append('order_type', '2');

    try {
      const response = await axios.post(
        "https://heritage.bizdel.in/app/consumer/services_v11/updateCartItem",
        formData
      );

      if (response.data.status === "success") {
        notification.success({ message: response.data.message });
        window.location.reload();
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
      formData.append("product_option_value_id", "50");
      try {
        const response = await axios.post(
          `https://heritage.bizdel.in/app/consumer/services_v11/productDetailsByOption`,
          formData
        );

        // console.log("paaaaaaaaaaaaaaa", response.data.productDetails);

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

  const handleOpenCustomModal = () => {
    setIsCustomModalOpen(true);
  };

  const handleCloseCustomModal = () => {
    setIsCustomModalOpen(false);
  };

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
    if (cartCount) {
      dispatch(actions.addToCart(dishWithPreferences));
      handleCloseModal();
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
      handleCloseModal();
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
                onClick={(event) =>
                  quantity === 1
                    ? handleRemoveFromCart(event)
                    : handleUpdateCart(quantity - 1)
                }
                className="cartButton"
              >
                -
              </button>

              <span className="countNum">{quantity}</span>

              {/* {!cartData ? <> <span className="countNum">{quantity}</span> </>
                :
                <>
                  <span className="countNum">
                    {quantity || cartData?.map((elem:any) => elem.quantity)}
                  </span>

                </>
              } */}

              <button
                onClick={() => handleUpdateCart(quantity + 1)}
                className="cartButton"
              >
                +
              </button>
            </div>
            <span>Per Day</span>
          </div>
          <div className="priceWrap">
            <span><small>MRP</small> ₹ {dish.price}</span>
          </div>
          <span className="ppText">Per Pack</span>
          <p className="fatText">Fat 3.0%, SNF 8.5%</p>
        </div>
        {/* <p className="t16">{dish.description}</p> */}
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
              text="update "
              onClick={handleupdatetheAddToCart}
              containerStyle={{marginBottom: 10}}
            /> </div>
        }

        {/* add quantity */}

        <components.Button
          text="Daily"
          onClick={handleOpenModal}
          containerStyle={{ marginBottom: 10 }}
        />
        <components.Button
          text="Alternate Days"
          onClick={handleOpenModalAlternateDays}
          containerStyle={{ marginBottom: 10 }}
        />
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
      <components.Modal title="Delivery Preferences" onClose={handleCloseModal}>
        <div className="main-card-daily-delivery">
          <div className="main-card-daily-delivery-box">
            <label>Start Date:- </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={minDate}
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
            !cartItemId ? <> <components.Button
              text="Confirm and Add to Cart"
              onClick={handleAddToCartWithPreferences}
            /> </> : <> <components.Button
              text="update and Add to Cart"
              onClick={handleupdatetheAddToCart}
            /></>
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
            <label>Start Date :- </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={minDate}
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
