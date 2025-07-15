import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { notification } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchRewards } from "../../store/rewardsSlice";
import type { RootState } from "../../store";
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
  const dispatch = useDispatch();
  const { rewards, error } = useSelector(
    (state: RootState) => state.rewards
  );
  const [spinData, setSpinData] = useState<SpinData | null>(null);
  const [userId] = useState<string>("123207");
  const [deg, setDeg] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rewardText, setRewardText] = useState<string>("NO");
  const [offerMessage, setOfferMessage] = useState<string>("Selected");
  const [idspin, setIdSpin] = useState<number>(1);
  const [showWheel, setShowWheel] = useState<boolean>(
    sessionStorage.getItem("spinStop") !== "true"
  );
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [countSpin, setCouponSpin] = useState<number>(0);
  const [betterluck, setBetterLuck] = useState<string>();
  const [counter, setCounter] = useState<number>(0);
  useEffect(() => {
    const rewardsCounter = async () => {
      try {
        const formData = new FormData()
        formData.append("user_id", localStorage.getItem("c_id") || "0");
        const { data } = await axios.post(
          'https://heritage.bizdel.in/app/consumer/services_v11/getAllSpinRewards',
          formData
        );
        if (data.success === true){
              setCounter(data.remaining_credits);
        }
      } catch (err: any) {
            // console.error('''')
      }
    }
    rewardsCounter();
  }, [isSpinning])

  useEffect(() => {
    if (!rewards || rewards.length === 0) {
      dispatch(fetchRewards() as any);
    }
  }, [dispatch, rewards.length]);

  useEffect(() => {
    if (error) {
      notification.error({
        message: "Error",
        description: error,
        duration: 3,
      });
    }
  }, [error]);

  const handleSpin = async () => {
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
        if (matchedRewardIndex === -1) throw new Error("Reward ID not found");
        const rewardTitle = rewards[matchedRewardIndex].title;
        setBetterLuck(rewardTitle)
        const stopAngle =
          360 - matchedRewardIndex * segmentAngle + segmentAngle / 2;
        const finalDeg = rounds * 360 + stopAngle + 720;
        setDeg(finalDeg);
        setCouponSpin(data.reward.spins_used)
        setIsSpinning(true);
        setTimeout(() => {
          setIsSpinning(false);
          setRewardText(rewardTitle);
          setOfferMessage(data.message || `You won: ${rewardTitle}`);
          setIsModalVisible(true);
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
          sessionStorage.setItem("spinStop", "true");
        }, 3000);
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
    if (String(betterluck) === 'Better Luck Next Time') {
      setIsModalVisible(false);
    } else {
      setIsModalVisible(false);
      setRewardText("NO");
      setShowWheel(false);
      sessionStorage.setItem("spinStop", "true");
    }
  };
  return (
    <>
      {showWheel && (
        <section id="spinWheelerSetion">
          <div className="spinnerInnerWrap">
            <div className={styles.container}>
              <div
                className={styles["close-btn"]}
                onClick={() => {
                  setShowWheel(false);
                  sessionStorage.setItem("spinStop", "true");
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
                    "#db7093",
                    "#20b2aa",
                    "#daa520",
                    "#4169e1",
                    "#ff6347",
                    "#adff2f",
                    "#f0e68c",
                    "#dda0dd",
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
          <div
            className={styles.spinCountBox}
          >
            <p style={{ margin: 0 }}>
              {countSpin ? `${countSpin} of ${counter}` : `${countSpin} of ${counter}`}
            </p>
          </div>
        </section>
      )}

      <div
        className={styles["result-modal"]}
        id="resultModal"
        style={{ display: isModalVisible ? "block" : "none" }}
      >
        <h1 id="rewardText">{rewardText}</h1>
        <p id="offerMessage">{offerMessage}</p>

        <button className={styles["done-btn"]} onClick={handleCloseModal}>
          {rewardText !== "Better Luck Next Time" ? <>Claim Now</> : <>Close</>}
        </button>
      </div>
    </>
  );
};
