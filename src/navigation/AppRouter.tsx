import React from 'react';
import { RouterProvider, createBrowserRouter, Navigate, Outlet } from 'react-router-dom';

import { screens } from '../screens';
import { TabNavigator } from './TabNavigator';
import { components } from '../components';
import { Routes } from '../routes';
import ProtectedComponent from '../components/ProtectedComponent';



const AppLayout = () => {

  return (
    <components.FooterWrapper>
      <Outlet />
    </components.FooterWrapper>
  );
};

const c_id = localStorage.getItem('c_id');


const stack = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: Routes.SignIn,
        element: c_id ? <Navigate to={Routes.TabNavigator} replace /> : <screens.SignIn />,
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
        element: (
          <ProtectedComponent>
            <TabNavigator />
          </ProtectedComponent>
        ),
      },

      {
        path: Routes.MyAddress,
        element: <screens.MyAddress />,
      },
      {
        path: Routes.AddressAdd,
        element: <screens.AddressAdd />,
      },
      {
        path: Routes.ClientNotification,
        element: <screens.ClientNotification />,
      },
      {
        path: Routes.ClientNotificationDetails,
        element: <screens.ClientNotificationDetails />,
      },
      {
        path: Routes.CustomerCare,
        element: <screens.CustomerCare />,
      },
      {
        path: Routes.OrderSubscription,
        element: <screens.SubscriptionOrder />
      },
      {
        path: Routes.WalletHistory,
        element: <screens.WalletHistory />
      },
      {
        path: Routes.SubscriptionModify,
        element: <screens.SubscriptionModify />
      },
      {
        path: Routes.SubsCriptionOrder,
        element: <screens.SubscriptionOrder />
      },
      {
        path: Routes.CouponList,
        element: <screens.CouponList />
      },
      {
        path: Routes.CouponSummary,
        element: <screens.CouponSummary />
      },
      {
        path: Routes.SubscriptionOrderCheck,
        element: <screens.SubscriptionOrderCheck />
      },
      {
        path: Routes.SelectMyAddress,
        element: <screens.SelectMyAddress />
      },
      {
        path: Routes.ThankYouPage,
        element: <screens.ThankYouPage />
      },
      {
        path: Routes.NewUsereAddAddress,
        element: <screens.NewUsereAddAddress />
      },
      // Default route
      {
        path: '/',
        element: <Navigate to={Routes.SignIn} replace />
      },
      // Catch-all route for 404
      {
        path: '*',
        element: <Navigate to={Routes.SignIn} replace />
      }
    ]
  }
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={stack} />;
};
