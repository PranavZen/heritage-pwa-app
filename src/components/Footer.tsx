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
import { TabScreens } from "../routes";
import { actions } from "../store/actions";
import { Modal } from "antd";

const tabs = [
  {
    id: 1,
    screen: TabScreens.Home,
    icon: <svg.HomeTabSvg />,
  },
  // {
  //   id: 2,
  //   screen: TabScreens.Menu,
  //   icon: <svg.SearchTabSvg />,
  // },
  {
    id: 3,
    screen: TabScreens.Subscription,
    icon: <svg.OrderTabSvg />,
  },
  {
    id: 4,
    screen: TabScreens.Favorite,
    icon: <svg.HeartTabSvg />,
  },
  {
    id: 5,
    screen: TabScreens.Notification,
    icon: <svg.WalletSvg />,
  },
];

export const Footer: React.FC = () => {
  const navigate = hooks.useNavigate();
  const dispatch = hooks.useDispatch();

  return (
    <section>
      <footer
        style={{
          zIndex: 100,
          height: "var(--footer-height)",
          backgroundColor: "#5fab254a",
        }}
      >
        <ul style={{ height: "100%" }} className="row-center-space-around">
          {tabs.map((tab) => {
            return (
              <li
                key={tab.id}
                className="clickable center"
                style={{
                  height: "100%",
                  width: "calc(100% / 5)",
                  borderRadius: 10,
                }}
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
                  dispatch(actions.setScreen(tab.screen));
                }}
              >
                {tab.icon}
              </li>
            );
          })}
        </ul>
      </footer>
    </section>
  );
};

