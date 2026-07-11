import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Success() {
  return (
    <View style={styles.container}>
      <Text>Success Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
