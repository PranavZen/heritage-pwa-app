import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { useAppDispatch } from './store/actions/useAppDispatch';
import { fetchWishlist } from './store/slices/wishlistSlice';
import { StackNavigator } from './navigation/StackNavigator';
import { RootState } from './store';

import { Loader } from './components/Loader';
import { AppRouter } from './navigation/AppRouter';

import AOS from 'aos';

function App() {
  const dispatch = useAppDispatch();

  const wishlist = useSelector((state: RootState) => state.wishlistSlice);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

   useEffect(() => {
    AOS.init();
  }, []);

  return (
    <div id="app">

      <StackNavigator />
        <Loader />

    </div>
  );
}

export default App;
