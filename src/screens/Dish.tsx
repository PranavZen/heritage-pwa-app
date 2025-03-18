import { notification } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { svg } from "../assets/svg";
import { components } from "../components";
import { hooks } from "../hooks";
import { actions } from "../store/actions";
import { DishType } from "../types";

export const Dish: React.FC = () => {
  const navigate = hooks.useNavigate();
  const dispatch = hooks.useDispatch();
  const location = hooks.useLocation();
  const [packageOptions, setPackageOptions] = useState<any[]>([]);
  const [deliveryOptionsPreference, setDeliveryOptionsPreference] = useState<any[]>([]);

  // console.log("deliveryOptionsPreferencedeliveryOptionsPreference", deliveryOptionsPreference);

  // ***************************************ADDddddddddddddddddddddddddddddddddddddd
  const addToCartApi = async (cartData: any) => {
    console.log("carttttttttttttttttt", cartData);
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
      formData.append('order_date', String(cartData.startDate));
      formData.append('order_type', String(cartData.normal_product));

      console.log('formData',formData);
      const response = await axios.post('https://heritage.bizdel.in/app/consumer/services_v11/addItemToCart', formData);
      console.log('rrrrrrrrrrrrrrr',response);
      if (response.data.status === 'success') {
        notification.success({
          message: "Success",
          description: response.data.message,
        });
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

  // ***********************************************


  const dish: DishType = location.state.dish;
  //*********************************************************************************
  const c_id = localStorage.getItem('c_id')
  const cityId = localStorage.getItem('cityId')
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
        console.log(error);
      }
    };
    deliveryData();
  }, []);

  //********************************************************************
  const [opacity, setOpacity] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [isAlternateModalOpen, setIsAlternateModalOpen] =
    useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [deliveryPreference, setDeliveryPreference] = useState<string>("");
  const [deliveries, setDeliveries] = useState<number>(15);
  const [customSelectedDays, setCustomSelectedDays] = useState<string[]>([]);

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
      c_id: c_id || 'null',
      product_id: dish.product_id,
      product_option_id: 6,
      product_option_value_id: 11,
      quantity: 1,
      weight: dish.weight,
      weight_unit: 'g',
      delivery_preference: deliveryPreference,
      no_of_deliveries: deliveries,
      order_date: startDate,
      order_type: 2,
    };
    const cartCount = await addToCartApi(dishWithPreferences);
    if (cartCount) {
      dispatch(actions.addToCart(dishWithPreferences));
      handleCloseModal();
    }
  };

  // ********************************Alternate add to cart************************************************

  const handleAddToCartWithCustomPreferences = async () => {
    const dishWithCustomPreferences = {
      c_id: c_id || "null",
      // package_id: 13, // Assuming this value is predefined or can be dynamic
      package_days: 0,
      product_id: dish.product_id, // Assuming `dish` contains the product ID
      product_option_id: 6, // Assuming the product option ID is static or can be dynamic
      product_option_value_id: 11, // Assuming the product option value ID is static or can be dynamic
      quantity: 1, // Set as per the dish quantity
      weight: dish.weight, // Set as per the dish weight
      weight_unit: "g", // Assuming weight unit is 'g'
      delivery_preference: deliveryPreference,
      no_of_deliveries: deliveries,
      order_date: startDate, // Start date
      order_type: 2, // Assuming order type is static or can be dynamic
    };

    const cartCount = await addToCartApi(dishWithCustomPreferences);
    if (cartCount) {
      // Optionally update the cart count in your app state or UI
      // For example, dispatch(actions.updateCartCount(cartCount));
      handleCloseCustomModal();
    }
  };

  const handleCustomDaySelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;

    const upperCaseValue = value.toUpperCase();

    setCustomSelectedDays((prevSelectedDays) => {
      if (checked) {
        return [...prevSelectedDays, upperCaseValue];
      } else {
        return prevSelectedDays.filter((day) => day !== upperCaseValue);
      }
    });
  };

  const renderHeader = (): JSX.Element => {
    return <components.Header showGoBack={true} showBasket={true} />;
  };

  const renderImage = (): JSX.Element => {
    return (
      <section style={{ position: "relative", marginBottom: 30 }}>
        <img
          src={dish.option_value_image}
          alt={dish.option_name}
          style={{
            width: "100%",
            height: "auto",
          }}
        />
      </section>
    );
  };

  const renderDetails = (): JSX.Element => {
    return (
      <section className="container">
        {/* <div className="row-center-space-between" style={{ marginBottom: 12 }}>
          <h3
            className="number-of-lines-1"
            style={{ textTransform: "capitalize" }}
          >
            {dish.name}
          </h3>
          <span
            className="t16"
            style={{ marginLeft: 14, whiteSpace: "nowrap" }}
          >
            <div>
              {dish.kcal} kcal - {dish.weight}g{" "}
            </div>
            {dish.option_value_name}
          </span>
        </div>
        <p className="t16">{dish.description}</p> */}
        <div className="row-center-space-between">
          <h3 className="number-of-lines-1">
            Toned Milk <small> (200g) </small>
          </h3>
          {dish.isNew && (
            <img
              alt={dish.option_name}
              src={require("../assets/icons/14.png")}
              style={{
                width: 58.09,
                height: "auto",
              }}
            />
          )}
          {dish.isHot && (
            <img
              alt="Hot"
              src={require("../assets/icons/15.png")}
              style={{
                width: 24,
                marginLeft: 20,
                marginTop: 20,
                height: "auto",
              }}
            />
          )}
          <button
            style={{
              padding: 14,
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
        <p className="t16">{dish.description}</p>
      </section>
    );
  };

  const renderButtons = (): JSX.Element => {
    return (
      <section style={{ padding: 20 }}>
        <div  
          className="row-center-space-between"
          style={{
            backgroundColor: 'var(--white-color)',
            borderRadius: 10,
            paddingLeft: 20,
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontFamily: 'DM Sans',
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            ₹ {dish.price}
          </span>
          <div className="row-center">
            <button
              style={{ padding: '23px 20px', borderRadius: 4 }}
              onClick={() => {
                dispatch(actions.removeFromCart(dish));
              }}
            >
              <svg.MinusSvg />
            </button>
            <div style={{ marginLeft: 4, marginRight: 4 }}>
              <span
                className="t14"
                style={{ fontWeight: 700, color: "var(--text-color)" }}
              >
                {getDishQty(dish.option_value_name ?? 0)}
              </span>
            </div>
            {/* increaseeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee */}
            <button
              style={{ padding: '23px 20px', borderRadius: 4 }}
              onClick={() => {
                dispatch(actions.addToCart(dish));
              }}
            >
              <svg.PlusSvg />
            </button>
          </div>

          {/* Remove quantity from cart */}

        </div>
      </section>
    );
  };

  const renderButtons = (): JSX.Element => {
    return (
      <section style={{ padding: 20 }}>
        <div>
          <p className="Choose-your-delivery-plan">Choose your delivery plan</p>
        </div>


        <components.Button
          text="+ Add to cart"
          onClick={() => {
            dispatch(actions.addToCart(dish));
          }}

          containerStyle={{ marginBottom: 10 }}
        />

        <components.Button
          text="Daily"
          onClick={handleOpenModal}
          containerStyle={{ marginBottom: 10 }}
        />
        <components.Button
          text="Alternate Days"
          onClick={handleOpenModalAlternateDays}
          containerStyle={{ marginBottom: 10}}
        />

        {/* <components.Button
          text="Custom"
          onClick={handleOpenCustomModal}
          containerStyle={{ marginBottom: 10 }}
        /> */}
      </section>
    );
  };
  const renderModal = (): JSX.Element => {
    if (!isModalOpen) return <> </>;
    return (
      <components.Modal title="Delivery Preferences" onClose={handleCloseModal}>
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
                console.log("Selected Delivery :", selectedValue);
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
          <components.Button
            text="Confirm and Add to Cart"
            onClick={handleAddToCartWithPreferences}
          />
        </div>
      </components.Modal>
    );
  };

  // *************************Alternate Days**************************************************
  const renderAlternateModal = (): JSX.Element => {
    if (!isAlternateModalOpen) return <></>;

    return (
      <components.Modal title="Delivery Preferences"
        onClose={handleCloseModalAlternateDays}>
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
            { deliveryOptionsPreference &&  deliveryOptionsPreference.length > 0 ? (
               deliveryOptionsPreference.map((elem) => (
                <>
                  {elem.deliveryPreference && elem.deliveryPreference.length > 0 ? (
                    
                    elem.deliveryPreference.map((option: any) => (
                      <> 
                      {console.log("eeeeeee", )}
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                      </>
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
                console.log('Selected Delivery :', selectedValue);
                setDeliveries(selectedValue);
              }}
            >
              {deliveryOptionsPreference && deliveryOptionsPreference.length > 0 &&
                deliveryOptionsPreference.map((elem) => {
                  return elem.packages && elem.packages.length > 0
                    ? elem.packages.map((option: any) => {
                      if (option.package_name === 'Alternate Days') {
                        return option.no_of_deliveries
                          .split(',')
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
          <components.Button
            text="Confirm and Add to Cart"
            onClick={handleAddToCartWithAlternate}
          />
        </div>
      </components.Modal>
    );
  };
  // **************************Alternate Days*************************************************

  // **************************Alternate Days*************************************************

  // ****************************Custom*************************************************
  // const renderCustomModal = (): JSX.Element => {
  //   if (!isCustomModalOpen) return <></>;

  //   return (
  //     <components.Modal
  //       title="Custom Delivery Preferences"
  //       onClose={handleCloseCustomModal}
  //     >
  //       <div className="main-card-daily-delivery">
  //         <div className="main-card-daily-delivery-box">
  //           <label>Start Date:- </label>
  //           <input
  //             type="date"
  //             value={startDate}
  //             onChange={(e) => setStartDate(e.target.value)}
  //             min={minDate}
  //           />
  //         </div>

  //         <div className="week-days">
  //           {deliveryOptionsPreference &&
  //             deliveryOptionsPreference.length > 0 &&
  //             deliveryOptionsPreference.map((elem, elemIndex) => {
  //               return elem.packages && elem.packages.length > 0
  //                 ? elem.packages.map((option: any, optionIndex: number) => {
  //                   if (option.package_name === 'Daily') {
  //                     return option.days
  //                       .split(',')
  //                       .map((delivery: any, dayIndex: number) => (
  //                         <label key={`${elemIndex}-${optionIndex}-${dayIndex}`}>
  //                           <input
  //                             type="checkbox"
  //                             value={delivery.toUpperCase()} // Ensure the value is in uppercase
  //                             checked={customSelectedDays.includes(delivery.toUpperCase())}
  //                             onChange={handleCustomDaySelection}
  //                           />
  //                           {delivery.toUpperCase()} {/* Display the day in uppercase */}
  //                         </label>
  //                       ));
  //                   }
  //                 })
  //                 : null;
  //             })}
  //         </div>

  //         <div className="main-card-daily-delivery-box">
  //           <label>Delivery Preference :-</label>
  //           <select
  //             value={deliveryPreference}
  //             onChange={(e) => setDeliveryPreference(e.target.value)}
  //           >
  //             {deliveryOptionsPreference && deliveryOptionsPreference.length > 0 ? (
  //               deliveryOptionsPreference.map((elem) => (
  //                 <>
  //                   {elem.deliveryPreference && elem.deliveryPreference.length > 0 ? (
  //                     elem.deliveryPreference.map((option: any) => (
  //                       <option key={option.id} value={option.id}>
  //                         {option.name}
  //                       </option>
  //                     ))
  //                   ) : (
  //                     <option key="no-preference" value="">
  //                       No delivery options available
  //                     </option>
  //                   )}
  //                 </>
  //               ))
  //             ) : (
  //               <option value="">No delivery options available</option>
  //             )}
  //           </select>
  //         </div>

  //         <div className="delivery-dropdown">
  //           <label>Select Days:</label>
  //           <select
  //             value={deliveries}
  //             onChange={(e) => {
  //               const selectedValue = Number(e.target.value);
  //               console.log('Selected Delivery:', selectedValue);
  //               setDeliveries(selectedValue);
  //             }}
  //           >
  //             {deliveryOptionsPreference && deliveryOptionsPreference.length > 0 &&
  //               deliveryOptionsPreference.map((elem) => {
  //                 return elem.packages && elem.packages.length > 0 ? elem.packages.map((option: any) => {
  //                   if (option.package_name === "Custom") {
  //                     return option.no_of_deliveries.split(',').map((delivery: string, index: number) => (
  //                       <option key={index} value={delivery}>
  //                         {`${delivery}`}
  //                       </option>
  //                     ));
  //                   }
  //                 }) : null;
  //               })}
  //           </select>
  //         </div>

  //       </div>

  //       <div>
  //         <components.Button
  //           text="Confirm and Add to Cart"
  //           onClick={handleAddToCartWithCustomPreferences}
  //         />
  //       </div>
  //     </components.Modal>
  //   );
  // };

  // ***************************Custom************************************************

  const renderContent = (): JSX.Element => {
    return (
      <main className="scrollable">
        {renderImage()}
        {renderDetails()}
        {renderButtons()}
      </main>
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
