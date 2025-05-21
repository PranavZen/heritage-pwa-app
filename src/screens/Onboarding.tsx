import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Routes } from "../routes";
import "./SignIn.scss"; // Using the same SCSS as SignIn
import { components } from "../components";
import { svg } from "../assets/svg";
import Lottie from "lottie-react";
import LocationPinAnimation from "../components/Animation/LocationPin.json";
import { notification } from "antd";
import { Input } from "../components/Input";
import FormBackground from "../components/Animation/FormBackground.json";
import logo from "../assets/icons/logo.png";
export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLElement>(null);

  // State variables
  const [opacity, setOpacity] = useState<number>(0);
  const [pincode, setPincode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [locationData, setLocationData] = useState<any>(null);
  const [animateButton, setAnimateButton] = useState<boolean>(false);

  // Animation effect when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Fade in the component
    setTimeout(() => {
      setOpacity(1);
      setAnimateButton(true);
    }, 300);
  }, []);

  // Validate pincode as user types
  useEffect(() => {
    if (pincode.length === 0) {
      setIsValid(null);
      setErrorMessage("");
      return;
    }

    // Check if pincode contains only digits
    if (!/^\d*$/.test(pincode)) {
      setIsValid(false);
      setErrorMessage("Pincode should contain only numbers");
      return;
    }

    // Check if pincode is 6 digits
    if (pincode.length === 6) {
      setIsValid(true);
      setErrorMessage("");
      setAnimateButton(true);
    } else {
      setIsValid(false);
      setErrorMessage(pincode.length > 6 ? "Pincode should be exactly 6 digits" : "");
      setAnimateButton(false);
    }
  }, [pincode]);

  const handleContinue = async () => {
    if (pincode.trim().length !== 6) {
      setErrorMessage("Please enter a valid 6-digit pincode");
      setIsValid(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      const formData = new FormData();
      formData.append("pincode", pincode.trim());

      const response = await fetch(
        "https://heritage.bizdel.in/app/consumer/services_v11/pincodeverify",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

     
      // console.log("Pincode verification response:", data);
      // console.log("Is serviceable:", data.search_data?.[0]?.is_servicesable);

      if (
        data.status === "success" &&
        data.search_data &&
        data.search_data.length > 0 &&
        data.search_data[0].is_servicesable === "1"
      ) {
        const locationInfo = data.search_data[0];
        setLocationData(locationInfo);

        // Store city ID in localStorage
        localStorage.setItem("cityId", locationInfo.city_id);

        // Show success notification
        notification.success({
          message: "Location Verified",
          description: `Your location ${locationInfo.city_name} is serviceable. Redirecting...`,
          placement: "bottomRight",
          duration: 3
        });

        // Redirect after a short delay to show the success message
        setTimeout(() => {
          navigate(Routes.TabNavigator);
        }, 2000);
      } else {
        setIsValid(false);

        // Check if we have search data
        if (data.search_data && data.search_data.length > 0) {
          setErrorMessage("This pincode is not serviceable. Please try a different one.");
          notification.error({
            message: "Location Not Serviceable",
            description: "We don't service this area yet. Please try a different pincode.",
            placement: "bottomRight"
          });
        } else {
          setErrorMessage("Invalid pincode or no location found. Please try a different pincode.");
          notification.error({
            message: "Invalid Pincode",
            description: "We couldn't find this pincode. Please check and try again.",
            placement: "bottomRight"
          });
        }
      }
    } catch (error) {
      console.error("Pincode verification failed:", error);
      setIsValid(false);
      setErrorMessage("Something went wrong. Please try again later.");
      notification.error({
        message: "Verification Failed",
        description: "Something went wrong. Please try again later.",
        placement: "bottomRight"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // const renderHeader = (): JSX.Element => {
  //   return <components.Header title="Location" showGoBack={true} />;
  // };

  // We don't need this function as we're using the Input component

  // We've moved these functions directly into the JSX

  const goBack = () => {
    navigate(-1);
  };

  const renderContent = (): JSX.Element => {
    return (
      <main className="scrollable signInWrap">
        {/* Background animation */}
        <div className="background-animation">
          <Lottie
            animationData={FormBackground}
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Back button */}
        <button className="back-button" onClick={goBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke="#1a712e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="#1a712e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <section
          ref={formRef}
          className={`login-form-container`}
        >
          <div className="login-header">
            <div className="logo-container">
              <img src={logo} alt="Heritage Logo" className="logo-image" />
            </div>
            <h1 className="login-title">Welcome to Heritage</h1>
            <p className="login-subtitle">Please enter your pincode to check if we deliver to your area</p>
          </div>

          <div className="form-group">
            <label className="form-label">
              Pincode
            </label>
            <Input
              type="number"
              placeholder="Enter 4-digit pincode"
              containerStyle={{
                marginBottom: 8,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                transform: isValid ? "translateY(-2px)" : "none",
                boxShadow: isValid ? "0 4px 8px rgba(26, 113, 46, 0.2)" : "none"
              }}
              leftIcon={<svg.MapSvg />}
              value={pincode}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d{0,6}$/.test(value)) {
                  setPincode(value);
                }
              }}
            />
            {errorMessage && (
              <span className="error-message">
                {errorMessage}
              </span>
            )}
          </div>

          <components.Button
            text={isLoading ? "Verifying..." : "Continue"}
            onClick={handleContinue}
            // disabled={!isValid || isLoading}
            containerStyle={{
              marginBottom: 20,
              transition: "all 0.3s ease",
              transform: isValid ? "translateY(-2px)" : "none",
              boxShadow: isValid ? "0 4px 12px rgba(26, 113, 46, 0.3)" : "none"
            }}
          />
          {locationData && (
            <div className="location-info">
              <p>Location verified</p>
              <p className="city">{locationData.city_name}</p>
              <p>{locationData.state_name}</p>
            </div>
          )}
        </section>
      </main>
    );
  };

  // Add loading modal for verification
  const renderLoadingModal = (): JSX.Element | null => {
    if (!isLoading) return null;

    return (
      <div className="popup-modal">
        <div className="popup-content">
          <Lottie
            animationData={LocationPinAnimation}
            style={{ width: 120, height: 120, margin :"0 auto" }}
          />
          <p className="loading-message">
            Verifying location...
          </p>
        </div>
      </div>
    );
  };

  return (
    <div id="screen" style={{ opacity }}>
      {renderContent()}
      {renderLoadingModal()}
    </div>
  );
};
export {};
