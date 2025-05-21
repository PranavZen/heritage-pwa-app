// import React from "react";

// import { hooks } from "../hooks";
// import { svg } from "../assets/svg";
// import { TabScreens } from "../routes";
// import { actions } from "../store/actions";

// const tabs = [
//   {
//     id: 1,
//     screen: TabScreens.Home,
//     icon: <svg.HomeTabSvg />,
//   },
//   // {
//   //   id: 2,
//   //   screen: TabScreens.Menu,
//   //   icon: <svg.SearchTabSvg />,
//   // },
//   {
//     id: 3,
//     screen: TabScreens.Subscription,
//     icon: <svg.OrderTabSvg />,
//   },
//   {
//     id: 4,
//     screen: TabScreens.Favorite,
//     icon: <svg.HeartTabSvg />,
//   },
//   {
//     id: 5,
//     screen: TabScreens.Notification,
//     icon: <svg.WalletSvg />,
//   },
// ];

// export const Footer: React.FC = () => {
//   const dispatch = hooks.useDispatch();

//   return (
//     <section>
//       <footer
//         style={{
//           zIndex: 100,
//           height: "var(--footer-height)",
//           backgroundColor: "#5fab254a",
//         }}
//       >
//         <ul style={{ height: "100%" }} className="row-center-space-around">
//           {tabs.map((tab, index) => {
//             return (
//               <li
//                 key={tab.id}
//                 className="clickable center"
//                 style={{
//                   height: "100%",
//                   width: "calc(100% / 5)",
//                   borderRadius: 10,
//                 }}
//                 onClick={() => dispatch(actions.setScreen(tab.screen))}
//               >
//                 {tab.icon}
//               </li>
//             );
//           })}
//         </ul>
//       </footer>
//     </section>
//   );
// };


import React from "react";
import { hooks } from "../hooks";
import { svg } from "../assets/svg";
import { TabScreens, Routes } from "../routes";
import { actions } from "../store/actions";
import { Modal } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../store";

const tabs = [
  {
    id: 1,
    screen: TabScreens.Home,
    icon: <svg.HomeTabSvg />,
    label: "Home"
  },
  // {
  //   id: 2,
  //   screen: TabScreens.Menu,
  //   icon: <svg.SearchTabSvg />,
  //   label: "Search"
  // },
  {
    id: 3,
    screen: TabScreens.Subscription,
    icon: <svg.OrderTabSvg />,
    label: "Orders"
  },
  {
    id: 4,
    screen: TabScreens.Favorite,
    icon: <svg.HeartTabSvg />,
    label: "Favorites"
  },
  {
    id: 5,
    screen: TabScreens.Notification,
    icon: <svg.WalletSvg />,
    label: "Reward"
  },
];

export const Footer: React.FC = () => {
  const navigate = hooks.useNavigate();
  const dispatch = hooks.useDispatch();
  const currentTabScreen = useSelector(
    (state: RootState) => state.tabSlice.screen
  );

  const handleTabClick = (tab: any) => {
    const c_id = localStorage.getItem("c_id");
    if (!c_id) {
      Modal.confirm({
        title: 'Please Sign In',
        content: 'You need to sign in to access this feature.',
        onOk() {
          navigate('/');
        },
        onCancel() { },
        cancelText: 'Cancel',
        okText: 'Sign In',
      });
      return;
    }

    // First update the Redux state
    dispatch(actions.setScreen(tab.screen));

    // Then navigate to the TabNavigator route to ensure the UI updates
    navigate(Routes.TabNavigator);
  };

  return (
    <section className="fotterSection">
      <footer
        style={{
          zIndex: 100,
          height: "var(--footer-height)",
          backgroundColor: "#000",
        }}
      >
        <ul style={{ height: "100%" }} className="row-center-space-around">
          {tabs.map((tab) => {
            const isActive = currentTabScreen === tab.screen;
            return (
              <li
                key={tab.id}
                className={`clickable center ${isActive ? 'active-tab' : ''}`}
                style={{
                  height: "100%",
                  width: "calc(100% / 4)",
                  borderRadius: 10,
                }}
                onClick={() => handleTabClick(tab)}
                role="button"
                aria-label={tab.label}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleTabClick(tab);
                  }
                }}
              >
                <div className="tab-ripple"></div>
                {tab.icon}
                <span className="tab-label">{tab.label}</span>
              </li>
            );
          })}
        </ul>
      </footer>
    </section>
  );
};

