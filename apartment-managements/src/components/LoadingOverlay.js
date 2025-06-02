import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Portal, Surface, Text } from 'react-native-paper';

const LoadingOverlay = ({ visible = false, message = 'Đang tải...' }) => {
  if (!visible) return null;

  return (
    <Portal>
      <View style={styles.container}>
        <Surface style={styles.surface} elevation={5}>
          <ActivityIndicator animating={true} size="large" color="#2196F3" />
          <Text style={styles.message}>{message}</Text>
        </Surface>
      </View>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  surface: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default LoadingOverlay;
