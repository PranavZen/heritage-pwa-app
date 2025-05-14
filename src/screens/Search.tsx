import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { hooks } from "../hooks";
import { components } from "../components";
import { Routes } from "../routes";
import "../scss/search.scss";

interface DishType {
  id?: string;
  name?: string;
  image?: string;
  category?: string;

  // Additional properties from API response
  product_id?: string;
  product_name?: string;
  product_image?: string;
  category_name?: string;

  // Any other properties that might be in the response
  [key: string]: any;
}

export const Search: React.FC = () => {
  const [opacity, setOpacity] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [dishes, setDishes] = useState<DishType[]>([]);
  const [dishesLoading, setDishesLoading] = useState<boolean>(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();

  // Focus input on component mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
    setIsInitialLoad(false);
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch dishes when debounced search query changes
  useEffect(() => {
    if (debouncedSearchQuery) {
      fetchDishes(debouncedSearchQuery);
    } else {
      setDishes([]);
    }
  }, [debouncedSearchQuery]);

  const fetchDishes = async (query: string) => {
    if (!query.trim()) {
      setDishes([]);
      return;
    }

    // console.log("Searching for:", query);

    const formData = new FormData();
    formData.append("search_key", query);
    formData.append("city_id", localStorage.getItem('cityId') || '');

    // Add any other required parameters
    const c_id = localStorage.getItem('c_id');
    if (c_id) {
      formData.append("c_id", c_id);
    }

    // Log form data for debugging
    console.log("Form data:", {
      search_key: query,
      city_id: localStorage.getItem('cityId') || '',
      c_id: c_id || ''
    });

    setDishesLoading(true);

    try {
      // Set a timeout to handle slow API responses
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      const fetchPromise = axios.post(
        "https://heritage.bizdel.in/app/consumer/services_v11/search",
        formData
      );

      // Race between the fetch and the timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]) as any;

      // console.log("Search response:", response.data);

      if (response.data && Array.isArray(response.data.search_data)) {
        // Handle array response
        setDishes(response.data.search_data as DishType[]);
      } else if (response.data && typeof response.data.search_data === 'object') {
        // Handle case where search_data might be an object instead of array
        try {
          const searchDataArray = Object.values(response.data.search_data) as DishType[];
          setDishes(searchDataArray);
        } catch (err) {
          console.error("Error parsing search data:", err);
          setDishes([]);
        }
      } else if (response.data && Array.isArray(response.data)) {
        // Handle direct array response
        setDishes(response.data as DishType[]);
      } else {
        // If search_data is not in expected format, set empty array
        console.warn("Unexpected search data format:", response.data);
        setDishes([]);
      }
    } catch (error) {
      console.error("Error fetching dishes:", error);
      setDishes([]);
    } finally {
      setDishesLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleDishClick = (dish: DishType) => {
    // Get the dish ID from either property
    const dishId = dish.product_id || dish.id;

    if (!dishId) {
      console.error("No dish ID found:", dish);
      return;
    }

    // Add a subtle animation before navigating
    const element = document.getElementById(`dish-${dishId}`);
    if (element) {
      element.style.transform = "scale(0.95)";
      setTimeout(() => {
        navigate(Routes.MenuList, { state: { id: dishId } });
      }, 150);
    } else {
      navigate(Routes.MenuList, { state: { id: dishId } });
    }
  };

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor("#F6F9F9", "#F6F9F9", dispatch);

  const renderHeader = (): JSX.Element => {
    return <components.Header showGoBack={true} />;
  };

  const renderSearch = (): JSX.Element => {
    return (
      <section className="search-container">
        <div className="search-input-wrapper">
          <div className="search-input">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              placeholder="Search for dishes, meals, ingredients..."
              onChange={(event) => setSearchQuery(event.target.value)}
              className={searchQuery ? 'typing' : ''}
              autoFocus
            />
            <svg
              className={`search-icon ${dishesLoading ? 'searching' : ''}`}
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <button
              className={`clear-button ${searchQuery ? 'visible' : ''}`}
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <button className="cancel-button" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>
      </section>
    );
  };

  const renderDishes = (): JSX.Element => {
    if (dishesLoading) {
      return (
        <div className="search-loader">
          <div className="loader-wave"></div>
          <p>Searching for "{debouncedSearchQuery}"</p>
          <div className="loader-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      );
    }

    if (debouncedSearchQuery && dishes.length === 0) {
      return (
        <div className="empty-search">
          <div className="empty-search-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11" strokeWidth="2"></line>
            </svg>
          </div>
          <h3 className="empty-search-title">No results found</h3>
          <p className="empty-search-text">
            We couldn't find any dishes matching "<strong>{debouncedSearchQuery}</strong>".
            Try a different search term or check for typos.
          </p>
        </div>
      );
    }

    if (!debouncedSearchQuery && !isInitialLoad) {
      return (
        <div className="search-message">
          Search products...
        </div>
      );
    }

    return (
      <div className="search-results">
        {dishes && dishes.length > 0 ? (
          dishes.map((dish, index) => (
            <div
              id={`dish-${dish.product_id || index}`}
              className="search-item"
              key={dish.product_id || `dish-${index}`}
              onClick={() => handleDishClick(dish)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="search-item-image">
                <img
                  src={dish.product_image || dish.image || 'https://via.placeholder.com/70x70?text=No+Image'}
                  alt={dish.product_name || dish.name || 'Product'}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/70x70?text=No+Image';
                  }}
                />
              </div>
              <div className="search-item-details">
                <h3 className="search-item-name">{dish.product_name || dish.name || 'Unknown Product'}</h3>
                {/* <p className="search-item-category">
                  {dish.category_name || dish.category || 'Uncategorized'}
                </p> */}
              </div>
            </div>
          ))
        ) : (
          <div className="search-message">
            No results found. Try a different search term.
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="screen" style={{ opacity }}>
      {renderHeader()}
      {renderSearch()}
      <main className="scrollable container">
        {renderDishes()}
      </main>
    </div>
  );
};
