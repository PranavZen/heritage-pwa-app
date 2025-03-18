import React from "react";
import { useSelector } from "react-redux";

import { hooks } from "../hooks";
import { DishType } from "../types";
import { svg } from "../assets/svg";
import { RootState } from "../store";
import { actions } from "../store/actions";
import { components } from "../components";

type Props = {
  index: number;
  dish: DishType;
  isLast: boolean;
};

export const RecomendedItem: React.FC<Props> = ({ index, dish, isLast }) => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();

  const wishlist = useSelector((state: RootState) => state.wishlistSlice);

  const ifInWishlist = wishlist.list.find(
    (item) => item.option_value_name === dish.option_value_name
  );

  // console.log("ifInWishlist",ifInWishlist)

  const cartHandler = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    // console.log('Added to cart:', dish);
    event.stopPropagation();
    dispatch(actions.addToCart(dish));
  };

  const wishlistHandler = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    if (ifInWishlist) {
      dispatch(actions.removeFromWishlist(dish));
    } else {
      dispatch(actions.addToWishlist(dish));
    }
  };
  return (
    <div
      style={{
        marginLeft: index === 0 ? 20 : 0,
        marginRight: isLast ? 20 : 0,
      }}
      onClick={() =>
        navigate(`/dish/${dish.option_value_name}`, { state: { dish } })
      }
      className="proCardWrap"
    >
      <img
        src={dish.option_value_image}
        alt={dish.name}
        style={{ maxWidth: 149, width: "100%", marginBottom: 10 }}
      />
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
      <button
        onClick={wishlistHandler}
        style={{
          position: "absolute",
          right: 0,
          bottom: 72 - 15,
          padding: 15,
          borderRadius: 10,
        }}
      >
        <svg.HeartSvg dish={dish} />
      </button>
      <components.Name dish={dish} containerStyle={{ marginBottom: 3 }} />
      <components.Price dish={dish} />
      <div className="cartButtonWrap">
        <button className="cartButton" onClick={cartHandler}>
          <svg.PlusSvg />
        </button>
        <span className="countNum">1</span>
        <button className="cartButton" onClick={cartHandler}>
          <svg.MinusSvg />
        </button>
      </div>
    </div>
  );
};
