import React, { useState, useEffect } from "react";
import { hooks } from "../../hooks";
import { svg } from "../../assets/svg";
import { components } from "../../components";
import { useNavigate } from "react-router-dom";

export const Notification: React.FC = () => {
  const dispatch = hooks.useDispatch();

  const [opacity, setOpacity] = useState<number>(0);
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor("#F6F9F9", "#F6F9F9", dispatch);

  hooks.useGetNotifications();

  const fetchWalletBalance = async () => {
    const formData = new FormData();
    formData.append('c_id', localStorage.getItem('c_id') || '');

    try {
      const response = await fetch("https://heritage.bizdel.in/app/consumer/services_v11/getWalletBalanceByCustomerId", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.status === "success") {
        setWalletData(data);
      } else {
        console.error("Failed to fetch wallet data:", data.message);
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleNavigateFunction = () => {
    alert('Navigating to wallet history');  
    navigate("/wallet-history"); 
};


  // Fetch wallet balance when component mounts
  useEffect(() => {
    fetchWalletBalance();
  }, []);

  const renderContent = (): JSX.Element => {
    if (loading) return <components.Loader />;

    return (
      <>
        <div>
          <h3>Wallet Balance Details</h3>
          <p><strong>Wallet Balance:</strong> ₹{walletData.wallet_balance}</p>
          <p><strong>Subscription Block Amount:</strong> ₹{walletData.subscriptionBlockAmount}</p>
          <p><strong>One-Time Orders Block Amount:</strong> ₹{walletData.OneTimeOrdersBlockAmount}</p>
          <p><strong>Del Subscription Block Amount:</strong> ₹{walletData.DelSubscriptionBlockAmount}</p>
          <p><strong>Block Amount:</strong> ₹{walletData.block_amount}</p>
          <p><strong>Updated Wallet Amount:</strong> ₹{walletData.updatedWalletAmount}</p>
          <p><strong>Reward Points:</strong> {walletData.reward_point}</p>
          <p><strong>Redeem Points:</strong> {walletData.redeem_point}</p>
        </div>
    
        <button className="explore-btn"  
        onClick={handleNavigateFunction} 
        >
          <p> Wallet History </p>
        </button>
      </>
    );
  };

  return (
    <div id="screen" style={{ opacity }}>
      {renderContent()}
    </div>
  );
};
