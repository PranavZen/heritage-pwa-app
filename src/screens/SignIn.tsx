import React, { useState, useEffect } from "react";
import axios from "axios";
import { hooks } from "../hooks";
import { Routes } from "../routes";
import { svg } from "../assets/svg";
import { Input } from "../components/Input";
import { components } from "../components";
import { notification } from "antd";
import { useDispatch } from "react-redux";

export const SignIn: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();

  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [opacity, setOpacity] = useState<number>(0);
  const [mobile, setMobile] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(60);
  const [isResendAvailable, setIsResendAvailable] = useState<boolean>(false);
  const [otpSentTime, setOtpSentTime] = useState<number | null>(null);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor("#F6F9F9", "#F6F9F9", dispatch);

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
          setOtpSentTime(Math.floor(Date.now() / 1000));
          notification.success({
            message: response.data.message || "OTP sent to your mobile number",
            placement: "bottomRight",
          });
          localStorage.setItem("c_id", response.data.c_id);
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
        });
      }
    } else {
      notification.error({
        message: "Please enter a valid 10-digit mobile number.",
        placement: "bottomRight",
      });
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const formData = new FormData();
      formData.append("mobile", mobile);
      formData.append("otp", otp);

      const response = await axios.post(
        "https://heritage.bizdel.in/app/consumer/services_v11/verifyOTP",
        formData
      );

      if (response.data.status === "success") {
        const addressDetails = response.data.CustomerDetail[0].address_details;
        localStorage.setItem(
          "profileId",
          JSON.stringify(response.data.CustomerDetail[0].id)
        );
        localStorage.setItem(
          "area_id",
          JSON.stringify(
            response.data.CustomerDetail[0].address_details[0].area_id
          )
        );
        if (addressDetails.length === 0) {
          notification.success({
            message: "OTP Verified. Please add your address.",
            placement: "bottomRight",
          });
          navigate(Routes.AddressAdd);
        } else {
          notification.success({
            message: "OTP Verified.",
            placement: "bottomRight",
          });
          navigate(Routes.TabNavigator);
        }
      } else {
        notification.error({
          message: response.data.message || "OTP verification failed",
          placement: "bottomRight",
        });
      }
    } catch (error) {
      console.error("Error during OTP verification:", error);
      notification.error({
        message: "Something went wrong. Please try again.",
        placement: "bottomRight",
      });
    }
  };

  const renderHeader = (): JSX.Element => {
    return <components.Header showGoBack={false} />;
  };

  const redirectToCity = () => {
    navigate("/city-choose");
  };

  const renderContent = (): JSX.Element => {
    return (
      <main className="scrollable container">
        <section
          style={{
            backgroundColor: "var(--white-color)",
            paddingLeft: 20,
            paddingRight: 20,
            height: "100%",
            paddingTop: "5%",
            borderRadius: 10,
          }}
        >
          <h1 style={{ marginBottom: 10 }}>Welcome Back!</h1>

          <Input
            type="number"
            placeholder="Enter your mobile number"
            containerStyle={{ marginBottom: 14 }}
            leftIcon={<svg.PhoneSvg />}
            value={mobile}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d{0,10}$/.test(value)) {
                setMobile(value);
              }
            }}
          />
          {mobile.length > 0 && mobile.length !== 10 && (
            <span className="t144">Mobile number must be exactly 10 digits.</span>
          )}

          <div className="terms-and-conditions">
            <span>
              <input
                type="checkbox"
                checked={isTermsAccepted}
                onChange={() => setIsTermsAccepted(!isTermsAccepted)}
                className="checkboxWrap"
              />
              I agree to the <a href="#">Terms & Conditions</a>
            </span>
          </div>

          <span className="t16" style={{ marginBottom: 30, display: "block" }}>
            {isOtpSent ? (
              timer === 0 ? (
                "Did not get OTP ?"
              ) : (
                `Did not get OTP ? (${timer}s)`
              )
            ) : (
              ""
            )}
          </span>

          <div className="mb5">
            {!isOtpSent ? (
              <components.Button text="Generate OTP" onClick={handleLogin} />
            ) : (
              <>
                {timer === 0 && isResendAvailable && (
                  <a
                    onClick={() => {
                      setIsOtpSent(false);
                      setIsResendAvailable(false);
                      setTimer(60);
                      setOtpSentTime(Math.floor(Date.now() / 1000));
                      handleLogin();
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    Resend OTP
                  </a>
                )}
              </>
            )}
          </div>

          {isOtpSent && (
            <>
              <Input
                placeholder="Enter OTP"
                containerStyle={{ marginBottom: 14 }}
                leftIcon={<svg.KeySvg />}
                value={otp}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setOtp(e.target.value)
                }
              />
              <components.Button text="Verify OTP" onClick={handleVerifyOtp} />
            </>
          )}

          <button onClick={redirectToCity} className="explore-btn">
            <p style={{ margin: "0 auto" }}> Explore Now</p>
          </button>
        </section>
      </main>
    );
  };

  return (
    <div id="screen" style={{ opacity }}>
      {renderHeader()}
      {renderContent()}
    </div>
  );
};
