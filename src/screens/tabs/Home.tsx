import React, { useEffect, useState } from "react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { components } from "../../components";
import { hooks } from "../../hooks";
import { items } from "../../items";
import { Routes, TabScreens } from "../../routes";
import { actions } from "../../store/actions";
import type { DishType, MenuType } from "../../types";
import "../../scss/product-category.scss";

export const Home: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();
  const { menuLoading, menu } = hooks.useGetMenu();
  const { dishesLoading, dishes } = hooks.useGetDishes();
  const { reviewsLoading, reviews } = hooks.useGetReviews();
  const { carouselLoading, carousel } = hooks.useGetCarousel();
  const { menuLoadingBanner, banner } = hooks.useGetMenu();

  // console.log("aqaqaqaqaqaqaqaqaqaqaq",banner);

  // {console.log('dishesdishes',dishes)}

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
    return (
      <section style={{ position: "relative"}}>
        <Swiper
          modules={[Pagination, Navigation, Autoplay]}
          slidesPerView={1}
          mousewheel={true}
          scrollbar={false}
          pagination={false}
          navigation={true}
          onSlideChange={handleSlideChange}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          loop={true}
          effect="fade"
          fadeEffect={{ crossFade: true }}
        >
          {banner.map((banner, index) => (
            <SwiperSlide key={banner.id}>
              <div
                className={`carousel-slide ${
                  index % 2 === 0 ? "fade-in" : "slide-up"
                }`}
                style={{ position: "relative" }}
              >
                <img
                  alt="banner"
                  src={banner.image}
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "300px",
                    objectFit: "cover",
                  }}
                  className="clickable"
                  onClick={() =>
                    navigate(Routes.MenuList, {
                      state: { menuName: banner.banner_for_id },
                    })
                  }
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    );
  };

  const renderMenu = (): JSX.Element => {
    return (
      <section className="product-category-section">
        <components.BlockHeading
          title="Product Category"
          viewAllOnClick={() => {
            dispatch(actions.setScreen(TabScreens.Menu));
          }}
          containerStyle={{
            marginLeft: 20,
            marginRight: 20,
            marginBottom: 14,
            position: "relative",
            zIndex: 1,
          }}
        />

        <div
          className="swiper-container"
          style={{ width: "100%", paddingLeft: 20 }}
        >
          <Swiper
            modules={[Pagination, Navigation]}
            spaceBetween={15}
            slidesPerView={"auto"}
            pagination={false}
            navigation={true}
            mousewheel={true}
            autoplay={true}
            breakpoints={{
              320: {
                slidesPerView: 2.2,
                spaceBetween: 10,
              },
              480: {
                slidesPerView: 2.8,
                spaceBetween: 10,
              },
              768: {
                slidesPerView: 3.2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 10,
              },
            }}
          >
            {menu.map((menuItem: MenuType, index: number) => {
              return (
                <SwiperSlide key={menuItem.id} style={{ width: "auto" }}>
                  <div
                    className={`itemWrap item-${index + 1} ${
                      index % 2 === 0 ? "fade-in" : "slide-up"
                    }`}
                    onClick={() => {
                      navigate(Routes.MenuList, {
                        state: { menuName: menuItem.product_cat_id },
                      });
                    }}
                  >
                    <div
                      style={{
                        backgroundImage: `url(${menuItem.image})`,
                      }}
                      className="bg-cover"
                    />
                    <div className="card-content">
                      <span className="home_product_category">
                        {menuItem.name}
                      </span>
                      <span className="item-count">
                        {menuItem.totalProducts || 0} items
                      </span>
                    </div>
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
        <div
          style={{ width: "100%", padding: "0 20px" }}
          className="swiper-container"
        >
          <Swiper
            modules={[Pagination, Navigation, Autoplay]}
            spaceBetween={14}
            slidesPerView={2.8}
            pagination={false}
            navigation={true}
            mousewheel={true}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              320: {
                slidesPerView: 1.2,
                spaceBetween: 10,
              },
              480: {
                slidesPerView: 1.6,
                spaceBetween: 12,
              },
              768: {
                slidesPerView: 2.8,
                spaceBetween: 14,
              },
              1024: {
                slidesPerView: 2.8,
                spaceBetween: 14,
              },
            }}
          >
            {dishes.map((dish: DishType, index: number, array: DishType[]) => {
              const isLast = index === array.length - 1;
              return (
                <SwiperSlide key={`first-${dish.id}`} style={{ width: "auto" }}>
                  <div
                    className={`item-${index + 1} ${
                      index % 2 === 0 ? "fade-in" : "slide-up"
                    }`}
                  >
                    <items.RecomendedItem
                      index={index}
                      isLast={isLast}
                      dish={dish}
                    />
                  </div>
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
      <section
        className="product-category-section"
        style={{ padding: "20px 0 40px 0px" }}
      >
        <components.BlockHeading
          title="Our Happy clients say"
          viewAllOnClick={() => navigate(Routes.Reviews)}
          containerStyle={{
            marginLeft: 20,
            marginRight: 20,
            marginBottom: 14,
            position: "relative",
            zIndex: 1,
          }}
        />
        <div
          className="swiper-container"
          style={{ width: "100%", paddingLeft: 20 }}
        >
          <Swiper
            modules={[Pagination, Navigation, Autoplay]}
            spaceBetween={14}
            slidesPerView={"auto"}
            pagination={false}
            navigation={true}
            mousewheel={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              320: {
                slidesPerView: 1.2,
                spaceBetween: 10,
              },
              480: {
                slidesPerView: 1.6,
                spaceBetween: 12,
              },
              768: {
                slidesPerView: 2.2,
                spaceBetween: 14,
              },
              1024: {
                slidesPerView: 1.7,
                spaceBetween: 10,
              },
            }}
          >
            {reviews.map((review, index, array) => {
              const isLast = index === array.length - 1;
              return (
                <SwiperSlide key={review.id} style={{ width: "auto" }}>
                  <div
                    className={`item-${index + 1} ${
                      index % 2 === 0 ? "fade-in" : "slide-up"
                    }`}
                  >
                    <items.HomeReviewItem
                      index={index}
                      isLast={isLast}
                      review={review}
                    />
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </section>
    );
  };

  const renderContent = (): JSX.Element => {
    if (loading) return <components.Loader local={true} message="Loading content..." />;

    return (
      <main className="">
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
