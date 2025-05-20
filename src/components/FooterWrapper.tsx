import React from 'react';
import { Footer } from './Footer';
import { useLocation, useNavigate } from 'react-router-dom';
import { Routes } from '../routes';
import { useDispatch } from 'react-redux';
import { actions } from '../store/actions';

// List of routes where we don't want to show the footer
const excludedRoutes: Routes[] = [
  Routes.SignIn,           // Hide footer on sign in screen
  Routes.Onboarding,       // Hide footer on pincode screen
  // Other routes where footer should be hidden can be uncommented if needed
  // Routes.SignUp,
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

interface FooterWrapperProps {
  children?: React.ReactNode;
}

export const FooterWrapper: React.FC<FooterWrapperProps> = ({ children }) => {
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

  // Don't show footer on excluded routes
  if (isExcluded) {
    return <>{children}</>;
  }

  // Don't show footer on routes with their own footer to avoid duplicates
  if (hasOwnFooter) {
    return <>{children}</>;
  }

  // Show footer on all other pages
  return (
    <>
      {children}
      <div className="global-footer-wrapper" onClick={handleTabNavigation}>
        <Footer />
      </div>
    </>
  );
};
