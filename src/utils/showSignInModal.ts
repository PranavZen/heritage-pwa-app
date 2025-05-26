import { isUserSignedIn } from './isUserSignedIn';
import { useSignInModalContext } from '../components/SignInModalProvider';

interface SignInModalOptions {
  title?: string;
  message?: string;
  onSignIn?: () => void;
}

/**
 * Utility function to check if user is signed in and show sign-in modal if not
 * @param context The sign-in modal context from useSignInModalContext
 * @param options Optional configuration for the modal
 * @returns Boolean indicating if the user is signed in
 */
export const showSignInModal = (
  context: ReturnType<typeof useSignInModalContext>,
  options?: SignInModalOptions
): boolean => {
  const userSignedIn = isUserSignedIn();
  
  if (!userSignedIn) {
    context.openSignInModal(options);
  }
  
  return userSignedIn;
};
