import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { GlobalLoader, globalLoaderRef } from './src/components/GlobalLoader';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AppNavigator />
      <GlobalLoader ref={globalLoaderRef} />
    </SafeAreaProvider>
  );
}

export default App;
