import React, { useState, useEffect } from "react";
import { hooks } from "../hooks";
import { svg } from "../assets/svg";
import { components } from "../components";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const WalletHistory: React.FC = () => {
  const dispatch = hooks.useDispatch();

  const [opacity, setOpacity] = useState<number>(0);
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [nextId, setNextId] = useState<number>(0);
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor("#F6F9F9", "#F6F9F9", dispatch);

  hooks.useGetNotifications();

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
    formData.append('c_id', localStorage.getItem('c_id')|| '');
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
    // if (loading) return <components.Loader />;
    return (
      <>
        <div>
          <h1>Wallet History</h1>
          <div>
            <label>Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleDateChange(e, 'start')}
              max={today} 
            />
          </div>

          <div>
            <label>End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleDateChange(e, 'end')}
              min={startDate} 
              max={today} 
            />
          </div>

          <button onClick={fetchWalletHistory}>Get History</button>
          <div>
            {walletData && walletData.length > 0 ? (
              <ul>
                {walletData.map((entry: any, index: number) => (
                  <li key={index}>
                    <p><strong>Transaction ID:</strong> {entry.id}</p>
                    <p><strong>Amount:</strong> {entry.amount}</p>
                    <p><strong>Payment Type:</strong> {entry.payment_type}</p>
                    <p><strong>Payment Method:</strong> {entry.payment_method}</p>
                    <p><strong>Wallet Balance:</strong> {entry.wallet_balance}</p>
                    <p><strong>Payment Date:</strong> {entry.payment_date}</p>
                    <p><strong>Status:</strong> {entry.status}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No wallet history available for the selected period.</p>
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
