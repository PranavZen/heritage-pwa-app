import React, { useState, useEffect } from "react";
import { hooks } from "../hooks";
import { svg } from "../assets/svg";
import { components } from "../components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ReactComponent as CalendarIcon } from '../assets/svg/calendar (1).svg';
import { ReactComponent as WalletIcon } from '../assets/icons/wallet.svg'

import './WalletHistory.scss';

export const WalletHistory: React.FC = () => {
  const dispatch = hooks.useDispatch();

  const [opacity, setOpacity] = useState<number>(0);
  const [walletData, setWalletData] = useState<any>(null);

  // console.log("qqqqqqqqqqq", walletData);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [nextId, setNextId] = useState<number>(0);
  const navigate = useNavigate();


  const today = new Date().toISOString().split("T")[0];

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor("#F6F9F9", "#F6F9F9", dispatch);

  hooks.useGetNotifications();


  useEffect(() => {
    setStartDate(today);
    setEndDate(today);
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (type === 'start') {
      setStartDate(e.target.value);
    } else {
      setEndDate(e.target.value);
    }
  };

  const fetchWalletHistory = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('c_id', localStorage.getItem('c_id') || '');
    formData.append('start_date', startDate);
    formData.append('end_date', endDate || '');
    formData.append('next_id', String(0));
    try {
      const response = await axios.post(
        'https://heritage.bizdel.in/app/consumer/services_v11/getWalletHistoryByCustomerId',
        formData
      );
      setWalletData(response.data.walletHistoryDetails);
    } catch (error) {
      console.error('Error fetching wallet history', error);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = (): JSX.Element => {
    return (
      <components.Header showGoBack={true} showBasket={true} />
    );
  };

  const renderContent = (): JSX.Element => {
    return (
      <>
        <div>
          <h1 style={{ textAlign: "center", padding: "10px" }}>Wallet History</h1>

          <div className="walletHistoryFilter-main">


            <div className="walletHistoryFilter">
              <div className="datePicker">
                <CalendarIcon className="calendar-icon" />

                <label>Start Date</label>
                <div className="dateInput">

                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleDateChange(e, "start")}
                    max={today}
                  />
                </div>
              </div>
            </div>

            <div className="walletHistoryFilter">
              <div className="datePicker">
                <CalendarIcon className="calendar-icon" />
                <label>End Date</label>
                <div className="dateInput">
                  {/* <FaCalendarAlt className="calendarIcon" /> */}
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleDateChange(e, "end")}
                    min={startDate}
                    max={today}
                  />
                </div>
              </div>
            </div>
          </div>
          <button onClick={fetchWalletHistory} className="explore-btn ">Get History</button>
          <div className="walletHistoryContent">
            {walletData && walletData.length > 0 ? (
              <ul className="walletHistoryList">
                {walletData.map((entry: any, index: number) => (
                  <li key={index}>
                    <div className="transaction-detail">
                      <div className="transaction-detail-child">
                        <div className="transaction-detail-wallet">  <span> ₹ {entry?.wallet_balance || 'N/A'}</span>  </div>
                        <div> {entry.status} </div>
                        <div>  {entry.payment_type} + ₹ {entry.amount} </div>
                      </div>

                      <div className="Transaction-main">
                        <p>Transaction Id: {entry.order_id}</p>
                          
                        <p>Date: {entry.payment_date}</p>
                      </div>


                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="noHistoryMessage">No wallet history available for the selected period.</p>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div id="screen" style={{ opacity }}>
      {renderHeader()}
      {renderContent()}
    </div>
  );
};
