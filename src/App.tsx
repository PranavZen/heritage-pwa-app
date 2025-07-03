import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from './store/actions/useAppDispatch';
import { fetchWishlist } from './store/slices/wishlistSlice';
import { RootState } from './store';
import { Loader } from './components/Loader';

import AOS from 'aos';
import { AppRouter } from './navigation/AppRouter';

function App() {
  const dispatch = useAppDispatch();

  const wishlist = useSelector((state: RootState) => state.wishlistSlice);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

   useEffect(() => {
    AOS.init();
  }, []);

  useEffect(() => {
  // Clear session storage or specific items
  sessionStorage.clear(); // or
  sessionStorage.removeItem('spinStop');
  // localStorage.removeItem('authToken'); // if needed
}, []);

  return (
    <div id="app">
      <AppRouter />
      <Loader />
     
    </div>
  );
}

export default App;
