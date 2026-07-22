import React from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BreatheLoader from '../components/BreatheLoader';

const { width } = Dimensions.get('window');

export default function Splash({ navigation }: any) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const checkSession = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setTimeout(() => {
          if (token) {
            navigation.replace('Dashboard');
          } else {
            navigation.replace('Login');
          }
        }, 3000);
      } catch (e) {
        setTimeout(() => navigation.replace('Login'), 3000);
      }
    };

    checkSession();
  }, [navigation, fadeAnim, scaleAnim, slideAnim]);

  return (
    <View style={styles.container}>
      {/* Background glow effects */}
      <View style={[styles.glow, { top: -100, left: -50, backgroundColor: 'rgba(255, 93, 56, 0.2)' }]} />
      <View style={[styles.glow, { bottom: -100, right: -50, backgroundColor: 'rgba(79, 70, 229, 0.2)' }]} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }, { translateY: slideAnim }] }]}>
        <View style={{ marginBottom: 24 }}>
          <BreatheLoader message="" />
        </View>
        <Text style={styles.title}>ClassTrack<Text style={styles.titleAccent}>.</Text></Text>
        <Text style={styles.subtitle}>SRI KRISHNA INSTITUTIONS</Text>
      </Animated.View>

      <ActivityIndicator style={styles.loader} size="large" color="#FF5D38" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A', // Ultra-premium deep dark blue
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    filter: 'blur(60px)',
  },
  content: {
    alignItems: 'center',
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#FF5D38',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#FF5D38',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
  },
  logoBadgeText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  titleAccent: {
    color: '#FF5D38',
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 12,
    fontWeight: '700',
    letterSpacing: 3,
  },
  loader: {
    position: 'absolute',
    bottom: 80,
  },
});
