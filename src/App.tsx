import { useSelector } from 'react-redux';
import { RootState } from './store';
import { StackNavigator } from './navigation/StackNavigator';
import { useEffect } from 'react';
import Aos from 'aos';
import "aos/dist/aos.css";
import { Loader } from './components/Loader';

function App() {
  const color = useSelector((state: RootState) => state.bgSlice.color);

  useEffect(() => {
    Aos.init();
  }, []);

  return (
    <div id="app">
      <StackNavigator />
      {/* Global loader that will be shown/hidden based on Redux state */}
      <Loader />
    </div>
  );
}

export default App;
