import * as React from "react";
import { useSelector } from "react-redux";

import { TabScreens } from "../../../routes";
import { RootState } from "../../../store";

export const OrderTabSvg: React.FC = () => {
  const currentTabScreen = useSelector(
    (state: RootState) => state.tabSlice.screen
  );

  return (
    <>
      {/* <svg
        xmlns="http://www.w3.org/2000/svg"
        width={24}
        height={24}
        fill="none"
      >
        <path
          fill={
            currentTabScreen === TabScreens.Order
              ? "#1a712e"
              : "#fff"
          }
          fillOpacity={0.15}
          d="M5.1 9 3 10.5l1.5 8.7L6 21l12.9-.6 2.1-9-1.8-2.1L5.1 9Z"
        />
        <path
          fill={
            currentTabScreen === TabScreens.Order
              ? "#1a712e"
              : "#fff"
          }
          d="M8.75 13a.75.75 0 1 0-1.5 0v4a.75.75 0 1 0 1.5 0v-4Zm7.25-.75a.75.75 0 0 1 .75.75v4a.75.75 0 1 1-1.5 0v-4a.75.75 0 0 1 .75-.75Zm-3.25.75a.75.75 0 1 0-1.5 0v4a.75.75 0 1 0 1.5 0v-4Z"
        />
        <path
          fill={
            currentTabScreen === TabScreens.Order
              ? "#1a712e"
              : "#fff"
          }
          fillRule="evenodd"
          d="M17.274 3.473c-.476-.186-1.009-.217-1.692-.222A1.75 1.75 0 0 0 14 2.25h-4a1.75 1.75 0 0 0-1.582 1c-.684.006-1.216.037-1.692.223A3.25 3.25 0 0 0 5.3 4.563c-.367.493-.54 1.127-.776 1.998l-.628 2.303a2.98 2.98 0 0 0-1.01.828c-.622.797-.732 1.746-.62 2.834.106 1.056.44 2.386.855 4.05l.026.107c.264 1.052.477 1.907.731 2.574.265.696.602 1.266 1.156 1.699.555.433 1.19.62 1.93.71.707.084 1.59.084 2.674.084h4.724c1.085 0 1.966 0 2.675-.085.74-.088 1.374-.276 1.928-.71.555-.432.891-1.002 1.156-1.698.255-.667.468-1.522.731-2.575l.027-.105c.416-1.665.748-2.995.856-4.05.11-1.09 0-2.038-.622-2.835a2.98 2.98 0 0 0-1.009-.828l-.628-2.303c-.237-.871-.41-1.505-.776-1.999a3.25 3.25 0 0 0-1.426-1.089ZM7.272 4.87c.22-.086.486-.111 1.147-.118.282.59.884.998 1.58.998h4c.698 0 1.3-.408 1.582-.998.661.007.927.032 1.147.118.306.12.572.323.768.587.176.237.28.568.57 1.635l.354 1.297c-1.038-.139-2.378-.139-4.043-.139H9.622c-1.664 0-3.004 0-4.042.139l.354-1.297c.29-1.067.394-1.398.57-1.635a1.75 1.75 0 0 1 .768-.587ZM10 3.75a.25.25 0 0 0 0 .5h4a.25.25 0 0 0 0-.5h-4Zm-5.93 6.865c.278-.357.72-.597 1.63-.729.93-.134 2.192-.136 3.985-.136h4.63c1.793 0 3.054.002 3.985.136.911.132 1.352.372 1.631.73.28.357.405.842.311 1.758-.095.936-.399 2.16-.834 3.9-.277 1.108-.47 1.876-.688 2.45-.212.554-.419.847-.678 1.05-.259.202-.594.331-1.183.402-.61.073-1.4.074-2.544.074h-4.63c-1.144 0-1.935-.001-2.544-.074-.59-.07-.924-.2-1.183-.402-.26-.203-.467-.496-.678-1.05-.218-.574-.41-1.342-.689-2.45-.434-1.74-.739-2.964-.834-3.9-.093-.916.033-1.402.312-1.759Z"
          clipRule="evenodd"
        />
      </svg> */}

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={24}
        height={24}
      >
        <circle
          cx="7"
          cy="22"
          r="2"
          fill={
            currentTabScreen === TabScreens.Subscription
              ? "#1a712e"
              : "#fff"
          }
        />
        <circle
          cx="17"
          cy="22"
          r="2"
          fill={
            currentTabScreen === TabScreens.Subscription
              ? "#1a712e"
              : "#fff"
          }
        />
        <path
          d="M23,3H21V1a1,1,0,0,0-2,0V3H17a1,1,0,0,0,0,2h2V7a1,1,0,0,0,2,0V5h2a1,1,0,0,0,0-2Z"
          fill={
            currentTabScreen === TabScreens.Subscription
              ? "#1a712e"
              : "#fff"
          }
          // fillOpacity={0.15}
        />
        <path
          d="M21.771,9.726a.994.994,0,0,0-1.162.806A3,3,0,0,1,17.657,13H5.418l-.94-8H13a1,1,0,0,0,0-2H4.242L4.2,2.648A3,3,0,0,0,1.222,0H1A1,1,0,0,0,1,2h.222a1,1,0,0,1,.993.883l1.376,11.7A5,5,0,0,0,8.557,19H19a1,1,0,0,0,0-2H8.557a3,3,0,0,1-2.829-2H17.657a5,5,0,0,0,4.921-4.112A1,1,0,0,0,21.771,9.726Z"
          fill={
            currentTabScreen === TabScreens.Subscription
              ? "#1a712e"
              : "#fff"
          }
          // fillOpacity={0.15}
        />
      </svg>
    </>
  );
};
