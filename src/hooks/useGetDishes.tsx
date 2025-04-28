import axios from 'axios';
import {useState, useEffect} from 'react';
import {URLS} from '../config';
import {DishType} from '../types';

export const useGetDishes = (categoryId?: string) => {
  // console.log("categoryIdcategoryIdpppppppp",categoryId);
  const [dishes, setDishes] = useState<DishType[]>([]);
  const [dishesLoading, setDishesLoading] = useState<boolean>(false);

  // console.log("bbbbbbbbbbbbbbbbbbbbbbbb",dishes);

  const c_id = localStorage.getItem('c_id');
  const cityId = localStorage.getItem('cityId');

  const getDishes = async () => {
    setDishesLoading(true);
    const formData = new FormData();
    formData.append('city_id', cityId  || 'null');
    formData.append('building_id', '980');
    formData.append('c_id',  c_id  || 'null');
    formData.append('category_id', categoryId || '28');
    formData.append('next_id', '0');

    try {
      const response = await axios.post(`https://heritage.bizdel.in/app/consumer/services_v11/productOptionByCategory`,
        formData
      );
      // console.log("222222222222222",response);

      setDishes(response.data?.optionListing);
    } catch (error) {
      console.error(error);
    } finally {
      setDishesLoading(false);
    }
  };

  useEffect(() => {
    getDishes();
  }, []);

  return {dishesLoading, dishes};
};
