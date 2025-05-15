import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import PuffLoader from 'react-spinners/PuffLoader';
import '../scss/loader.scss';

interface LoaderProps {
  local?: boolean;
  size?: number;
  message?: string | null;
}

export const Loader: React.FC<LoaderProps> = ({
  local = false,
  size = 40,
  message = null
}) => {
  const globalLoaderState = useSelector((state: RootState) => state.loaderSlice);

  // If this is a local loader, render it directly
  if (local) {
    return (
      <div className="loader-container local">
        <div className="loader-content">
          <PuffLoader
            size={size}
            color={'#1a712e'}
            aria-label="Loading Spinner"
            data-testid="loader"
            speedMultiplier={1}
          />
          {message && <p className="loader-message">{message}</p>}
        </div>
      </div>
    );
  }

  // If this is the global loader, only render if the global state says to show it
  // This prevents multiple instances of the loader from showing
  if (!globalLoaderState.isLoading) {
    return null;
  }

  return (
    <div className="loader-container global">
      <div className="loader-backdrop"></div>
      <div className="loader-content">
        <PuffLoader
          size={size}
          color={'#1a712e'}
          aria-label="Loading Spinner"
          data-testid="loader"
          speedMultiplier={1}
        />
        {(globalLoaderState.message || message) && (
          <p className="loader-message">
            {globalLoaderState.message || message}
          </p>
        )}
      </div>
    </div>
  );
};
