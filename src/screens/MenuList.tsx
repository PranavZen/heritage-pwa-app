import axios from "axios";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { svg } from "../assets/svg";
import { components } from "../components";
import { hooks } from "../hooks";
import { items } from "../items";
import { Routes } from "../routes";
import { DishType, MenuType } from "../types";
import "../scss/menu-list.scss";

export const MenuList: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();

  const { menuLoading, menu, selectedProductId } = hooks.useGetMenu();



  // console.log("menueeeeeeeeeeeeeeeeeeeeeeeeeeeeee", menu);

  const location = hooks.useLocation();

  const product_cat_id: string = location.state.menuName;
  // console.log("zzzz", product_cat_id);

  const searchId: string = location.state.id;

  // console.log("searchIdsearchId", searchId);

  const [opacity, setOpacity] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] =
    useState<string>(product_cat_id);

  const [categoryLoading, setCategoryLoading] = useState<boolean>(false);
  const [productId, setProductId] = useState<string | null>(null);

  const [filterData, setFilterData] = useState<DishType[] | null>(null);

  console.log("filterDatafilterData", filterData);

  const [filterDataLoading, setFilterDataDishesLoading] =
    useState<boolean>(false);

  const { dishesLoading, dishes } = hooks.useGetDishes(selectedCategory);

  const c_id = localStorage.getItem('c_id');




  // Use our custom loader hook
  const { withLoader } = hooks.useLoader();

  const getDishes = async () => {
    const cityId = localStorage.getItem("cityId");
    setFilterDataDishesLoading(true);
    const formData = new FormData();
    formData.append('city_id', cityId || 'null');
    formData.append('building_id', '980');
    formData.append('c_id', c_id || 'null');
    formData.append('category_id', selectedCategory || '');
    formData.append('product_id', searchId || '');
    formData.append('next_id', '0');
    try {
      // Example of using the global loader for API calls
      const response = await withLoader(
        async () => {
          return await axios.post(
            `https://heritage.bizdel.in/app/consumer/services_v11/productOptionByCategory`,
            formData
          );
        },
        'Loading menu items...'
      )();

      setFilterData(response.data?.optionListing || null);

      localStorage.setItem("product_option_value_id", response.data?.optionListing.product_option_value_id);
    } catch (error) {
      // console.error(error);
    } finally {
      setFilterDataDishesLoading(false);
    }
  };

  useEffect(() => {
    setFilterData(null);
    setCategoryLoading(true);
    getDishes().finally(() => {
      setCategoryLoading(false);
    });
  }, [selectedCategory, productId]);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor("#F6F9F9", "#F6F9F9", dispatch);

  const renderHeader = (): JSX.Element => {
    return (
      <components.Header title="Menu" showGoBack={true} showBasket={true} />
    );
  };

  const renderSearch = (): JSX.Element | null => {
    if (menuLoading || dishesLoading || menu.length === 0 || dishes.length === 0) {
      return null;
    }
    return (
      <section className="search-bar-container fade-in">
        <div className="search-bar" onClick={() => navigate(Routes.Search)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search for products..."
            readOnly
            onClick={(e) => {
              e.stopPropagation();
              navigate(Routes.Search);
            }}
          />
        </div>
      </section>
    );
  };

  const renderCategories = (): JSX.Element | null => {
    if (menuLoading || dishesLoading || menu.length === 0 || dishes.length === 0) {
      return null;
    }

    return (
      <section className="category-tabs-container">
        {!searchId && (
          <div className="swiper-container">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={12}
              slidesPerView={"auto"}
              pagination={false}
              navigation={false}
              mousewheel={true}
              breakpoints={{
                320: { spaceBetween: 8 },
                768: { spaceBetween: 12 }
              }}
            >
              {menu.map((category: MenuType, index, array) => {
                const isLast = index === array.length - 1;
                const isActive = selectedCategory === category.product_cat_id;

                return (
                  <SwiperSlide
                    key={category.product_cat_id}
                    style={{
                      width: "auto",
                      marginLeft: index === 0 ? 20 : 0,
                      marginRight: isLast ? 20 : 0,
                    }}
                    onClick={() => {
                      setSelectedCategory(category.product_cat_id);
                      setProductId(category.product_id);
                    }}
                  >
                    <div className={`category-tab ${isActive ? 'active' : ''} item-${index + 1} fade-in`}>
                      <h5>
                        {category.name} ({category.totalProducts})
                      </h5>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        )}
      </section>
    );
  };



  const renderContent = (): JSX.Element | null => {
    if (menuLoading || dishesLoading || menu.length === 0 || dishes.length === 0) {
      return null;
    }
    return (
      <main className="scrollable container menu-list-container">
        {filterDataLoading ? (
          <div className="empty-state fade-in">
            <components.Loader local={true} message="Loading products..." />
          </div>
        ) : (
          Array.isArray(filterData) && filterData!.length === 0 ? (
            <div className="empty-state fade-in">
              <h3>No Products Available</h3>
              <p>We couldn't find any products in this category. Please try another category or check back later.</p>
            </div>
          ) : (
            <ul className="product-list">
              {filterData!.map((dish: DishType, index: number, array: DishType[]) => {
                const isLast = index === array.length - 1;
                const animationClass = index % 3 === 0 ? 'slide-up' : (index % 3 === 1 ? 'scale-in' : 'fade-in-right');

                return (
                  <li key={dish.cart_id} className={`item-${index + 1} ${animationClass}`}>
                    <items.MenuListItem
                      dish={dish}
                      isLast={isLast}
                      selectedCategory={selectedCategory}
                    />
                  </li>
                );
              })}
            </ul>
          )
        )}
      </main>
    );
  };


  const renderLoader = (): JSX.Element | null => {
    if (categoryLoading) {
      return <components.Loader local={true} message="Loading categories..." />;
    }
    return null;
  };
  return (
    <div id="screen" style={{ opacity }} className="menu-list-page">
      {renderHeader()}
      {renderSearch()}
      {renderCategories()}
      {renderContent()}
      {renderLoader()}
    </div>
  );
};
