import React, { useEffect, useState } from 'react';
import { hooks } from '../hooks';
import { svg } from '../assets/svg';
import { RootState } from '../store';
import { components } from '../components';
import { TabScreens, Routes } from '../routes';
import { setScreen } from '../store/slices/tabSlice';
import axios from 'axios';
import pic1 from '../assets/icons/pwa-logo.jpg';
import { Modal } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { setCartCount } from '../store/slices/cartSlice';
import NoCartData from '../screens/NoCartData';

type Props = {
  title?: string;
  userName?: boolean;
  userPhoto?: boolean;
  showGoBack?: boolean;
  showBasket?: boolean;
  headerStyle?: React.CSSProperties;
  onGoBack?: () => void;
};

interface ProfileData {
  firstname: string;
  lastname: string;
  email: string;
  photo: File | null;
  photo_url: string | null;
}


const modalMenu = [
  {
    id: 1,
    title: 'Edit Profile',
    route: Routes.EditProfile,
    switch: false,
  },
  {
    id: 2,
    title: 'My Addresses',
    route: Routes.MyAddress,
    switch: false,
  },
  {
    id: 5,
    title: 'Notifications',
    route: Routes.ClientNotification,
    switch: false,
  },
  {
    id: 6,
    title: 'Customer Care',
    route: Routes.CustomerCare,
    switch: false,
  },
  {
    id: 8,
    title: 'Sign out',
    route: Routes.SignIn,
    switch: false,
  },
];


