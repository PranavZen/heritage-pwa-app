import React, {useState} from 'react';

import {hooks} from '../../hooks';
import {Routes} from '../../routes';
import {MenuType} from '../../types';
import '../../scss/menu.scss';

export const Menu: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();

  const {menuLoading, menu} = hooks.useGetMenu();

  // console.log("menumenumenuaaaaa",menu);

  const [opacity, setOpacity] = useState<number>(0);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor('#F6F9F9', '#F6F9F9', dispatch);

  const renderMenu = (): JSX.Element => {
    return (
      <section style={{paddingTop: 10}}>
        <div className='menuItemsWrap'>
          {menu.map((menuItem: MenuType) => (
            <div
              key={menuItem.id}
              className="innerMenu"
              onClick={() =>
                navigate(Routes.MenuList, {state: {menuName: menuItem.product_cat_id}})
              }
              role="button"
              aria-label={`View ${menuItem.name} menu`}
            >
              <img
                src={menuItem.image}
                alt={menuItem.name}
                className="itemImg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x150?text=No+Image';
                }}
              />
              <div className="home_product_category">
                {menuItem.name}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderContent = (): JSX.Element | null => {
    if (menuLoading && !menu.length) return null;
    return <main className='scrollable container'>{renderMenu()}</main>;
  };

  const renderLoader = (): JSX.Element | null => {
    if (!menuLoading) return null;

    return (
      <div className="menu-loading">
        <div className="loading-grid">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="loading-item" />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      id='screen'
      style={{opacity}}
    >
      {renderLoader()}
      {renderContent()}
    </div>
  );
};
