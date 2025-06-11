import React, { useEffect, useState } from "react";
import axios from "axios";
import { notification } from "antd";
import styles from "./SpinTheWheel.module.scss";

interface Reward {
  id: string;
  title: string;
  is_active: string;
}

interface SpinData {
  spins_left: number;
  reward: {
    id: string;
    title: string;
  };
  message: string;
}

export const SpinTheWheel: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);



  const [spinData, setSpinData] = useState<SpinData | null>(null);
  const [userId] = useState<string>("123207");
  const [deg, setDeg] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rewardText, setRewardText] = useState<string>("NO");

  const [offerMessage, setOfferMessage] = useState<string>("Selected");
  const [idspin, setIdSpin] = useState<number>(1);
  const [showWheel, setShowWheel] = useState<boolean>(localStorage.getItem("spinStop") !== "true");

  // console.log("local sotage itmes", localStorage.getItem("spinStop"));
  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const response = await axios.get(
          "https://heritage.bizdel.in/app/consumer/services_v11/getAllSpinRewards"
        );
        if (response.data.success && Array.isArray(response.data.rewards)) {
          const activeRewards = response.data.rewards.filter(
            (reward: Reward) => reward.is_active === "1"
          );
          setRewards(activeRewards);
        }
      } catch (error) {
        console.error("Error fetching rewards:", error);
        notification.error({
          message: "Error",
          description: "Failed to fetch rewards. Please try again later.",
          duration: 3,
        });
      }
    };

    fetchRewards();
  }, []);

  const handleSpin = async () => {
    // if (isSpinning || rewards.length === 0 || spinData?.spins_left === 0) return;

    setIsSpinning(true);
    setDeg(0);
    try {
      const formData = new FormData();
      formData.append("user_id", localStorage.getItem("c_id") || "0");

      const response = await axios.post(
        "https://heritage.bizdel.in/app/consumer/services_v11/spinReward",
        formData
      );
      const data = response.data;

      if (data.success === true) {
        setSpinData(data);
        const totalSegments = rewards.length;
        const segmentAngle = 360 / totalSegments;
        const rounds = 6;
        const rewardId = data.reward.id;

        setIdSpin(rewardId);

        const matchedRewardIndex = rewards.findIndex((r) => r.id === rewardId);

        if (matchedRewardIndex === -1) {
          throw new Error("Reward ID not found in active rewards");
        }

        const rewardTitle = rewards[matchedRewardIndex].title;

        const stopAngle = 360 - matchedRewardIndex * segmentAngle + segmentAngle / 2;
        const finalDeg = rounds * 360 + stopAngle + 720;
        setDeg(finalDeg);

        setTimeout(() => {
          setIsSpinning(false);
          setRewardText(rewardTitle);
          setOfferMessage(data.message || `You won: ${rewardTitle}`);

          const confetti = document.createElement("div");
          confetti.className = styles.confetti;
          document.body.appendChild(confetti);
        }, 6200);
      } else if (data.success === false || data.show_spin === false) {
        notification.error({
          message: "Spin Failed",
          description: data.message,
          duration: 3,
        });

        setTimeout(() => {
          setShowWheel(false);
          localStorage.setItem("spinStop", "true");
        }, 6000);
      }
    } catch (error) {
      console.error("Spin error:", error);
      setIsSpinning(false);
      notification.error({
        message: "Error",
        description: "Something went wrong. Please try again.",
        duration: 3,
      });
    }
  };

  const handleCloseModal = () => {

    const modal = document.getElementById("resultModal");
    if (modal) modal.style.display = "none";
    setRewardText("NO");
    setShowWheel(false);
    localStorage.setItem("spinStop", "true");
    window.location.reload()
  };

  return (
    <>
      {showWheel && (
        <div className="spinnerInnerWrap">
          <div
            className={styles.container}>
            <div
              className={styles["close-btn"]}
              onClick={() => {
                setShowWheel(false);
                localStorage.setItem("spinStop", "true");
                 window.location.reload();
              }}
            >
              ✕
            </div>

            <button
              className={styles.spinBtn}
              onClick={handleSpin}
              disabled={isSpinning || spinData?.spins_left === 0}
            >
              {isSpinning ? "Spin" : "Spin"}
            </button>

            <div
              className={styles.wheel}
              style={{ transform: `rotate(${deg}deg)` }}
            >
              {rewards.map((reward, i) => {
                const angle = 360 / rewards.length;
                const rotation = angle * i;
                const color = [
                  "#db7093", "#20b2aa", "#daa520", "#4169e1",
                  "#ff6347", "#adff2f", "#f0e68c", "#dda0dd"
                ][i % 6];

                return (
                  <div
                    className={styles.number}
                    key={reward.id}
                    data-id={reward.id}
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      backgroundColor: color,
                      transformOrigin: "bottom right",
                    }}
                  >
                    <span>{reward.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <div
        className={styles["result-modal"]}
        id="resultModal"
        style={{ display: rewardText === "NO" ? "none" : "block" }}
      >
        <h1 id="rewardText">{rewardText}</h1>
        <p id="offerMessage">{offerMessage}</p>

       
            <button
              className={styles["done-btn"]}
              onClick={handleCloseModal}
            >
             {rewardText !== 'Better Luck Next Time' ? <>  Claim Now</>: <> Close</>}
            </button>
      </div>
    </>
  );
};
