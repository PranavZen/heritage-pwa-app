import React, { useState } from "react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { components } from "../../components";
import { hooks } from "../../hooks";
import { items } from "../../items";
import { Routes, TabScreens } from "../../routes";
import { actions } from "../../store/actions";
import type { DishType, MenuType } from "../../types";

export const Home: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();
  const { menuLoading, menu } = hooks.useGetMenu();
  const { dishesLoading, dishes } = hooks.useGetDishes();
  const { reviewsLoading, reviews } = hooks.useGetReviews();
  const { carouselLoading, carousel } = hooks.useGetCarousel();
  const { menuLoadingBanner, banner } = hooks.useGetMenu();


  const loading: boolean =
    menuLoading || dishesLoading || reviewsLoading || carouselLoading;

  const [opacity, setOpacity] = useState<number>(0);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);

  const [activeSlide, setActiveSlide] = useState(0);

  const handleSlideChange = (swiper: any) => {
    setActiveSlide(swiper.activeIndex);
  };

  const renderCarousel = (): JSX.Element => {
    // const dish = dishes[2] || '';

    const dish = Array.isArray(dishes) && dishes.length > 2 ? dishes[2] : null;

    return (
      <section
        style={{ marginBottom: 30, position: "relative" }}
      >
        <Swiper
          modules={[Pagination]}
          slidesPerView={1}
          mousewheel={true}
          scrollbar={false}
          navigation={false}
          pagination={{ clickable: true }}
          onSlideChange={handleSlideChange}
        >
          {banner.map((banner) => (
            <SwiperSlide key={banner.id}>
              <img
                alt="banner"
                src={banner.image}
                style={{ width: "100%", height: "100%" }}
                className="clickable"
                onClick={() => navigate(Routes.MenuList, { state: {menuName: banner.banner_for_id } })}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            bottom: 5,
            zIndex: 1,
            width: "100%",
            gap: 6,
          }}
        >
          {carousel.map((_, index) => {
            return (
              <div
                key={_.id}
                style={{
                  width: 8,
                  height: activeSlide === index ? 20 : 8,
                  borderRadius: 10,
                  backgroundColor:
                    activeSlide === index
                      ? "var(--white-color)"
                      : `rgba(255, 255, 255, 0.5)`,
                }}
              />
            );
          })}
        </div> */}
      </section>
    );
  };

  const renderMenu = (): JSX.Element => {
    return (
      <section style={{ marginBottom: 30 }}>
        <components.BlockHeading
          title="Product Category"
          viewAllOnClick={() => {
            dispatch(actions.setScreen(TabScreens.Menu));
          }}
          containerStyle={{ marginLeft: 20, marginRight: 20, marginBottom: 14 }}
        />

        <div style={{ width: "100%" }}>
          <Swiper
            spaceBetween={10}
            slidesPerView={"auto"}
            pagination={{ clickable: true }}
            navigation={true}
            mousewheel={true}
          >
            {menu.map((menu: MenuType, index: number, array: MenuType[]) => {
              const isLast = index === array.length - 1;
              return (
                <SwiperSlide key={menu.id} style={{ width: "auto" }}>
                  <div className="itemWrap">
                    <button
                      style={{
                        marginRight: isLast ? 20 : 0,
                        marginLeft: index === 0 ? 20 : 0
                      }}
                      onClick={() => {
                        navigate(Routes.MenuList, {
                          state: { menuName: menu.product_cat_id },
                        });
                      }}
                    >
                      <img
                        src={menu.image}
                        alt={menu.name}
                        className="itemImg"
                      />
                    </button>
                    <span className="home_product_category">{menu.name}</span>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </section>
    );
  };

  const renderRecommendedForYou = (): JSX.Element => {
    return (
      <div style={{ marginBottom: 40 }}>
        <components.BlockHeading
          title="Recommended for you"
          containerStyle={{ marginLeft: 20, marginRight: 20, marginBottom: 14 }}
        />
        <div style={{ width: "100%", padding: "0 20px" }}>
          <Swiper
            spaceBetween={14}
            slidesPerView={2.8}
            pagination={{ clickable: true }}
            navigation={true}
            mousewheel={true}
            breakpoints={{
              0: {
                slidesPerView: 1.6,
              },
              768: {
                slidesPerView: 2.8,
              },
            }}
          >
            {/*          
            {dishes.map((dish: DishType, index: number, array: DishType[]) => {
              const isLast = index === array.length - 1;
              return (
                <SwiperSlide key={dish.id} style={{ width: "auto" }}>
                  
                  <items.RecomendedItem
                    index={index}
                    isLast={isLast}
                    dish={dish}
                  />
                </SwiperSlide>
              );
            })} */}

            {(dishes || []).map((dish: DishType, index: number, array: DishType[]) => {
              const isLast = index === array.length - 1;
              return (
                <SwiperSlide key={dish.id} style={{ width: "auto" }}>
                  <items.RecomendedItem
                    index={index}
                    isLast={isLast}
                    dish={dish}
                  />
                </SwiperSlide>
              );
            })}

          </Swiper>
        </div>
      </div>
    );
  };

  const renderReviews = (): JSX.Element => {
    return (
      <section style={{ marginBottom: 20 }}>
        <components.BlockHeading
          title="Our Happy clients say"
          viewAllOnClick={() => navigate(Routes.Reviews)}
          containerStyle={{ marginLeft: 20, marginRight: 20, marginBottom: 14 }}
        />
        <div style={{ width: "100%" }}>
          <Swiper
            spaceBetween={14}
            slidesPerView={"auto"}
            pagination={{ clickable: true }}
            navigation={true}
            mousewheel={true}
          >
            {reviews.map((review, index, array) => {
              const isLast = index === array.length - 1;
              return (
                <SwiperSlide key={review.id} style={{ width: "auto" }}>
                  <items.HomeReviewItem
                    index={index}
                    isLast={isLast}
                    review={review}
                  />
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </section>
    );
  };

  const renderContent = (): JSX.Element => {
    if (loading) return <components.Loader />;

    return (
      <main className="scrollable">
        {renderCarousel()}
        {renderMenu()}
        {renderRecommendedForYou()}
        {renderReviews()}
      </main>
    );
  };

  return (
    <div id="screen" style={{ opacity }}>
      {renderContent()}
    </div>
  );
};
