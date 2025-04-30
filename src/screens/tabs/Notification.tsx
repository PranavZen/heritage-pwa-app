import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { components } from "../../components";
import { svg } from "../../assets/svg";

export const Notification: React.FC = () => {
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [rewardPoints, setRewardPoints] = useState<number>(0);


  // console.log("rewardPointsrewardPoints", rewardPoints)
  const [redeemPoints, setRedeemPoints] = useState<number>(0);

  // console.log("redeemPoints", redeemPoints)
  const navigate = useNavigate();

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
    }
  };

  const fetchRewardTransactions = async () => {
    const formData = new FormData();
    formData.append("c_id", localStorage.getItem("c_id") || "");

    try {
      const response = await fetch(
        "https://heritage.bizdel.in/app/consumer/services_v11/getrewardtransactions",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (result.status === "success" && result.transactions) {
        let totalCredit = 0;
        let totalDebit = 0;

        result.transactions.forEach((txn: any) => {
          const points = parseInt(txn.points, 10);
          if (txn.type === "credit") totalCredit += points;
          else if (txn.type === "debit") totalDebit += points;
        });

        setRewardPoints(totalCredit);
        setRedeemPoints(totalDebit);
      } else {
        console.error("Failed to fetch reward transactions:", result.message);
      }
    } catch (error) {
      console.error("Error fetching reward transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateFunction = () => {
    navigate("/wallet-history");
  };

  useEffect(() => {
    fetchWalletBalance();
    fetchRewardTransactions();
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
            Available Balance: <span>₹{walletData?.wallet_balance || "0.00"}</span>
          </p>

          <div className="pointsWrap">
            <div className="pointsBox">
              <span className="spanSvgBox">
                <svg.DiamondSvg />
              </span>
              <div className="rightPart">
                <span>Rewards</span>
                <span>{rewardPoints}</span>
              </div>
            </div>

            <div className="pointsBox">
              <span className="spanSvgBox">
                <svg.TrophySvg />
              </span>
              <div className="rightPart">
                <span>Redeem Points</span>
                <span>{redeemPoints}</span>
              </div>
            </div>
          </div>
        </div>

        <button className="explore-btn" onClick={handleNavigateFunction}>
          <p> Wallet History </p>
        </button>
      </section>
    );
  };

  return <div id="screen">{renderContent()}</div>;
};
