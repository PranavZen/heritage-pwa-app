import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { components } from "../../components";
import { svg } from "../../assets/svg";
export const Notification: React.FC = () => {
  // const dispatch = hooks.useDispatch();

  // const [opacity, setOpacity] = useState<number>(0);
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // hooks.useScrollToTop();
  // hooks.useOpacity(setOpacity);
  // hooks.useThemeColor("#F6F9F9", "#F6F9F9", dispatch);

  // hooks.useGetNotifications();

  const fetchWalletBalance = async () => {
    const formData = new FormData();
    formData.append("c_id", localStorage.getItem("c_id") || "");

    try {
      const response = await fetch(
        "https://heritage.bizdel.in/app/consumer/services_v11/getWalletBalanceByCustomerId",
        {
          method: "POST",
          body: formData,
        }
      );

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
    alert("Navigating to wallet history");
    navigate("/wallet-history");
  };

  // Fetch wallet balance when component mounts
  useEffect(() => {
    fetchWalletBalance();
  }, []);

  const renderContent = (): JSX.Element => {
    if (loading) return <components.Loader />;

    return (
      <section className="walletSection">
        <div className="walletContainer">
          <h3>Wallet Balance Details</h3>
          <div className="topSection">
            <div className="waltLeftBox">
              <span>Add money to</span>
              <p>smart wallet</p>
            </div>
            <div className="waltRightBox">
              <span>
                <svg.WalletSvg />
              </span>
            </div>
          </div>
          <p className="walletBalanceText">
            Available Balance: <span>₹{walletData.wallet_balance}</span>
          </p>
          <div className="pointsWrap">
            <div className="pointsBox">
              <span className="spanSvgBox">
                <svg.DiamondSvg />
              </span>
              <div className="rightPart">
                <span>Rewards</span>
                <span>{walletData.reward_point}</span>
              </div>
            </div>
            <div className="pointsBox">
              <span className="spanSvgBox">
                <svg.TrophySvg />
              </span>
              <div className="rightPart">
                <span>Redeem Points</span>
                <span>{walletData.redeem_point}</span>
              </div>
            </div>
          </div>
          {/* <p>
            <strong>Subscription Block Amount:</strong> ₹
            {walletData.subscriptionBlockAmount}
          </p>
          <p>
            <strong>One-Time Orders Block Amount:</strong> ₹
            {walletData.OneTimeOrdersBlockAmount}
          </p>
          <p>
            <strong>Del Subscription Block Amount:</strong> ₹
            {walletData.DelSubscriptionBlockAmount}
          </p>
          <p>
            <strong>Block Amount:</strong> ₹{walletData.block_amount}
          </p>
          <p>
            <strong>Updated Wallet Amount:</strong> ₹
            {walletData.updatedWalletAmount}
          </p> */}
        </div>

        <button className="explore-btn" onClick={handleNavigateFunction}>
          <p> Wallet History </p>
        </button>
      </section>
    );
  };

  return <div id="screen">{renderContent()}</div>;
};
