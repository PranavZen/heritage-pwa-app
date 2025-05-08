import {useSelector} from 'react-redux';

import {RootState} from './store';
import {StackNavigator} from './navigation/StackNavigator';
import { useEffect } from 'react';
import Aos from 'aos';
import "aos/dist/aos.css";
function App() {
  const color = useSelector((state: RootState) => state.bgSlice.color);
  useEffect(() => {
    Aos.init();
  }, []);
  return (
    <div id="app">
      <StackNavigator />
    </div>
  );
}

export default App;
