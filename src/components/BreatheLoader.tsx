import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence } from 'react-native-reanimated';

interface BreatheLoaderProps {
  message?: string;
}

export default function BreatheLoader({ message = 'Loading...' }: BreatheLoaderProps) {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.9, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // Infinite repeat
      true
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.6, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
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
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 10,
    letterSpacing: 0.5,
  },
});
