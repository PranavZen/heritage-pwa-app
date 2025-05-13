import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Routes } from "../routes";
import "./onboarding.css";
import { components } from "../components";

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [pincode, setPincode] = useState<string>("");

  const handlePincodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPincode(event.target.value);
  };

  const handleContinue = async () => {
    if (pincode.trim().length !== 6) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }

    try {
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

      console.log("wwwwwww", data)

      if (
        data.status === "success" &&
        data.search_data?.[0]?.is_servicesable === "1"
      ) {
        const { city_id } = data.search_data[0];
        localStorage.setItem("cityId", city_id);
        navigate(Routes.TabNavigator);
      } else {
        alert("Pincode not serviceable. Please try a different one.");
      }
    } catch (error) {
      console.error("Pincode verification failed:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  const renderHeader = (): JSX.Element => {
    return <components.Header title="Back" showGoBack={true} />;
  };

  return (
    <div id="screen">
      {renderHeader()}
      <section className="scrollable">
        <div className="container">
          <h2>Enter Your Pincode</h2>
          <input
            type="text"
            value={pincode}
            onChange={handlePincodeChange}
            placeholder="Enter 6-digit pincode"
            maxLength={6}
            className="search-input"
          />
          <button className="continue-btn" onClick={handleContinue}>
            Continue
          </button>
        </div>
      </section>
    </div>
  );
};
export {};
