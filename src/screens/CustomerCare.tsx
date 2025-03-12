import React, { useState } from 'react';
import axios from 'axios';
import { hooks } from '../hooks';
import { components } from '../components';
import { useLocation } from 'react-router-dom';
import {notification} from 'antd'

export const CustomerCare: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();
  const location = useLocation();

  console.log('Location state:', location.state);

  const { notification_id } = location.state || {};
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [opacity, setOpacity] = useState<number>(0);
  const [message, setMessage] = useState<string>(''); 

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor('#F6F9F9', '#F6F9F9', dispatch);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value); 
  };

  const handleOptionClick = (message: string) => {
    setMessage(message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) {
      setError('Please enter a message or select an option');
      return;
    }

    setLoading(true);
    const cityId = localStorage.getItem('c_id');
    const questionId = 5; 
    const note = message; 

    const formData = new FormData();
    formData.append('cId', cityId || 'null');
    formData.append('questionId', String(questionId));
    formData.append('note', note);

    try {
      const response = await axios.post(
        'https://heritage.bizdel.in/app/consumer/services_v11/generateTicket',
        formData
      );
      console.log('Ticket generation response:', response.data);

      if (response.data.status === 'fail' && response.data.message === 'We already received your request, we are working on it.') {
        notification.success({message:response.data.message}); 
      } else {
        
        setNotifications([response.data]);
      }
    } catch (error) {
      setError('Failed to generate ticket.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = (): JSX.Element => {
    return <components.Header title="Customer Care" showGoBack={true} />;
  };

  const renderContent = (): JSX.Element => {
    if (loading) return <components.Loader />;
    if (error) return <p>{error}</p>;

    return (
      <main className="scrollable container">
        <section>
          {/* Divs as clickable options */}
          <div className="option-div" onClick={() => handleOptionClick('I have not received this order')}>
            I have not received this order
          </div>
          <div className="option-div" onClick={() => handleOptionClick('Delivery got delayed')}>
            Delivery got delayed
          </div>
          <div className="option-div" onClick={() => handleOptionClick('Product got spoiled at the time of delivery')}>
            Product got spoiled at the time of delivery
          </div>

          <input   
         
            type="text"
            value={message}
            onChange={handleMessageChange}
            placeholder="Enter your message"
            className="message-input-box"
          />
          <button 
          className='cutomercare-submit-button'
          onClick={handleSubmit} disabled={loading}>
            Submit
          </button>
        </section>
      </main>
    );
  };

  return (
    <div id="screen" style={{ opacity }}>
      {renderHeader()}
      {renderContent()}
    </div>
  );
};
