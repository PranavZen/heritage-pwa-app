import React, { useState, useEffect } from "react";
import { hooks } from "../hooks";
import { components } from "../components";
import axios from "axios";
import './WalletHistory.scss';

export const WalletHistory: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const [opacity, setOpacity] = useState<number>(0);
  const [walletData, setWalletData] = useState<any>(null);
  const [totalRewards, setTotalRewards] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const today = new Date().toISOString().split("T")[0];

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor("#F6F9F9", "#F6F9F9", dispatch);

  hooks.useGetNotifications();


  useEffect(() => {
    setStartDate(today);
    setEndDate(today);
  },[]);

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
        'https://heritage.bizdel.in/app/consumer/services_v11/getrewardtransactions',
        formData
      );
      setWalletData(response.data.transactions || []);
      setTotalRewards(response.data.total_earned_points || 0);
    
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
        <div className="walletHistoryContainer">
          <h1>Rewards Transaction History</h1>

          <div className="walletHistoryFilter-main">
            <div className="walletHistoryFilter">
              <div className="datePicker">
                <svg xmlns="http://www.w3.org/2000/svg" className="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <label>Start Date</label>
                <div className="dateInput">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleDateChange(e, "start")}
                    max={today}
                    aria-label="Select start date"
                  />
                </div>
              </div>
            </div>

            <div className="walletHistoryFilter">
              <div className="datePicker">
                <svg xmlns="http://www.w3.org/2000/svg" className="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <label>End Date</label>
                <div className="dateInput">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleDateChange(e, "end")}
                    min={startDate}
                    max={today}
                    aria-label="Select end date"
                  />
                </div>
              </div>
            </div>
          </div>

          <button onClick={fetchWalletHistory} className="explore-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Get History
          </button>

          <div className="walletHistoryContent">
            {loading ? (
              <div className="loader-container">
                <components.Loader />
              </div>
            ) : walletData && walletData.length > 0 ? (
              <ul className="walletHistoryList">
                {walletData.map((entry: any, index: number) => (
                  <li key={index}>
                    <div className="transaction-detail">
                      <div className="transaction-detail-child">
                        <div className="transaction-detail-wallet">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
                            <line x1="2" y1="10" x2="22" y2="10"></line>
                          </svg>
                          ₹ {totalRewards || 'N/A'}
                        </div>
                        <div>{entry.type}</div>
                        <div> + ₹ {entry.points}</div>
                      </div>

                      <div className="Transaction-main">
                        <p>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                          </svg>
                          Transaction ID: {entry.reference_id}
                        </p>
                        <p>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          Date: {entry.created_at}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="noHistoryMessage">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>No Rewards history available for the selected period.</p>
                <p>Try selecting a different date range.</p>
              </div>
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
