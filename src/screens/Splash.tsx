import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

export default function Splash({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Gentle logo breathing pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoPulse, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(logoPulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Session check and transition
    const checkSession = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setTimeout(() => {
          if (token) {
            navigation.replace('Dashboard');
          } else {
            navigation.replace('Login');
          }
        }, 2800);
      } catch (e) {
        setTimeout(() => navigation.replace('Login'), 2800);
      }
    };

    checkSession();
  }, [navigation, fadeAnim, scaleAnim, slideAnim, logoPulse]);

  return (
    <View style={styles.container}>
      {/* Dynamic Background Glows */}
      <View
        style={[
          styles.glow,
          {
            top: -height * 0.1,
            left: -width * 0.2,
            backgroundColor: 'rgba(255, 93, 56, 0.22)',
          },
        ]}
      />
      <View
        style={[
          styles.glow,
          {
            bottom: -height * 0.1,
            right: -width * 0.2,
            backgroundColor: 'rgba(59, 130, 246, 0.18)',
          },
        ]}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
          },
        ]}
      >
        {/* BIG HERO LOGO CONTAINER */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoPulse }],
            },
          ]}
        >
          <View style={styles.logoHalo} />
          <Image
            source={require('../assets/logo.png')}
            style={styles.heroLogo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Brand Titles */}
        <Text style={styles.title}>
          ClassTrack<Text style={styles.titleAccent}>.</Text>
        </Text>
        <Text style={styles.subtitle}>SRI KRISHNA COLLEGE OF TECHNOLOGY</Text>
        <View style={styles.taglineBadge}>
          <Text style={styles.taglineText}>Smart Attendance & Timetable Suite</Text>
        </View>
      </Animated.View>

      {/* Loading Indicator */}
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
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
    width: width * 1.1,
    height: width * 1.1,
    borderRadius: (width * 1.1) / 2,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoHalo: {
    position: 'absolute',
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor: 'rgba(255, 93, 56, 0.18)',
  },
  heroLogo: {
    width: width * 0.65,
    height: width * 0.65,
    maxWidth: 260,
    maxHeight: 260,
  },
  title: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  titleAccent: {
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 10,
    fontWeight: '800',
    letterSpacing: 2.5,
    textAlign: 'center',
  },
  taglineBadge: {
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  taglineText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footerLoader: {
    position: 'absolute',
    bottom: 65,
    alignItems: 'center',
  },
});
