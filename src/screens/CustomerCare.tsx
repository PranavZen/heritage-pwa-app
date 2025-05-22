import React, { useState } from 'react';
import axios from 'axios';
import { hooks } from '../hooks';
import { components } from '../components';
import { useLocation } from 'react-router-dom';
import { Modal, notification } from 'antd';
import { svg } from '../assets/svg';

export const CustomerCare: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();
  const location = useLocation();

  // console.log('Location state:', location.state);

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

  const c_id =localStorage.getItem('c_id');
  const handleSubmit = async (e: React.FormEvent) =>{
    if (!c_id){
      Modal.confirm({
        title: 'Please Sign In',
        content: 'You need to sign in to add items to your cart.',
        onOk() {
          navigate('/');
        },
        onCancel() { },
        cancelText: 'Cancel',
        okText: 'Sign In',
      });
      return;
    }


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
      // console.log('Ticket generation response:', response.data);
      if (response.data.status === 'success') {
        notification.success({ message: response.data.message });
      }
      else if (response.data.status === 'fail' && response.data.message === 'We already received your request, we are working on it.') {
        notification.success({ message: response.data.message });
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

    return (
      <main className="scrollable container">
        <section className='customer-care-section'>
          <div className="customer-care-header">
            <div className="customer-care-icon">
              <svg.PhoneSvg />
            </div>
            <div className="customer-care-title">
              <h2>How can we help you?</h2>
              <p>Select an option below or write your own message</p>
            </div>
          </div>

          <div className="customer-care-options">
            {/* Divs as clickable options */}
            <div
              className={`option-div ${message === 'I have not received this order' ? 'active' : ''}`}
              onClick={() => handleOptionClick('I have not received this order')}
            >
              <div className="option-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                </svg>
              </div>
              <span>I have not received this order</span>
            </div>
            <div
              className={`option-div ${message === 'Delivery got delayed' ? 'active' : ''}`}
              onClick={() => handleOptionClick('Delivery got delayed')}
            >
              <div className="option-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                  <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                </svg>
              </div>
              <span>Delivery got delayed</span>
            </div>
            <div
              className={`option-div ${message === 'Product got spoiled at the time of delivery' ? 'active' : ''}`}
              onClick={() => handleOptionClick('Product got spoiled at the time of delivery')}
            >
              <div className="option-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
              </div>
              <span>Product got spoiled at the time of delivery</span>
            </div>
          </div>

          <div className="customer-care-input">
            <div className="input-wrapper">
              <div className="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                </svg>
              </div>
              <input
                type="text"
                value={message}
                onChange={handleMessageChange}
                placeholder="Enter your message"
                className="message-input-box"
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <button
              className='cutomercare-submit-button'
              onClick={handleSubmit}
              disabled={loading}
            >
              <span>Submit</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
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
