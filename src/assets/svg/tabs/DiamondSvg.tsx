import * as React from "react";
import { useSelector } from "react-redux";

import { TabScreens } from "../../../routes";
import { RootState } from "../../../store";

export const DiamondSvg: React.FC = () => {
  const currentTabScreen = useSelector(
    (state: RootState) => state.tabSlice.screen
  );

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      enable-background="new 0 0 64 64"
      viewBox="0 0 64 64"
      width={24}
      height={24}
    >
      <path
        d="m61.1 32.3c0-.2 0-.3-.1-.4l-8.7-13.8c0-.1-.1-.2-.2-.2s-.2-.1-.2-.1h-39.3c-.1 0-.2 0-.2.1 0 0-.1.1-.1.1v.1l-9.3 13.9c-.1.1-.1.2-.1.3v.2c0 .1 0 .1.1.2l28.6 31.1s.1.1.1.1h.1.1.1c.1 0 .2 0 .3-.1h.1s.1 0 .1-.1l28.4-31c.1 0 .2-.1.2-.4zm-10.1-13.5-7.5 12.7-10.5-12.7zm-20 0-10.2 12.7-7.3-12.6h17.5zm-.3 42.6-26.2-28.6h15.9zm1.3.7-10.6-29.3h21.4zm1.3-.8 10.5-28.5h15.5z"
        fill={
          currentTabScreen === TabScreens.Notification
            ? "var(--main-turquoise)"
            : "var(--text-color)"
        }
      />
      <path
        d="m5.7 7.8c0-.3-.2-.5-.5-.5h-4c-.2 0-.4.2-.4.5 0 .2.2.5.5.5h4c.2 0 .4-.3.4-.5z"
        fill={
          currentTabScreen === TabScreens.Notification
            ? "var(--main-turquoise)"
            : "var(--text-color)"
        }
      />
      <path
        d="m11.9 8.3h4c.3 0 .5-.2.5-.5s-.2-.5-.5-.5h-4c-.3 0-.5.2-.5.5 0 .2.2.5.5.5z"
        fill={
          currentTabScreen === TabScreens.Notification
            ? "var(--main-turquoise)"
            : "var(--text-color)"
        }
      />
      <path
        d="m8.6 4.9c.2 0 .4-.2.4-.4v-4c0-.3-.2-.5-.4-.5-.3 0-.5.2-.5.5v4c0 .2.2.4.5.4z"
        fill={
          currentTabScreen === TabScreens.Notification
            ? "var(--main-turquoise)"
            : "var(--text-color)"
        }
      />
      <path
        d="m8.6 15.5c.2 0 .4-.2.4-.5v-4c0-.3-.2-.5-.5-.5s-.5.2-.5.5v4c.1.3.3.5.6.5z"
        fill={
          currentTabScreen === TabScreens.Notification
            ? "var(--main-turquoise)"
            : "var(--text-color)"
        }
      />
      <path
        d="m52.1 55.7h-4c-.3 0-.5.2-.5.5s.2.5.5.5h4c.3 0 .5-.2.5-.5 0-.2-.2-.5-.5-.5z"
        fill={
          currentTabScreen === TabScreens.Notification
            ? "var(--main-turquoise)"
            : "var(--text-color)"
        }
      />
      <path
        d="m62.7 55.7h-4c-.3 0-.5.2-.5.5s.2.5.5.5h4c.3 0 .5-.2.5-.5 0-.2-.2-.5-.5-.5z"
        fill={
          currentTabScreen === TabScreens.Notification
            ? "var(--main-turquoise)"
            : "var(--text-color)"
        }
      />
      <path
        d="m55.4 48.5c-.3 0-.5.2-.5.5v4c0 .3.2.5.5.5s.5-.2.5-.5v-4c0-.3-.2-.5-.5-.5z"
        fill={
          currentTabScreen === TabScreens.Notification
            ? "var(--main-turquoise)"
            : "var(--text-color)"
        }
      />
      <path
        d="m55.4 59.1c-.3 0-.5.2-.5.5v4c0 .3.2.5.5.5s.5-.2.5-.5v-4c0-.3-.2-.5-.5-.5z"
        fill={
          currentTabScreen === TabScreens.Notification
            ? "var(--main-turquoise)"
            : "var(--text-color)"
        }
      />
    </svg>
  );
};
