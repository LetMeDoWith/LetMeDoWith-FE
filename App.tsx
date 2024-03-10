import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

// import { Login } from '@screens/Login';
import { BottomTabNavigator } from 'components/navigators/BottomTabNavigator';

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      {/*<Login />*/}
      <NavigationContainer>
        <BottomTabNavigator />
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default App;
