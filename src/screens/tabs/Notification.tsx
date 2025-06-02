import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { components } from "../../components";
import axios from "axios";
export const Notification: React.FC = () => {
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [rewardPoints, setRewardPoints] = useState<number>(0);
  const [getrewardbalance, setGetrewardBalance] = useState<any[]>([]);
  const [redeemPoints, setRedeemPoints] = useState<number>(0);
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
        // console.error("Failed to fetch wallet data:", data.message);
      }
    } catch (error) {
      // console.error("Error fetching wallet data:", error);
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
    navigate("/transaction-history");
  };

  useEffect(() => {
    fetchWalletBalance();
    fetchRewardTransactions();
  }, []);


  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const formData = new FormData();
        formData.append("c_id", localStorage.getItem('c_id') || '');
        // formData.append("c_id",  '123207');
        formData.append("city_id", localStorage.getItem('cityId') || '')
        formData.append("area_id", localStorage.getItem('area_id') || '');
        formData.append('next_id', '0');

        const response = await axios.post(
          'https://heritage.bizdel.in/app/consumer/services_v11/getrewardbalance',
          formData
        );
      
        if (response.data.status === "success") {
          setGetrewardBalance(response.data.points);
          localStorage.setItem("reward_balance", response.data.points);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching coupons:', error);
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);






  const renderContent = (): JSX.Element => {
    if (loading) return (
      <div className="loader-container">
        <components.Loader />
      </div>
    );

    return (
      <section className="walletSection">
        <div className="walletContainer">
          <h3>Reward & Redeem Balance </h3>

          {/* <div className="topSection">
            <div className="waltLeftBox">
              <span>Add money to</span>
              <p>smart wallet</p>
            </div>
            <div className="waltRightBox">
              <span>
                <svg.WalletSvg />
              </span>
            </div>
          </div> */}

          {/* <div className="walletBalanceText">
            Available Balance
            <span>₹{walletData?.wallet_balance || "0.00"}</span>
          </div> */}

          <div className="pointsWrap">
            <div className="pointsBox">
              <span className="spanSvgBox">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M12,2l3.09,6.26L22,9.27l-5,4.87,1.18,6.88L12,17.77l-6.18,3.25L7,14.14,2,9.27l6.91-1.01L12,2z" />
                </svg>
              </span>
              <div className="rightPart">
                <span>Rewards</span>
                <span>{getrewardbalance}</span>
              </div>
            </div>

            <div className="pointsBox">
              <span className="spanSvgBox">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M19,5h-2V3H7v2H5C3.9,5,3,5.9,3,7v1c0,2.55,1.92,4.63,4.39,4.94c0.63,1.5,1.98,2.63,3.61,2.96V19H7v2h10v-2h-4v-3.1 c1.63-0.33,2.98-1.46,3.61-2.96C19.08,12.63,21,10.55,21,8V7C21,5.9,20.1,5,19,5z M5,8V7h2v3.82C5.84,10.4,5,9.3,5,8z M19,8 c0,1.3-0.84,2.4-2,2.82V7h2V8z" />
                </svg>
              </span>
              <div className="rightPart">
                <span>Redeem Points</span>
                <span>{redeemPoints}</span>
              </div>
            </div>
          </div>
        </div>

        <button className="explore-btn" onClick={handleNavigateFunction}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12h18M16 5l7 7-7 7" />
          </svg>
          Rewards History
        </button>

      </section>
    );
  };

  return <div id="screen">{renderContent()}</div>;
};
