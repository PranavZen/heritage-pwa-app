import React from 'react';
import { components } from "../components";
import { hooks } from '../hooks';
import { Routes } from "../routes";
import './ThankYouPage.scss'; // Make sure to import the SCSS file

const ThankYouPage: React.FC = () => {
  const message = "Your order has been successfully placed. We'll notify you once it's shipped.";
 
 
  const navigate = hooks.useNavigate();

  const renderHeader = (): JSX.Element => {
    return (
      <components.Header
        showGoBack={true}
        showBasket={true}/>
    );
  };

  return (

    <>  {renderHeader()}
    <div className="thank-you-page">
     
      <div className="thank-you-message">
        <p>{message}</p>
      </div>
      <div className="order-summary">

        <p>We appreciate your business and will process your order soon.</p>
      </div>
      <button onClick={() => navigate('/your-order')} className="back-home-button">
        Back to your-order
      </button>
    </div>
  </>

  );
}

export default ThankYouPage;
