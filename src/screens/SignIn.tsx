import React, { useState, useEffect } from "react";
import axios from "axios";
import { hooks } from "../hooks";
import { Routes } from "../routes";
import { svg } from "../assets/svg";
import { Input } from "../components/Input";
import { components } from "../components";
import { notification } from "antd";
import { useDispatch } from "react-redux";
import { fetchWishlist } from "../store/slices/wishlistSlice";

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
        // console.log("area_id", response);
        if (
          response.data.status === "success" &&
          response.data.action === "existing user"
        ) 
        
        {
          setIsOtpSent(true);
          dispatch(fetchWishlist());
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

      // console.log("otppppppppppppppp", response);

      if (response.data.status === "success"){
        const addressDetails = response.data.CustomerDetail[0].address_details;
        navigate(Routes.NewUsereAddAddress);
        localStorage.setItem(
          "profileId",
          JSON.stringify(response.data.CustomerDetail[0].id)
        );
        localStorage.setItem(
          "area_id",
          response.data.CustomerDetail[0].address_details[0].area_id
        );
        if (addressDetails.length === 0) {
          notification.success({
            message: "OTP Verified. Please add your address.",
            placement: "bottomRight",
          });
         
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
          message: response.data.message || "OTP verification failed",
          placement: "bottomRight",
        });
      }
    } catch (error) {
      console.error("Error during OTP verification:", error);
    }
  };

  const renderHeader = (): JSX.Element => {
    return <components.Header showGoBack={false} />;
  };

  const redirectToCity = () => {
    navigate("/pincode");
  };

  const renderContent = (): JSX.Element => {
    return (
      <main className="scrollable signInWrap">
        <section
          style={{
            padding: 20,
            width: "100%",
          }}
        >
          <h1 style={{ marginBottom: 30, textAlign: "center" }}>Login Here</h1>

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

          <div style={{ margin: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 16 }}>
              <input
                type="checkbox"
                checked={isTermsAccepted}
                onChange={() => setIsTermsAccepted(!isTermsAccepted)}
                className="checkboxWrap"
              />
              {" "}I agree to the <a href="#">Terms & Conditions</a>
            </span>
          </div>

          <span className="t16" style={{ marginBottom: 0, display: "block", textAlign: "right", fontSize: 14 }}>
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
                  <button
                    onClick={() => {
                      setIsOtpSent(false);
                      setIsResendAvailable(false);
                      setTimer(60);
                      setOtpSentTime(Math.floor(Date.now() / 1000));
                      handleLogin();
                    }}
                    className="explore-btn"
                    style={{ marginTop: 0 }}
                  >
                    Resend OTP
                  </button>
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
            Enter Your PinCode
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