export const Header: React.FC<Props> = ({
  title,
  userName,
  userPhoto,
  showGoBack,
  showBasket,
  headerStyle,

}) => {
  const navigate = hooks.useNavigate();
  const location = hooks.useLocation();
  const dispatch = hooks.useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [themeColor, setThemeColor] = useState('#F6F9F9');
  const cart = useSelector((state: RootState) => state.cartSlice);
  const [profileData, SetProfileData] = useState<ProfileData | null>(null);


  const shouldRefresh = useSelector((state: RootState) => state.cartSlice.shouldRefresh);

  // console.log("qqqqqq", shouldRefresh);


  const cartCount = useSelector((state: RootState) => state.cartSlice.cartCount);

  useEffect(() => {
    setTimeout(() => {
      if (cartCount === 0) {
        localStorage.removeItem('couponCode');
      }
    }, 1000)

  }, [shouldRefresh]);

  // const removeCart = useSelector((state: RootState) => state.cartSlice.cartCount);

  // console.log('xxxxxxxxxxxx', cartCount);

  const cityId = localStorage.getItem('c_id');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const GetProfileData = async () => {
      const formData = new FormData();
      formData.append('c_id', cityId || 'null');

      const initialCartCount = cartCount;

      try {
        const response = await axios.post(
          'https://heritage.bizdel.in/app/consumer/services_v11/getCustomerById',
          formData
        );

        if (response.data.status === 'success') {
          SetProfileData(response.data.CustomerDetail[0]);
          const newCartCount = response.data.cart_count;

          // Only update cart count if it changed
          if (newCartCount !== undefined && newCartCount !== initialCartCount) {
            dispatch(setCartCount(Number(newCartCount)));
          }
        } else {
          console.error('API call failed:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        // setIsLoading(false);
      }
    };

    GetProfileData();
  }, [shouldRefresh, cartCount, cityId, dispatch]);

  const signOut = () => {
    localStorage.clear();
    navigate(Routes.SignIn);
    navigate(0)
  };

  // Render user profile section
  const renderUser = (): JSX.Element | null => {
    if (!userName && !userPhoto) return null;

    return (
      <div
        className="leftBox"
        onClick={() => {
          setShowModal(true);
          setThemeColor('#fff');
        }}
      >
        <img
          alt="user"
          src={
            profileData?.photo && profileData.photo_url
              ? `${profileData.photo_url}${profileData.photo}`
              : require('../assets/icons/placeholder.jpg')
          }
          className="userImg"
        />
        <span className="userName"> {profileData?.firstname}</span>
      </div>
    );
  };

  // Render the go back button if needed
  const renderGoBack = (): JSX.Element | null => {
    if (showGoBack && location.key !== 'default')
      return (
        <div
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            left: 0,
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            gap: 10,
          }}
          className="clickable"
        >
          <svg.GoBackSvg />
          {title}
        </div>
      );
    return null;
  };

  // Render the header title/logo
  const renderTitle = (): JSX.Element | null => {
    const shouldGoToHome = true;
    return (
      <div className="middleBox">
        <img
          onClick={() => navigate(shouldGoToHome ? Routes.TabNavigator : Routes.TabNavigator)}
          className="logo-header"
          src={pic1}
          alt=""
          width={150}

        />
      </div>
    );
  };

  const renderBasket = (): JSX.Element | null => {
    if (!showBasket) return null;
    const ShowNoData = () => {
      setIsModalOpen(true);
    };
    const handleOk = () => {
      setIsModalOpen(false);
    };
    const handleCancel = () => {
      setIsModalOpen(false);
    };

    return (
      <>
        <div className="basketContainer">
          {cartCount >= 1 ? (
            <button
              onClick={() => {
                dispatch(setScreen(TabScreens.Order));
                navigate(Routes.TabNavigator);
              }}
              className="rightBox"
            >
              <div className="basketCount">
                <span>{cartCount}</span>
              </div>
              <svg.HeaderBasketSvg />
            </button>
          ) : (
            <button onClick={ShowNoData} className="rightBox">
              <div className="basketCount">
                <span>{cartCount}</span>
              </div>
              <svg.HeaderBasketSvg />
            </button>
          )}
        </div>
        <Modal open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
          <NoCartData />
        </Modal>
      </>
    );
  };

  const renderModal = (): JSX.Element | null => {
    if (!showModal) return null;

    return (
      <div className="modalWrapBox">
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(30, 37, 56, 0.6)',
            zIndex: 101,
            cursor: 'pointer',
          }}
          onClick={() => {
            setThemeColor('#F6F9F9');
            setShowModal(false);
          }}
        />
        <div className={showModal ? 'sideMenu' : 'sideMenu hidden'}>
          <div className="sideMwnuHeader">
            <img
              src={
                profileData?.photo instanceof File
                  ? URL.createObjectURL(profileData?.photo)
                  : profileData?.photo_url && profileData?.photo
                    ? `${profileData?.photo_url}${profileData?.photo}`
                    : require('../assets/icons/placeholder.jpg')
              }
              alt="user"
              style={{ width: 60, height: 60, borderRadius: 50, border: '2px solid #1a712e' }}
            />
            <div className="sideMenuHeaderContent">
              <span>{profileData ? `${profileData.firstname} ${profileData.lastname}` : ''}</span>
              <span>{profileData?.email || ''}</span>
            </div>
          </div>


          <ul className="sideMenuList">
            {modalMenu.map((item, index, array) => {
              const isLast = index === array.length - 1;
              return (
                <li
                  className="row-center-space-between clickable"
                  style={{
                    paddingTop: 6,
                    paddingBottom: 6,
                    marginBottom: isLast ? 0 : 6,
                  }}
                  key={item.id}
                  onClick={() => {

                    const c_id = localStorage.getItem("c_id");
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

                    if (item.title === 'Sign out') {
                      signOut();
                    } else if (item.route) {
                      navigate(item.route);
                    }
                  }}
                >
                  <span
                    className="t16 number-of-lines-1"
                    style={
                      item.title === 'Sign out'
                        ? { color: '#FA5555' }
                        : { color: 'var(--main-color)' }
                    }
                  >
                    {item.title === 'Sign out'
                      ? localStorage.getItem('c_id')
                        ? 'Log Out'
                        : 'Sign In'
                      : item.title}
                  </span>
                  {item.switch && <svg.RightArrowSvg />}
                </li>
              );
            })}
          </ul>


        </div>
      </div>
    );
  };

  return (
    <>
      <header className="topHeader">
        {renderUser()}
        {renderGoBack()}
        {renderTitle()}
        {renderBasket()}
      </header>
      {renderModal()}
    </>
  );
};
