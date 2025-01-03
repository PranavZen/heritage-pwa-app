import React from 'react';
import {RouterProvider, createBrowserRouter} from 'react-router-dom';

import {Routes} from '../routes';
import {screens} from '../screens';

import {TabNavigator} from './TabNavigator';

const stack = createBrowserRouter([
  {
    path: Routes.SignIn,
    element: <screens.SignIn />,
  },
  {
    path: Routes.ForgotPassword,
    element: <screens.ForgotPassword />,
  },
  {
    path: Routes.ForgotPasswordSentEmail,
    element: <screens.ForgotPasswordSentEmail />,
  },
  {
    path: Routes.SignUp,
    element: <screens.SignUp />,
  },
  {
    path: Routes.Reviews,
    element: <screens.Reviews />,
  },
  {
    path: Routes.MenuList,
    element: <screens.MenuList />,
  },
  {
    path: Routes.NewPassword,
    element: <screens.NewPassword />,
  },
  {
    path: Routes.Filter,
    element: <screens.Filter />,
  },
  {
    path: Routes.OrderHistory,
    element: <screens.OrderHistory />,
  },
  {
    path: Routes.Promocodes,
    element: <screens.Promocodes />,
  },
  {
    path: Routes.OrderSuccessful,
    element: <screens.OrderSuccessful />,
  },
  {
    path: Routes.OrderFailed,
    element: <screens.OrderFailed />,
  },
  {
    path: Routes.PromocodesEmpty,
    element: <screens.PromocodesEmpty />,
  },
  {
    path: Routes.LeaveAReview,
    element: <screens.LeaveAReview />,
  },
  {
    path: Routes.Onboarding,
    element: <screens.Onboarding />,
  },
  {
    path: Routes.OrderHistoryEmpty,
    element: <screens.OrderHistoryEmpty />,
  },
  {
    path: Routes.TrackYourOrder,
    element: <screens.TrackYourOrder />,
  },
  {
    path: Routes.Checkout,
    element: <screens.Checkout />,
  },
  {
    path: Routes.Search,
    element: <screens.Search />,
  },
  {
    path: Routes.ConfirmationCode,
    element: <screens.ConfirmationCode />,
  },
  {
    path: Routes.SignUpAccountCreated,
    element: <screens.SignUpAccountCreated />,
  },
  {
    path: Routes.VerifyYourPhoneNumber,
    element: <screens.VerifyYourPhoneNumber />,
  },
  {
    path: Routes.Dish,
    element: <screens.Dish />,
  },
  {
    path: Routes.EditProfile,
    element: <screens.EditProfile />,
  },
  {
    path: Routes.TabNavigator,
    element: <TabNavigator />,
  },
]);

export const StackNavigator: React.FC = () => {
  return <RouterProvider router={stack} />;
};
