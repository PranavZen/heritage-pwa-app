import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { hooks } from '../hooks';
import { svg } from '../assets/svg';
import { RootState } from '../store';
import { components } from '../components';
import { TabScreens, Routes } from '../routes';
import { setScreen } from '../store/slices/tabSlice';
import axios from 'axios';
import pic1 from '../assets/icons/pwa-logo.jpg'
import { Modal } from 'antd';

type Props = {
  title?: string;
  userName?: boolean;
  userPhoto?: boolean;
  showGoBack?: boolean;
  showBasket?: boolean;
  headerStyle?: React.CSSProperties;
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
    title: "Edit Profile",
    route: Routes.EditProfile,
    switch: false,
  },
  {
    id: 2,
    title: "My Addresses",
    route: Routes.MyAddress,
    switch: false,
  },
  {
    id: 5,
    title: "Notifications",
    route: Routes.ClientNotification,
    switch: false,
  },
  // {
  //   id: 4,
  //   title: "Store Locator",
  //   route: Routes.Promocodes,
  //   switch: false,
  // },
  {
    id: 6,
    title: "Customer Care",
    route: Routes.CustomerCare,
    switch: false,
  },
  {
    id: 7,
    // title: "FAQ",
    route: "",
    switch: false,
  },
  {
    id: 8,
    title: "Sign out",
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
  const [cartCount, setCartCount] = useState<string>('0');
  const cityId = localStorage.getItem('c_id');
  const [isModalOpen, setIsModalOpen] = useState(false);


  useEffect(() => {
    const GetProfileData = async () => {
      const formData = new FormData();
      formData.append("c_id", cityId || "null");
      try {
        const response = await axios.post(
          "https://heritage.bizdel.in/app/consumer/services_v11/getCustomerById",
          formData
        );
        if (response.data.status === 'success') {
          SetProfileData(response.data.CustomerDetail[0]);
          setCartCount(response.data.cart_count);
        } else {
          // console.log("Error:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    GetProfileData();
  }, []);

  const signOut = () => {
    localStorage.clear();
    navigate(Routes.SignIn);
    window.location.reload();
  };

  const renderUser = (): JSX.Element | null => {
    if (!userName && !userPhoto) return null;

    return (
      <div
        className="leftBox"
        onClick={() => {
          setShowModal(true);
          setThemeColor("#fff");
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

  const renderGoBack = (): JSX.Element | null => {
    if (showGoBack && location.key !== "default")
      return (
        <div
          onClick={() => navigate(-1)}
          style={{
            position: "absolute",
            left: 0,
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
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

  const renderTitle = (): JSX.Element | null => {
    return (
      <div className="middleBox" style={{ background: "red" }}>


        <img className='logo-header' src={pic1} alt="" width={150}
          onClick={() => navigate('/tab-navigator')}
        />

      </div>
    );
  };

  const renderBasket = (): JSX.Element | null => {
    if (!showBasket) return null;
    const ShowNoData = () => {
      setIsModalOpen(true);
    }
    const handleOk = () => {
      setIsModalOpen(false);
    };
    const handleCancel = () => {
      setIsModalOpen(false);
    };
    return (
      <>
        <div className="basketContainer">
          {cartCount >= '1' ? (
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
            <>
              {/* <div >
              <div className="basketCount">
                <span>{cartCount}</span>
              </div>
              <svg.HeaderBasketSvg />
              </div> */}

              <button
                onClick={ShowNoData}
                className="rightBox"
              >
                <div className="basketCount">
                  <span>{cartCount}</span>
                </div>
                <svg.HeaderBasketSvg />
              </button>
            </>
          )}
        </div>
        <Modal open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
          <>
            <div className='NoDataAvailable'>
              No Data Available
            </div>
          </>
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
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(30, 37, 56, 0.6)",
            zIndex: 101,
            cursor: "pointer",
          }}
          onClick={() => {
            setThemeColor("#F6F9F9");
            setShowModal(false);
          }}
        />
        <div className={showModal ? "sideMenu" : "sideMenu hidden"}>
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
              style={{ width: 60, height: 60, borderRadius: 50, border: "2px solid #1a712e" }}
            />

            <div className="sideMenuHeaderContent">
              <span>
                {profileData
                  ? `${profileData.firstname} ${profileData.lastname}`
                  : ""}
              </span>
              <span>{profileData?.email || ""}</span>
            </div>
          </div>
          <ul
            className="sideMenuList"
          >
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
                    if (item.title === 'Sign out') {
                      signOut();  
                    } else if (item.route !== '') {
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
                      ? (localStorage.getItem('c_id') ? 'Log Out' : 'Sign In')
                      : item.title}
                  </span>

                  {item.route !== '' && item.title !== 'Sign out' && <svg.RightArrowSvg />}

                  {item.switch && <components.Switch />}
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