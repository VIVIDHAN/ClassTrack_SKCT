import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { Colors } from '../constants/Colors';

export default function Success() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={ZoomIn.duration(600)} style={styles.iconContainer}>
        <Text style={styles.checkIcon}>✓</Text>
      </Animated.View>
      
      <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.textContainer}>
        <Text style={styles.title}>Attendance Saved!</Text>
        <Text style={styles.subtitle}>SMS notifications have been successfully sent to the parents of all absent students.</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.buttonWrapper}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('MainTabs')}
        >
          <Text style={styles.buttonText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#dcfce7', // Very light green
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 4,
    borderColor: Colors.success,
  },
  checkIcon: {
    fontSize: 72,
    color: Colors.success,
    fontWeight: '900',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
  },
  buttonWrapper: {
    width: '100%', 
    paddingHorizontal: 32,
    position: 'absolute',
    bottom: 40,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  }
});
