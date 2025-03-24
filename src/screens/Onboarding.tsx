import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Routes } from '../routes';
import './onboarding.css';
import axios from 'axios';


export const Onboarding: React.FC = () => {

  const navigate = useNavigate();

  const [pincode, setPincode] = useState('');
  const [isPincodeValid, setIsPincodeValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cityInfo, setCityInfo] = useState<any>(null);

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPincode(e.target.value);
  };

  const verifyPincode = async () => {
    if (!pincode) {
      setErrorMessage('Please enter a pincode');
      return;
    }

    // Prepare form data to be sent in the POST request
    const formData = new FormData();
    formData.append('pincode', pincode);

    try {
      // Make the POST request using axios
      const response = await axios.post(
        'https://heritage.bizdel.in/app/consumer/services_v11/pincodeverify',
        formData
      );

      const data = response.data;

      console.log("bbbbbbbbbbbbb", response);

      if (data.status === 'success' && data.search_data.length > 0) {
        const cityData = data.search_data[0];

        localStorage.setItem('cityId', cityData.city_id);
        localStorage.setItem('area_id', cityData.pincode);
        // localStorage.setItem('city_name', cityData.city_name);
        // localStorage.setItem('state_name', cityData.state_name);

        navigate(Routes.TabNavigator);

        setCityInfo(cityData);
        setIsPincodeValid(true);
        setErrorMessage('');
      } else {
        setErrorMessage('Invalid pincode or no services available for this area.');
        setIsPincodeValid(false);
      }
    } catch (error) {
      setErrorMessage('Error verifying pincode. Please try again.');
      setIsPincodeValid(false);
    }
  };

  const handleSignIn = () => {
    navigate(Routes.SignIn);
  };

  const renderSlider = (): JSX.Element => {
    return (
      <div
        className='embla'
        style={{
          position: 'relative',
          height: '100%',
          justifyContent: 'center',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >

        <div className="onboarding-container">
          <div className="onboarding-form">
            <div
              className="onboarding-button"
              onClick={() => {
                navigate(Routes.SignIn);
              }}
            >
              <p>Sign in to select address</p>
            </div>

            <h1 className="onboarding-title">Verify Pincode</h1>

            <input
              type="text"
              value={pincode}
              onChange={handlePincodeChange}
              placeholder="Enter Pincode"
              className="onboarding-input"
            />
            <button onClick={verifyPincode} className="onboarding-button">
              <p style={{ margin: '0 auto' }}>Verify</p>
            </button>

            {errorMessage && <p className="error-message">{errorMessage}</p>}

            {isPincodeValid && cityInfo && (
              <div className="city-info">
                <h3>City: {cityInfo.city_name}</h3>
                <h3>State: {cityInfo.state_name}</h3>
                <button onClick={handleSignIn} className="onboarding-button">
                  Sign In to Select Address
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    );
  };
  return (
    <div
      id='screen'
    >
      {renderSlider()}
    </div>
  );
};
