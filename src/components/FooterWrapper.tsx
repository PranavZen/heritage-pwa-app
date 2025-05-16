import React from 'react';
import { Footer } from './Footer';
import { useLocation } from 'react-router-dom';
import { Routes } from '../routes';

// List of routes where we don't want to show the footer
const excludedRoutes = [
  Routes.SignIn,
  Routes.SignUp,
  Routes.Onboarding,
  Routes.ForgotPassword,
  Routes.ForgotPasswordSentEmail,
  Routes.NewPassword,
  Routes.ConfirmationCode,
  Routes.SignUpAccountCreated,
  Routes.VerifyYourPhoneNumber,
  // Add any other routes where you don't want the footer to appear
];

// List of routes that already have their own footer implementation
const routesWithOwnFooter = [
  Routes.TabNavigator, // TabNavigator has its own footer
];

export const FooterWrapper: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Check if current route is excluded or has its own footer
  const isExcluded = excludedRoutes.includes(currentPath as Routes);
  const hasOwnFooter = routesWithOwnFooter.some(route => currentPath === route || currentPath.startsWith(`${route}/`));

  // Don't render the footer if we're in an excluded route or in a route with its own footer
  if (isExcluded || hasOwnFooter) {
    return null;
  }

  return <Footer />;
};
