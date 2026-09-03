import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import Animated, { withRepeat, withTiming, useSharedValue, useAnimatedStyle, Easing } from 'react-native-reanimated';

export const globalLoaderRef = React.createRef<any>();

export const GlobalLoader = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(true); // default true for initial app load
  const scale = useSharedValue(1);

  useImperativeHandle(ref, () => ({
    show: () => setVisible(true),
    hide: () => setVisible(false)
  }));

  useEffect(() => {
    // Hide initial splash after 2.5 seconds
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (visible) {
      scale.value = withRepeat(
        withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      scale.value = 1;
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Animated.Image 
        source={require('../assets/logo.png')}
        style={[styles.logo, animatedStyle]}
        resizeMode="contain"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  logo: {
    width: 250,
    height: 120,
  }
});

export const showLoader = () => globalLoaderRef.current?.show();
export const hideLoader = () => globalLoaderRef.current?.hide();
