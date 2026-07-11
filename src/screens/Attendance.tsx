import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Attendance() {
  return (
    <View style={styles.container}>
      <Text>Attendance Screen</Text>
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
