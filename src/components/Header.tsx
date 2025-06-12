import React, { useEffect, useState } from 'react';
import { hooks } from '../hooks';
import { svg } from '../assets/svg';
import { RootState } from '../store';
import { components } from '../components';
import { TabScreens, Routes } from '../routes';
import { setScreen } from '../store/slices/tabSlice';
import axios from 'axios';
import pic1 from '../assets/icons/logo.png';
import { Modal } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { setCartCount } from '../store/slices/cartSlice';
import NoCartData from '../screens/NoCartData';
import homeImg from '../assets/icons/home.png'
import { Color } from 'antd/es/color-picker';

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
  const [isAnimating, setIsAnimating] = useState(false);
  const shouldRefresh = useSelector((state: RootState) => state.cartSlice.shouldRefresh);

  const cartCount = useSelector((state: RootState) => state.cartSlice.cartCount);
  useEffect(() => {
    if (cartCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 500); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  useEffect(() => {
    setTimeout(() => {
      if (cartCount === 0) {
        // localStorage.removeItem('couponCode');
        localStorage.removeItem('isChecked');
      }
    }, 1000)

  }, [shouldRefresh]);

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
            // Animation will be triggered by the cartCount change in the useEffect
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
            color: '#fff',
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
              <div
                className="basketCount"
                style={{ animation: isAnimating ? 'bounce 0.5s ease' : 'none' }}
              >
                <span>{cartCount}</span>
              </div>
              <svg.HeaderBasketSvg />
            </button>
          ) : (
            <button onClick={ShowNoData} className="rightBox">
              <div
                className="basketCount"
                style={{ animation: isAnimating ? 'bounce 0.5s ease' : 'none' }}
              >
                <span>{cartCount}</span>
              </div>
              <svg.HeaderBasketSvg />
            </button>
          )}
        </div>
        <Modal
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null} // Remove footer buttons
          centered // Center the modal
          width={500} // Set appropriate width
          closable={true} // Allow closing with X button
        >
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
                        okText: 'Sign In',
                        cancelText: 'Cancel',
                        className: 'sign-in-modal',
                        centered: true,
                        onOk() {
                          navigate('/');
                        },
                        onCancel() { },
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
                      ? localStorage.getItem('c_id') && localStorage.getItem('area_id')
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
  // *******************************************************************************************************
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  const isIos = () => /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  const isInStandaloneMode = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any)?.standalone;

  useEffect(() => {
    if (isInStandaloneMode()) {
      setShowInstallPrompt(false);
      setIsInstallable(false);
      return;
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt || isInStandaloneMode()) return;

    deferredPrompt.prompt();

    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        setShowInstallPrompt(false);
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    });
  };

  const hideInstallPrompt = () => {
    setShowInstallPrompt(false);
  };


  const AddToHomeScreen = () => {
    if (!showInstallPrompt) return null;
    return (
      <>
        {/* Android Install Button */}
  
       {localStorage.getItem('curScreen') === 'Home'   && localStorage.getItem('hello') === "/tab-navigator" ? 
          <>
            {true && !isIos() && (
              <div className="enhanced-floating-container"
              >
                <div className="floating-button-wrapper" >
                  <button
                    id="install-button"
                    onClick={handleInstallClick}
                    className="enhanced-floating-button"
                    title="Add to Home Screen"
                    aria-label="Add app to home screen"
                  >
                    <svg.DownloadSvg className="download-icon" />
                    <span className="button-text">Add to Home Screen</span>

                  </button>
                  <button
                    onClick={hideInstallPrompt}
                    className="close-btn"
                    title="Hide install prompt"
                    aria-label="Hide install prompt"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* iOS Instruction Message */}
            {isIos() && !isInStandaloneMode() && (
              <div className="ios-instruction-container">
                <div className="ios-instruction-message">
                  <button
                    onClick={hideInstallPrompt}
                    className="ios-close-btn"
                    title="Hide install prompt"
                    aria-label="Hide install prompt"
                  >
                    ×
                  </button>
                  <p className="ios-instruction-text">
                    To install this app on your iPhone/iPad, tap <strong>Share</strong> and then <strong>"Add to Home Screen"</strong>.
                  </p>
                </div>
              </div>
            )}
          </> : <> </>}
      </>
    );
  };

  return (
    <>
      <AddToHomeScreen />
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
