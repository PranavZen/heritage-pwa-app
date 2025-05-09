import axios from 'axios';
import { useState, useEffect } from 'react';
import { URLS } from '../config'; 
import { MenuType } from '../types';

export const useGetMenu = (): { 
  menuLoading: boolean; 
  menu: MenuType[]; 
  menuLoadingBanner: boolean; 
  banner: MenuType[]; 
  selectedProductId: string | string[] | null;  
} => {
  const [menu, setMenu] = useState<MenuType[]>([]);
  const [banner, setBanner] = useState<MenuType[]>([]);
  const [menuLoading, setMenuLoading] = useState<boolean>(false);
  const [menuLoadingBanner, setMenuLoadingBanner] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<string | string[] | null>(null); 

  // console.log("Selected Product IDs:", selectedProductId);  

  const c_id = localStorage.getItem('c_id');
  const cityId = localStorage.getItem('cityId');

  const getMenu = async () => {
    setMenuLoading(true); 
    const formData = new FormData();
    formData.append('city_id', cityId || "null");
    formData.append('building_id', '2869');
    formData.append('c_id', c_id || 'null');
    formData.append('category_id', '31');
    formData.append('next_id', '0');
  
    try {
      const response = await axios.post(
        `https://heritage.bizdel.in/app/consumer/services_v11/productCategories`, 
        formData,
      );
      // console.log("Menu response:", response);  

      setMenu(response.data.productCategories);
      setBanner(response.data.banner);


      setSelectedProductId(response.data.productCategories.map((elem: any) => elem.product_id));

  
      // setSelectedProductId(response.data.productCategories[0]?.product_id || null);
      
    } catch (error) {
      console.error("Error fetching menu:", error);
    } finally {
      setMenuLoading(false);
    }
  };

  useEffect(() => {
    getMenu();
  }, []);

  return { menuLoading, menu, menuLoadingBanner, banner, selectedProductId };
};
