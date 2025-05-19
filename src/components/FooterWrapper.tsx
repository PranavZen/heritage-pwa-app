import React from 'react';
import { Footer } from './Footer';
import { useLocation, useNavigate } from 'react-router-dom';
import { Routes } from '../routes';
import { useDispatch } from 'react-redux';
import { actions } from '../store/actions';

// List of routes where we don't want to show the footer
// Now empty as we want to show footer on all pages
const excludedRoutes: Routes[] = [
  // Routes.SignIn,
  // Routes.SignUp,
  // Routes.Onboarding,
  // Routes.ForgotPassword,
  // Routes.ForgotPasswordSentEmail,
  // Routes.NewPassword,
  // Routes.ConfirmationCode,
  // Routes.SignUpAccountCreated,
  // Routes.VerifyYourPhoneNumber,
  // Routes.ThankYouPage,
];

// List of routes that already have their own footer implementation
// Keep this to avoid duplicate footers
const routesWithOwnFooter = [
  Routes.TabNavigator, // TabNavigator has its own footer
];

export const FooterWrapper: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Check if current route is excluded or has its own footer
  const isExcluded = excludedRoutes.includes(currentPath as Routes);
  const hasOwnFooter = routesWithOwnFooter.some(route =>
    currentPath === route || currentPath.startsWith(`${route}/`)
  );

  // Function to handle navigation back to TabNavigator when clicking on footer tabs
  const handleTabNavigation = () => {
    // Navigate to TabNavigator
    navigate(Routes.TabNavigator);
  };

  // Don't render the footer if we're in an excluded route or in a route with its own footer
  if (isExcluded || hasOwnFooter) {
    return null;
  }

  return (
    <div className="global-footer-wrapper" onClick={handleTabNavigation}>
      <Footer />
    </div>
  );
};
