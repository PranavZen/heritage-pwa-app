import { useDispatch } from 'react-redux';
import { showLoader, hideLoader } from '../store/slices/loaderSlice';

/**
 * Custom hook to manage the global loader state
 * @returns Object with functions to show and hide the loader
 */
export const useLoader = () => {
  const dispatch = useDispatch();

  /**
   * Show the global loader
   * @param message Optional message to display with the loader
   */
  const show = (message: string | null = null) => {
    dispatch(showLoader(message));
  };

  /**
   * Hide the global loader
   */
  const hide = () => {
    dispatch(hideLoader());
  };

  /**
   * Wrap an async function with loader state management
   * @param asyncFn The async function to wrap
   * @param message Optional message to display with the loader
   * @returns A new function that shows the loader before executing and hides it after
   */
  const withLoader = <T extends any[], R>(
    asyncFn: (...args: T) => Promise<R>,
    message: string | null = null
  ) => {
    return async (...args: T): Promise<R> => {
      try {
        show(message);
        return await asyncFn(...args);
      } finally {
        hide();
      }
    };
  };

  return { show, hide, withLoader };
};
