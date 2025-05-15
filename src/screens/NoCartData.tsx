
import React, { useState, useEffect } from "react";
import { hooks } from '../hooks';
import { Routes, TabScreens } from "../routes";
import Animation from "../components/Animation/NoCartData.json";
import Lottie from "lottie-react";
import "../scss/empty-cart.scss";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { actions } from "../store/actions";
import axios from "axios";

interface SuggestionItem {
  id: string;
  name: string;
  image: string;
  price: string;
  product_option_value_id: string;
}

const NoCartData: React.FC = () => {
  const navigate = hooks.useNavigate();
  const dispatch = hooks.useDispatch();
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);

  // Get wishlist items count
  const wishlistItems = useSelector((state: RootState) => state.wishlistSlice.list);
  const wishlistCount = wishlistItems ? wishlistItems.length : 0;

  // Fetch popular products for suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const cityId = localStorage.getItem("cityId");
        const c_id = localStorage.getItem("c_id");

        const formData = new FormData();
        formData.append('city_id', cityId || 'null');
        formData.append('c_id', c_id || 'null');
        formData.append('category_id', '28'); // Default category for popular items

        const response = await axios.post(
          `https://heritage.bizdel.in/app/consumer/services_v11/productOptionByCategory`,
          formData
        );

        if (response.data?.optionListing) {
          // Get first 5 items
          const popularItems = response.data.optionListing.slice(0, 5).map((item: any) => ({
            id: item.product_id,
            name: item.option_value_name,
            image: item.option_value_image,
            price: item.price,
            product_option_value_id: item.product_option_value_id
          }));

          setSuggestions(popularItems);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };

    fetchSuggestions();
  }, []);

  // Navigate to menu
  const handleBrowseProducts = () => {
    // Close any open modal first
    const modalElement = document.querySelector('.ant-modal-close') as HTMLElement;
    if (modalElement) {
      modalElement.click();
    }

    // Then navigate
    dispatch(actions.setScreen(TabScreens.Menu));
    navigate(Routes.TabNavigator);
  };

  // Navigate to wishlist (Favorite tab)
  const handleViewWishlist = () => {
    // Close any open modal first
    const modalElement = document.querySelector('.ant-modal-close') as HTMLElement;
    if (modalElement) {
      modalElement.click();
    }

    // Then navigate
    dispatch(actions.setScreen(TabScreens.Favorite));
    navigate(Routes.TabNavigator);
  };

  // Navigate to product details
  const handleProductClick = (productId: string) => {
    // Close any open modal first
    const modalElement = document.querySelector('.ant-modal-close') as HTMLElement;
    if (modalElement) {
      modalElement.click();
    }

    // Then navigate
    navigate(`/dish/${productId}`);
  };

  return (
    <div className="empty-cart-container">
      <div className="animation-container">
        <Lottie
          animationData={Animation}
          style={{ width: "100%", height: "auto" }}
          loop={true}
        />
      </div>

      <h2 className="empty-cart-title">Your Cart is Empty</h2>

      <p className="empty-cart-message">
        Looks like you haven't added any items to your cart yet.
        Start shopping to fill it with delicious products!
      </p>

      {/* <div className="action-buttons">
        <button className="browse-button" onClick={handleBrowseProducts}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          Browse Products
        </button>

        {wishlistCount > 0 && (
          <button className="wishlist-button" onClick={handleViewWishlist}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            View Wishlist ({wishlistCount})
          </button>
        )}
      </div> */}

      {suggestions.length > 0 && (
        <div className="product-suggestions">
          <h3>Popular Products</h3>
          <div className="suggestion-items">
            {suggestions.map((item) => (
              <div
                key={item.id}
                className="suggestion-item"
                onClick={() => handleProductClick(item.product_option_value_id)}
              >
                <img src={item.image} alt={item.name} />
                <h4>{item.name}</h4>
                <p>₹{item.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NoCartData;
