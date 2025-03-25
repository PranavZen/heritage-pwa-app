import {useSelector} from 'react-redux';

import {RootState} from './store';
import {StackNavigator} from './navigation/StackNavigator';

function App() {
  const color = useSelector((state: RootState) => state.bgSlice.color);
  return (
    <div
      id='app'
    >
      <StackNavigator />
    </div>
  );
}

export default App;
