import React, {useState} from 'react';

import {hooks} from '../../hooks';
import {Routes} from '../../routes';
import {MenuType} from '../../types';
import {components} from '../../components';

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
        <ul
          className='menuItemsWrap'
        >
          {menu.map((menu: MenuType, index: number, array: MenuType[]) => {
            return (
              <li
                key={menu.id}
                className="itemWrap innerMenu"
                onClick={() =>
                  navigate(Routes.MenuList, {state: {menuName: menu.product_cat_id}})
                }
              >   
                <img
                  src={menu.image}
                  alt={menu.name}
                  className="itemImg"
                />
               <span
                    className="home_product_category"
                  >
                    {menu.name}
                  </span>
              </li>
            );
          })}
        </ul>
      </section>
    );
  };

  const renderContent = (): JSX.Element | null => {
    if (menuLoading && !menu.length) return null;
    return <main className='scrollable container'>{renderMenu()}</main>;
  };

  const renderLoader = (): JSX.Element | null => {
    if (menuLoading) return <components.Loader />;
    return null;
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
