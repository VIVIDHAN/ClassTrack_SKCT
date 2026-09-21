import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { withRepeat, withTiming, useSharedValue, useAnimatedStyle, Easing } from 'react-native-reanimated';
import { Colors } from '../constants/Colors';

export const globalLoaderRef = React.createRef<any>();

export const GlobalLoader = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(true);
  const scale = useSharedValue(1);

  useImperativeHandle(ref, () => ({
    show: () => setVisible(true),
    hide: () => setVisible(false)
  }));

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (visible) {
      scale.value = withRepeat(
        withTiming(1.15, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      scale.value = 1;
    }
  }, [scale, visible]);

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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  logo: {
    width: 240,
    height: 110,
  }
});

export const showLoader = () => globalLoaderRef.current?.show();
export const hideLoader = () => globalLoaderRef.current?.hide();
