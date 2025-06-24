import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { TabScreens } from '../routes';
import { components } from '../components';
import { Home } from '../screens/tabs/Home';
import { Menu } from '../screens/tabs/Menu';
import { Favorite } from '../screens/tabs/Favorite';
import { Notification } from '../screens/tabs/Notification';
import { SubscriptionOrder } from '../screens/tabs/SubscriptionOrder';
import { actions } from '../store/actions';
import {Order} from '../screens/tabs/Order';
import { useNavigate } from 'react-router-dom';
import {Offer} from '../screens/tabs/Offer';

export const TabNavigator: React.FC = () => {
  const navigate=useNavigate();
  const dispatch = useDispatch();
  const currentTabScreen = useSelector(
    (state: RootState) => state.tabSlice.screen,
  );

  useEffect(() => {
    const savedScreen = localStorage.getItem('curScreen');
    if (!savedScreen || !Object.values(TabScreens).includes(savedScreen as TabScreens)) {
      dispatch(actions.setScreen(TabScreens.Home));
    }
  }, [dispatch]);

  const renderTitle = (): string => {
    switch (currentTabScreen) {
      case TabScreens.Home:
      case TabScreens.Menu:
      case TabScreens.Subscription:
        return '';
      case TabScreens.Order:
        return 'Order';
      case TabScreens.Favorite:
        return 'Favorite';
      case TabScreens.Notification:
        return 'Wallet';
      case TabScreens.Offer:
        return 'Offer';
      default:
        return 'Home';
    }
  };

  const renderScreens = (): JSX.Element | null => {
    switch (currentTabScreen) {
      case TabScreens.Home:
        return <Home/>;
      case TabScreens.Menu:
        return <Menu />;
      case TabScreens.Subscription:
        return <SubscriptionOrder/>;
      case TabScreens.Order:
        return <Order/>;
      case TabScreens.Favorite:
        return <Favorite/>;
      case TabScreens.Notification:
        return <Notification />;
      case TabScreens.Offer:
        return <Offer />;
      default:
        return <Home/>;
    }
  };

  const renderUserPhoto = (): boolean => {
    switch (currentTabScreen) {
      case TabScreens.Home:
      case TabScreens.Menu:
      case TabScreens.Subscription:
      case TabScreens.Order:
      case TabScreens.Favorite:
      case TabScreens.Notification:
      case TabScreens.Offer:
        return true;
      default:
        return false;
    }
  };

  const renderUserName = (): boolean => {
    switch (currentTabScreen) {
      case TabScreens.Home:
      case TabScreens.Menu:
      case TabScreens.Subscription:
        return true;
      case TabScreens.Order:
      case TabScreens.Favorite:
      case TabScreens.Notification:
      case TabScreens.Offer:
        return false;
      default:
        return false;
    }
  };

  const renderHeader = (): JSX.Element => {
    return (
      <components.Header
        showBasket={true}
        title={renderTitle()}
        userName={renderUserName()}
        userPhoto={renderUserPhoto()}
      />
    );
  };

  const renderFooter = (): JSX.Element | null => {
    return <components.Footer />;
  };

  return (
    <div className="page-with-footer">
      {renderHeader()}
      <div className="tab-content" tabIndex={-1}>
        {renderScreens()}
      </div>
      {renderFooter()}
    </div>
  );
};