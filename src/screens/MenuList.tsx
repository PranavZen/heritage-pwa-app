import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { hooks } from "../hooks";
import { items } from "../items";
import { MenuType } from "../types";
import { Routes } from "../routes";
import { components } from "../components";
import { DishType } from "../types";
import { svg } from "../assets/svg";
import axios from "axios";
import { useParams } from "react-router-dom";

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

  // console.log("filterDatafilterData", filterData);

  const [filterDataLoading, setFilterDataDishesLoading] =
    useState<boolean>(false);

  const { dishesLoading, dishes } = hooks.useGetDishes(selectedCategory);

  const c_id = localStorage.getItem('c_id');

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
      const response = await axios.post(
        `https://heritage.bizdel.in/app/consumer/services_v11/productOptionByCategory`,
        formData
      );
      // console.log("responseresponse",response);
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
      <section className="row-center container" style={{ gap: 5, marginTop: 10 }}>
        <button
          style={{
            height: 50,
            display: "flex",
            alignItems: "center",
            paddingLeft: 5,
            gap: 14,
            flex: 1,
            backgroundColor: "var(--white-color)",
            borderRadius: 10,
          }}
          onClick={() => navigate(Routes.Search)}
        >
          <svg.SearchSvg />
          <span className="t16">Search ...</span>
        </button>
      </section>
    );
  };

  const renderCategories = (): JSX.Element | null => {
    if (menuLoading || dishesLoading || menu.length === 0 || dishes.length === 0) {
      return null;
    }

    return (
      <section style={{ width: "100%", marginTop: 14, paddingBottom: 20 }}>
        {!searchId && (
          <Swiper
            spaceBetween={8}
            slidesPerView={"auto"}
            pagination={{ clickable: true }}
            navigation={true}
            mousewheel={true}
          >
            {menu.map((category: MenuType, index, array) => {
              const isLast = index === array.length - 1;
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
                  <div
                    style={{
                      padding: "10px 20px",
                      borderRadius: 10,
                      border: "1px solid red",
                      borderColor:
                        selectedCategory === category.product_cat_id
                          ? "var(--main-turquoise)"
                          : "var(--white-color)",
                      backgroundColor: "var(--white-color)",
                    }}
                  >
                    <h5
                      style={{
                        textTransform: "capitalize",
                        cursor: "pointer",
                        color:
                          selectedCategory === category.product_cat_id
                            ? "var(--main-turquoise)"
                            : "var(--main-color)",
                      }}
                    >
                      {category.name} ({category.totalProducts})
                    </h5>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
      </section>
    );
  };



  const renderContent = (): JSX.Element | null => {
    if (menuLoading || dishesLoading || menu.length === 0 || dishes.length === 0) {
      return null;
    }
    return (
      <main className="scrollable container">
        {filterDataLoading ?  false : (Array.isArray(filterData) && filterData!.length === 0 ? (
          <div className="NoData-Found">
            <div>Product Not Available</div>
          </div>
        ) : (
          <ul style={{ paddingBottom: 20 }}>
            {filterData!.map((dish: DishType, index: number, array: DishType[]) => {
              const isLast = index === array.length - 1;
              return (
                <items.MenuListItem
                  dish={dish}
                  key={dish.cart_id}
                  isLast={isLast}
                />
              );
            })}
          </ul>
        ) )}
      </main>
    );
  };
   

  const renderLoader = (): JSX.Element | null => {
    if (categoryLoading) {
      return <components.Loader />;
    }
    return null;
  };
  return (
    <div id="screen" style={{ opacity }}>
      {renderHeader()}
      {renderSearch()}
      {renderCategories()}
      {renderContent()}
      {renderLoader()}
    </div>
  );
};
