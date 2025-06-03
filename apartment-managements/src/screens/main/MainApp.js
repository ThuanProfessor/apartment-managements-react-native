import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

const MainApp = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Main App!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default MainApp;
