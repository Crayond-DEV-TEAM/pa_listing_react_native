// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  * @flow
//  */


// App.jsx
import React from 'react';
import WebScreen from "./src/screen/webScreen";
import { Platform } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
const App = () => {

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      // eslint-disable-next-line no-undef
      SplashScreen.hide();
    }
  }, []);
  return (
    <WebScreen />
  );
};

export default App;