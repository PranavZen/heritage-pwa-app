import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from './store/actions/useAppDispatch';
import { fetchWishlist } from './store/slices/wishlistSlice';
import { StackNavigator } from './navigation/StackNavigator';
import { RootState } from './store';

function App() {
  const dispatch = useAppDispatch();

  const wishlist = useSelector((state: RootState) => state.wishlistSlice);

  useEffect(() => {

    dispatch(fetchWishlist());

  }, [dispatch]);

  return (
    <div id="app">
      <StackNavigator />
    </div>
  );
}

export default App;
