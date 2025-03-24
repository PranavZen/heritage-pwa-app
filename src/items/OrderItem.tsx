import React, { useState } from "react";
import { hooks } from "../hooks";
import { svg } from "../assets/svg";
import axios from "axios";
import type { DishType } from "../types";
import { notification, Button, Modal, Input } from "antd";

type Props = {
  dish: DishType;
  isLast: boolean;
};

export const OrderItem: React.FC<Props> = ({ dish, isLast }) => {
  // console.log("dish", dish);
  const navigate = hooks.useNavigate();
  const { removeFromCart } = hooks.useCartHandler();

  const [quantity, setQuantity] = useState(Number(dish.quantity) || 1);
  const [deliveryPreference, setDeliveryPreference] = useState(
    String(dish.delivery_preference) || ""
  );
  const [noOfDeliveries, setNoOfDeliveries] = useState(
    Number(dish.no_of_deliveries) || 1
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUpdateCart = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    const formData = new FormData();
    formData.append("id", String(dish.cart_id));
    formData.append("c_id", localStorage.getItem("c_id") || "");
    formData.append("package_id", String(dish.package_id || "13"));
    formData.append("quantity", String(newQuantity));
    formData.append("delivery_preference", deliveryPreference);
    formData.append("no_of_deliveries", String(noOfDeliveries));
    formData.append("order_date", String(dish.cart_order_date));
    formData.append("order_type", "1");

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
        notification.error({ message: response.data.message });
      }
    } catch (error) {
      console.error("Error updating cart:", error);
    }
  };

  const handleRemoveFromCart = async (event: React.MouseEvent) => {
    event.stopPropagation();

    if (quantity > 1) {
      handleUpdateCart(quantity - 1);
    } else {
      try {
        const formData = new FormData();
        formData.append("id", String(dish.cart_id));
        formData.append("c_id", localStorage.getItem("c_id") || "");

        const response = await axios.post(
          "https://heritage.bizdel.in/app/consumer/services_v11/deleteCartItem",
          formData
        );

        if (response.data.status === "success") {
          notification.success({ message: response.data.message });
          window.location.reload();
        } else {
          notification.error({ message: response.data.message });
        }
      } catch (error) {
        console.error("Error removing item from cart:", error);
      }
    }
  };

  // **************** Open Modal to Update Product ****************
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    await handleUpdateCart(quantity);
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <li className="cartLitItem">
        <div className="cartLeftBox">
          <div className="cartItmImgWrap">
            <img
              src={dish.option_value_image}
              alt={dish.name}
              className="cartItemImg"
            />
          </div>
          <div className="cartItemDetailsWrap">
            <span
              className="t14"
              style={{
                color: "var(--main-color)",
                fontWeight: 600,
                fontSize: 16,
              }}
            >
              {dish.option_name}{" "}
              <span className="t10" style={{ fontSize: 14 }}>
                {/* {dish.kcal} kcal - {dish.weight}g */}({dish.weight}ml)
              </span>
            </span>

            <span
              className="t14"
              style={{
                color: "var(--main-color)",
                fontWeight: 600,
                fontSize: 16,
              }}
            >
              ₹ {dish.price}
            </span>

            <span
              className="t14"
              style={{ color: "var(--main-color)", fontWeight: 500 }}
            >
              <span className="cartLable">Qty :</span> {quantity}
            </span>
            <span
              className="t14"
              style={{ color: "var(--main-color)", fontWeight: 500 }}
            >
              <span className="cartLable">Deliveries :</span>{" "}
              {dish.no_of_deliveries}
            </span>
            <span
              className="t14"
              style={{ color: "var(--main-color)", fontWeight: 500 }}
            >
              <span className="cartLable">Preference :</span>{" "}
              {dish.preferenceName}
            </span>
            <span
              className="t14"
              style={{ color: "var(--main-color)", fontWeight: 500 }}
            >
              <span className="cartLable">Package :</span> {dish.packages_name}
            </span>
            <span
              className="t14"
              style={{ color: "var(--main-color)", fontWeight: 500 }}
            >
              <span className="cartLable">Starts on :</span>{" "}
              {dish.cart_order_date}
            </span>
          </div>
        </div>
        <div className="cartRightBox">
          <div className="cartButtonWrap">
            <div onClick={handleOpenModal} className="cartButton">Modify</div>
          </div>
          {/* Remove (Decrease Quantity) */}
          <div className="cartButtonWrap">
            <button className="cartButton" onClick={handleRemoveFromCart}>
              <svg.RemoveSvg />
            </button>

            {/* Display updated quantity */}
            <span className="countNum">{quantity}</span>

            {/* Add to cart (Increase Quantity) */}
            <button
              className="cartButton"
              onClick={() => handleUpdateCart(quantity + 1)}
            >
              <svg.AddSvg />
            </button>
          </div>
        </div>
      </li>

      {/* update data modal */}
      <div>
        {/* Cart Item Display */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p>{dish.name}</p>

          {/* Remove from Cart Button */}
          {/* <button
            style={{ padding: '14px 14px 4px 14px', borderRadius: 4 }}
            onClick={handleRemoveFromCart}
          > */}
          {/* <svg.RemoveSvg /> */}
          {/* </button> */}
        </div>

        {/* Update Modal */}
        <Modal
          title="Update Order"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <label>Quantity:</label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />

          <label>Delivery Preference:</label>
          <Input
            type="text"
            value={deliveryPreference}
            onChange={(e) => setDeliveryPreference(e.target.value)}
          />

          <label>No. of Deliveries:</label>
          <Input
            type="number"
            value={noOfDeliveries}
            onChange={(e) => setNoOfDeliveries(Number(e.target.value))}
          />
        </Modal>
      </div>
    </>
  );
};
