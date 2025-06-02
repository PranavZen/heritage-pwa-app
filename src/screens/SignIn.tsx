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
  const [otpError, setOtpError] = useState<string>("");
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
        const remainingTime = Math.max(
          0,
          otpSentTime + 60 - Math.floor(Date.now() / 1000)
        );
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
          // localStorage.setItem("c_idd", response.data.c_id);
          localStorage.setItem("cityId", response.data.city_id);
        } else if (
          response.data.status === "success" &&
          response.data.action === "new user"
        ) {
          setIsOtpSent(true);
          notification.success({
            message: response.data.message || "OTP sent to your mobile number",
            placement: "bottomRight",
          });
          // localStorage.setItem("c_idd", response.data.c_id);
          localStorage.setItem("cityId", response.data.city_id);
        } else {
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
  const handleVerifyOtp = React.useCallback(async () => {
    setIsLoading(true);
    setOtpError(""); 

    const formData = new FormData();
    formData.append("mobile", mobile);
    formData.append("otp", otp);

    try {
      const response = await axios.post(
        "https://heritage.bizdel.in/app/consumer/services_v11/verifyOTP",
        formData
      );

      const addressDetails = response.data.CustomerDetail[0].address_details;
      const parsedDetails =
        typeof addressDetails === "string"
          ? JSON.parse(addressDetails)
          : addressDetails;

      if (Array.isArray(parsedDetails) && parsedDetails.length === 0) {
        localStorage.setItem("c_idd", response.data.CustomerDetail[0].id);
      } else {
        localStorage.setItem("c_id", response.data.CustomerDetail[0].id);
      }

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
          navigate(0);
          navigate(Routes.TabNavigator);
          dispatch(fetchWishlist());
        }
      } else {
        // Handle incorrect OTP
        const errorMessage = response?.data?.message || "Incorrect OTP. Please try again.";
        setOtpError(errorMessage);
        setOtp(""); // Clear OTP inputs

        // Focus first input box
        setTimeout(() => {
          const firstInput = document.querySelector('.otp-input-box:first-child') as HTMLInputElement;
          if (firstInput) firstInput.focus();
        }, 100);

        notification.error({
          message: errorMessage,
          placement: "bottomRight",
        });
      }
    } catch (error) {
      console.error("Error during OTP verification:", error);
      const errorMessage = "Error verifying OTP. Please try again.";
      setOtpError(errorMessage);
      setOtp(""); // Clear OTP inputs

      // Focus first input box
      setTimeout(() => {
        const firstInput = document.querySelector('.otp-input-box:first-child') as HTMLInputElement;
        if (firstInput) firstInput.focus();
      }, 100);

      notification.error({
        message: errorMessage,
        placement: "bottomRight",
      });
    } finally {
      setIsLoading(false);
    }
  }, [mobile, otp, navigate, dispatch]);

  // Debug OTP changes and auto-verify when complete
  React.useEffect(() => {
    // console.log("OTP changed:", otp, "Length:", otp.length);

    // Auto-verify when OTP is complete (4 digits)
    if (otp.length === 4 && /^\d{4}$/.test(otp)) {
      // console.log("Auto-verifying OTP:", otp);
      setTimeout(() => {
        handleVerifyOtp();
      }, 300);
    }
  }, [otp, handleVerifyOtp]);

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
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        <section
          ref={formRef}
          className={`login-form-container ${animateForm ? "fade-in" : ""}`}
        >
          <div className="login-header">
            <div className="logo-container">
              <img src={logo} alt="Heritage Logo" className="logo-image" />
            </div>
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Sign in to continue</p>
          </div>

          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <Input
              type="number"
              placeholder="Enter your mobile number"
              containerStyle={{
                marginBottom: 8,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                transform: mobile.length === 10 ? "translateY(-2px)" : "none",
                boxShadow:
                  mobile.length === 10
                    ? "0 4px 8px rgba(26, 113, 46, 0.2)"
                    : "none",
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
              I agree to the{" "}
              <a href="/terms" className="terms-link">
                Terms & Conditions
              </a>
            </label>
          </div>
          {isOtpSent && (
            <div className="otp-container">
              <label className="form-label">OTP Verification</label>
              <div className="otp-input-container">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    className={`otp-input-box ${otp[index] ? "filled" : ""} ${otpError ? "error" : ""}`}
                    value={otp[index] || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d?$/.test(value)) {
                        // Clear error when user starts typing
                        if (otpError) {
                          setOtpError("");
                        }

                        const newOtp = otp.split("");
                        newOtp[index] = value;
                        const finalOtp = newOtp.join("");
                        setOtp(finalOtp);

                        // Auto-focus next input (only if not the last input)
                        if (value && index < 3) {
                          const nextInput = document.querySelector(
                            `.otp-input-box:nth-child(${index + 2})`
                          ) as HTMLInputElement;
                          if (nextInput) nextInput.focus();
                        } else if (value && index === 3) {
                          // Blur the last input to ensure the value is committed
                          (e.target as HTMLInputElement).blur();
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      // Handle backspace to focus previous input
                      if (e.key === "Backspace" && !otp[index] && index > 0) {
                        const prevInput = document.querySelector(
                          `.otp-input-box:nth-child(${index})`
                        ) as HTMLInputElement;
                        if (prevInput) prevInput.focus();
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedData = e.clipboardData.getData("text");
                      if (/^\d{4}$/.test(pastedData)) {
                        // Clear error when pasting
                        if (otpError) {
                          setOtpError("");
                        }

                        setOtp(pastedData);
                        // Focus the last input and then blur to ensure value is set
                        const lastInput = document.querySelector(
                          ".otp-input-box:nth-child(4)"
                        ) as HTMLInputElement;
                        if (lastInput) {
                          lastInput.focus();
                          setTimeout(() => {
                            lastInput.blur();
                          }, 100);
                        }
                      }
                    }}
                  />
                ))}
              </div>

              {otpError && (
                <div className="otp-error-message">
                  {otpError}
                </div>
              )}

              <div className="otp-timer">
                {timer > 0 ? (
                  <span>
                    Resend OTP in{" "}
                    <span className="otp-timer-value">{timer}s</span>
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


            </div>
          )}

          {!isOtpSent && isTermsAccepted && (
            <components.Button
              text={isLoading ? "Sending OTP..." : "Generate OTP"}
              onClick={handleLogin}
              disabled={isLoading || mobile.length !== 10}
              containerStyle={{
                marginBottom: 20,
                transition: "all 0.3s ease",
                transform: mobile.length === 10 ? "translateY(-2px)" : "none",
                boxShadow:
                  mobile.length === 10
                    ? "0 4px 12px rgba(26, 113, 46, 0.3)"
                    : "none",
              }}
            />
          )}
        </section>
        <button onClick={redirectToCity} className="explore-btn">
          Enter Your PinCode
        </button>
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
