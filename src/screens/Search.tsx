import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { hooks } from '../hooks';
import { components } from '../components';
import { Routes } from '../routes';

export const Search: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [opacity, setOpacity] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [dishes, setDishes] = useState<any[]>([]);  
  // console.log("qqqqqqqqqqqqqqqqq",dishes);
  const [dishesLoading, setDishesLoading] = useState<boolean>(false);

  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();


  const fetchDishes = async (searchQuery: string) => {
    // console.log("searchQuery",searchQuery)
    const formData = new FormData();
    formData.append('search_key', searchQuery);
    formData.append('city_id','325');
    setDishesLoading(true);
    try {

      const response = await axios.post('https://heritage.bizdel.in/app/consumer/services_v11/search',formData);

      console.log("responseresponseqqqqaaaqqaaaqaaaqqqqaaq",response);

      setDishes(response.data.search_data || []); 
    } catch (error) {
      console.error("Error fetching dishes:", error);
    } finally {
      setDishesLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      fetchDishes(searchQuery);
    } else {
      setDishes([]);  // Clear dishes if search query is empty
    }
  }, [searchQuery]);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor('#F6F9F9', '#F6F9F9', dispatch);

  const renderHeader = (): JSX.Element => {
    return (
      <components.Header
        title='Filter'
        showGoBack={true}
      />
    );
  };

  const renderSearch = (): JSX.Element => {
    return (
      <section style={{ borderBottom: '1px solid #DBE9F5' }}>
        <div
          style={{
            padding: 20,
            paddingTop: 6,
            gap: 20,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <input
            type='text'
            value={searchQuery}
            placeholder='Search for dishes'
            onChange={(event) => setSearchQuery(event.target.value)}
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: 10,
              backgroundColor: '#E9F3F6',
              color: 'var(--main-color)',
              border: 'none',
              fontSize: 16,
            }}
          />
          <span
            className='t16 clickable'
            onClick={() => navigate(-1)}
          >
            Cancel
          </span>
        </div>
      </section>
    );
  };

  const renderDishes = (): JSX.Element => {
    if (dishesLoading) return <components.Loader />;
    return (
      <section style={{ paddingTop: 14 }}>
        {dishes.map((dish) => {
          return (
            <button
              key={dish.id}
              
              onClick={() => {
                navigate(Routes.MenuList, { state: { id: dish.id }});
              }}
              
            >
              <div>
                <img src={dish.image} alt="" width={60} height={60} />
              </div>
              <span className='t16 number-of-lines-1'>{dish.name}</span>
            </button>
          );
        })}
      </section>
    );
  };

  const renderContent = (): JSX.Element => {
    return <main className='scrollable container'>{renderDishes()}</main>;
  };

  return (
    <div id='screen' style={{ opacity }}>
      {renderHeader()}
      {renderSearch()}
      {renderContent()}
    </div>
  );
};
