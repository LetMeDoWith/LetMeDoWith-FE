import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { Login } from 'screens/Login';
import { BottomTabNavigator } from 'components/navigators/BottomTabNavigator';
import { ThemeContext } from 'hooks/shared/useTheme';
import { theme } from 'styles/theme';
import { Signup } from 'screens/Signup';

function App(): React.JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [isNeedSignUp] = useState<boolean>(true);

  return (
    <ThemeContext.Provider value={theme}>
      <SafeAreaView style={styles.container}>
        {isLoggedIn ? (
          <NavigationContainer>{isNeedSignUp ? <Signup /> : <BottomTabNavigator />}</NavigationContainer>
        ) : (
          <Login setIsLoggedIn={setIsLoggedIn} />
        )}
      </SafeAreaView>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default App;
