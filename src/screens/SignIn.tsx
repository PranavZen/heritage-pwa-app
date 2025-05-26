import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { hooks } from "../hooks";
import { Routes } from "../routes";
import { svg } from "../assets/svg";
import { Input } from "../components/Input";
import { components } from "../components";
import { notification } from "antd";
import { useDispatch } from "react-redux";
import { fetchWishlist } from "../store/slices/wishlistSlice";
import Lottie from "lottie-react";
import "./SignIn.scss";

// Import animations
import OtpVerificationAnimation from "../components/Animation/OtpVerification.json";
import WelcomeAnimation from "../components/Animation/WelcomeAnimation.json";
import FormBackground from "../components/Animation/FormBackground.json";
import logo from "../assets/icons/logo.png";

export const SignIn: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();
  const formRef = useRef<HTMLDivElement>(null);

  // State variables
  const [opacity, setOpacity] = useState<number>(0);
  const [mobile, setMobile] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(60);
  const [isResendAvailable, setIsResendAvailable] = useState<boolean>(false);
  const [otpSentTime, setOtpSentTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [animateForm, setAnimateForm] = useState<boolean>(false);
  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor("#F6F9F9", "#F6F9F9", dispatch);

  // Animation effect when component mounts
  useEffect(() => {
    // Trigger form animation after a short delay
    const timer = setTimeout(() => {
      setAnimateForm(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // OTP timer effect
  useEffect(() => {
    if (isOtpSent && otpSentTime) {
      const interval = setInterval(() => {
        const remainingTime = Math.max(0, otpSentTime + 60 - Math.floor(Date.now() / 1000));
        setTimer(remainingTime);

        if (remainingTime === 0) {
          clearInterval(interval);
          setIsResendAvailable(true);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOtpSent, otpSentTime]);

  const handleLogin = async () => {
    if (!isTermsAccepted) {
      notification.error({
        message: "Please agree to the Terms and Conditions before proceeding.",
        placement: "bottomRight",
      });
      return;
    }
    if (mobile.length === 10) {
      try {
        setIsLoading(true);

        const formData = new FormData();
        formData.append("mobile", mobile);

        const response = await axios.post(
          "https://heritage.bizdel.in/app/consumer/services_v11/login",
          formData
        );

        if (
          response.data.status === "success" &&
          response.data.action === "existing user"

        ) {
          setIsOtpSent(true);
          dispatch(fetchWishlist());
          setOtpSentTime(Math.floor(Date.now() / 1000));
          notification.success({
            message: response.data.message || "OTP sent to your mobile number",
            placement: "bottomRight",
          });
          localStorage.setItem("c_id", response.data.c_id);
          localStorage.setItem("cityId", response.data.city_id);
        }
        else if (
          response.data.status === "success" &&
          response.data.action === "new user"
        ) {
          setIsOtpSent(true);
          notification.success({
            message: response.data.message || "OTP sent to your mobile number",
            placement: "bottomRight",
          });
          localStorage.setItem("c_id", response.data.c_id);
          localStorage.setItem("cityId", response.data.city_id);
        }

        else {
          notification.error({
            message: response.data.message || "Failed to send OTP",
            placement: "bottomRight",
          });
        }
      } catch (error) {
        console.error("Error during login:", error);
        notification.error({
          message: "Something went wrong. Please try again.",
          placement: "bottomRight",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      notification.error({
        message: "Please enter a valid 10-digit mobile number.",
        placement: "bottomRight",
      });
    }
  };

  // const handleVerifyOtp = async () => {
  //   try {
  //     // Show loading state
  //     setIsLoading(true);

  //     const formData = new FormData();
  //     formData.append("mobile", mobile);
  //     formData.append("otp", otp);

  //     const response = await axios.post(
  //       "https://heritage.bizdel.in/app/consumer/services_v11/verifyOTP",
  //       formData
  //     );
  //     console.log("aaaabbb", response);
  //     if (response.data.status == "success") {
  //       const addressDetails = response?.data?.CustomerDetail[0]?.address_details;

  //       // console.log("addressDetailsaddressDetails", addressDetails)
  //       navigate(Routes.NewUsereAddAddress);
  //       localStorage.setItem(
  //         "profileId",
  //         JSON.stringify(response.data.CustomerDetail[0].id)
  //       );
  //       localStorage.setItem(
  //         "area_id",
  //         response.data.CustomerDetail[0].address_details[0].area_id
  //       );
  //       if (addressDetails.length === 0){
  //         notification.success({
  //           message: "OTP Verified. Please add your address.",
  //           placement: "bottomRight",
  //         });

  //       } else {
  //         notification.success({
  //           message: "OTP Verified.",
  //           placement: "bottomRight",
  //         });
  //         navigate(Routes.TabNavigator);
  //         dispatch(fetchWishlist());
  //       }
  //     } else {
  //       notification.error({
  //         message: response.data.message || "OTP verification failed",
  //         placement: "bottomRight",
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error during OTP verification:", error);
  //     notification.error({
  //       message: "Error verifying OTP. Please try again.",
  //       placement: "bottomRight",
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };


  const handleVerifyOtp = async () => {
    setIsLoading(true); 

    const formData = new FormData();
    formData.append("mobile", mobile);
    formData.append("otp", otp);

    try {
      const response = await axios.post(
        "https://heritage.bizdel.in/app/consumer/services_v11/verifyOTP",
        formData
      );
 

      if (response?.data?.status === "success") {
        const customer = response?.data?.CustomerDetail?.[0];

        if (!customer) {
          throw new Error("Customer detail is missing in the response.");
        }

        const addressDetails = customer?.address_details ?? [];
        const profileId = customer?.id ?? null;
        const areaId = addressDetails?.[0]?.area_id ?? null;

  
        if (profileId) {
          localStorage.setItem("profileId", JSON.stringify(profileId));
        }

        if (areaId) {
          localStorage.setItem("area_id", areaId);
        }

        // Notification and navigation based on address availability
        if (Array.isArray(addressDetails) && addressDetails.length === 0) {
          notification.success({
            message: "OTP Verified. Please add your address.",
            placement: "bottomRight",
          });
          navigate(Routes.NewUsereAddAddress);
        } else {
          notification.success({
            message: "OTP Verified.",
            placement: "bottomRight",
          });
          navigate(Routes.TabNavigator);
          dispatch(fetchWishlist());
        }
      } else {
        notification.error({
          message: response?.data?.message || "OTP verification failed",
          placement: "bottomRight",
        });
      }
    } catch (error) {
      console.error("Error during OTP verification:", error);
      notification.error({
        message: "Error verifying OTP. Please try again.",
        placement: "bottomRight",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const redirectToCity = () => {
    navigate("/pincode");
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

        <section
          ref={formRef}
          className={`login-form-container ${animateForm ? 'fade-in' : ''}`}
        >
          <div className="login-header">
            <div className="logo-container">
              <img src={logo} alt="Heritage Logo" className="logo-image" />
            </div>
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Sign in to continue</p>
          </div>

          <div className="form-group">
            <label className="form-label">
              Mobile Number
            </label>
            <Input
              type="number"
              placeholder="Enter your mobile number"
              containerStyle={{
                marginBottom: 8,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                transform: mobile.length === 10 ? "translateY(-2px)" : "none",
                boxShadow: mobile.length === 10 ? "0 4px 8px rgba(26, 113, 46, 0.2)" : "none"
              }}
              leftIcon={<svg.PhoneSvg />}
              value={mobile}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d{0,11}$/.test(value)) {
                  setMobile(value);
                }
              }}
            />
            {mobile.length > 0 && mobile.length === 11 && (
              <span className="error-message">
                Mobile number must be exactly 10 digits.
              </span>
            )}
          </div>

          <div className="terms-container">
            <label className="terms-label">
              <input
                type="checkbox"
                checked={isTermsAccepted}
                onChange={() => setIsTermsAccepted(!isTermsAccepted)}
                className="terms-checkbox"
              />
              I agree to the <a
                href="/terms"
                className="terms-link"
              >
                Terms & Conditions
              </a>
            </label>
          </div>

          {isOtpSent && (
            <div className="otp-container">
              <label className="form-label">
                OTP Verification
              </label>
              <Input
                placeholder="Enter OTP"
                containerStyle={{
                  marginBottom: 8,
                  transition: "all 0.3s ease"
                }}
                leftIcon={<svg.KeySvg />}
                value={otp}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setOtp(e.target.value)
                }
              />

              <div className="otp-timer">
                {timer > 0 ? (
                  <span>
                    Resend OTP in <span className="otp-timer-value">{timer}s</span>
                  </span>
                ) : (
                  isResendAvailable && (
                    <button
                      onClick={() => {
                        setIsOtpSent(false);
                        setIsResendAvailable(false);
                        setTimer(60);
                        setOtpSentTime(Math.floor(Date.now() / 1000));
                        handleLogin();
                      }}
                      className="resend-button"
                    >
                      Resend OTP
                    </button>
                  )
                )}
              </div>

              <components.Button
                text={isLoading ? "Verifying..." : "Verify OTP"}
                onClick={handleVerifyOtp}
                disabled={isLoading || otp.length === 0}
              />
            </div>
          )}

          {!isOtpSent && (
            <components.Button
              text={isLoading ? "Sending OTP..." : "Generate OTP"}
              onClick={handleLogin}
              disabled={isLoading || mobile.length !== 10 || !isTermsAccepted}
              containerStyle={{
                marginBottom: 20,
                transition: "all 0.3s ease",
                transform: mobile.length === 10 && isTermsAccepted ? "translateY(-2px)" : "none",
                boxShadow: mobile.length === 10 && isTermsAccepted ? "0 4px 12px rgba(26, 113, 46, 0.3)" : "none"
              }}
            />
          )}

          <button
            onClick={redirectToCity}
            className="explore-btn"
          >
            Enter Your PinCode
          </button>
        </section>
      </main>
    );
  };

  // Add loading modal for OTP verification
  const renderLoadingModal = (): JSX.Element | null => {
    if (!isLoading) return null;

    return (
      <div className="popup-modal">
        <div className="popup-content">
          <Lottie
            animationData={OtpVerificationAnimation}
            style={{ width: 120, height: 120, margin: "0 auto" }}
          />
          <p className="loading-message">
            {isOtpSent ? "Verifying OTP..." : "Sending OTP..."}
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
