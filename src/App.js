import * as React from 'react';
import RootNavigation from './navigation/RootNavigation';

if (__DEV__) {
  require('../ReactotronConfig');
}

function App() {
  return <RootNavigation />;
}

export default App;
