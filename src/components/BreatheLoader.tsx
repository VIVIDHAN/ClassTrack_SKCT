import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence } from 'react-native-reanimated';
import { Colors } from '../constants/Colors';

interface BreatheLoaderProps {
  message?: string;
}

export default function BreatheLoader({ message = 'Loading...' }: BreatheLoaderProps) {
  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0.7);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.92, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.halo, animatedStyle]}>
        <Image 
          source={require('../assets/breathe-logo.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
      </Animated.View>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  halo: {
    padding: 16,
    borderRadius: 50,
    backgroundColor: Colors.primarySoft,
  },
  logo: {
    width: 72,
    height: 72,
  },
  message: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 14,
    letterSpacing: 0.3,
  },
});
