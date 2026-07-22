import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Dimensions, ScrollView, KeyboardAvoidingView, Image } from 'react-native';
import Animated, { FadeInDown, FadeInUp, withRepeat, withTiming, useSharedValue, useAnimatedStyle, Easing } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../constants/Colors';
import { API_BASE_URL } from '../constants/Config';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// A pulsing background orb component
const BackgroundOrb = ({ color, size, top, left, delay }: any) => {
  const scale = useSharedValue(1);
  
  React.useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.2, { duration: 4000 + delay, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[
      styles.orb, 
      { backgroundColor: color, width: size, height: size, borderRadius: size / 2, top, left },
      animatedStyle
    ]} />
  );
};

export default function Login() {
  const navigation = useNavigation<any>();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const passwordRef = useRef<TextInput>(null);

  const [resetEmail, setResetEmail] = useState('');

  // Animation for flip card
  const flipValue = useSharedValue(0);

  const flipToBack = () => {
    flipValue.value = withTiming(180, { duration: 600, easing: Easing.inOut(Easing.cubic) });
  };

  const flipToFront = () => {
    flipValue.value = withTiming(0, { duration: 600, easing: Easing.inOut(Easing.cubic) });
  };

  const frontStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${flipValue.value}deg` }
      ],
      backfaceVisibility: 'hidden',
      zIndex: flipValue.value < 90 ? 1 : 0,
      opacity: flipValue.value < 90 ? 1 : 0,
    };
  });

  const backStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${flipValue.value - 180}deg` }
      ],
      backfaceVisibility: 'hidden',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: flipValue.value >= 90 ? 1 : 0,
      opacity: flipValue.value >= 90 ? 1 : 0,
    };
  });

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Please enter your email and password');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await response.json();
      
      if (data.success) {
        await AsyncStorage.setItem('userToken', 'logged_in_token');
        await AsyncStorage.setItem('teacherProfile', JSON.stringify(data.user));
        navigation.replace('Dashboard');
      } else {
        setErrorMsg(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setErrorMsg('Network error. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = () => {
    flipToFront();
    // Simulate sending email logic
  };

  const currentYear = new Date().getFullYear();

  return (
    <View style={styles.container}>
      <BackgroundOrb color="rgba(255, 93, 56, 0.12)" size={width * 1.2} top={-height * 0.2} left={-width * 0.2} delay={0} />
      <BackgroundOrb color="rgba(66, 133, 244, 0.1)" size={width * 0.8} top={height * 0.5} left={width * 0.4} delay={1000} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <Animated.View entering={FadeInDown.delay(200).duration(800).springify()} style={styles.headerContainer}>
            <Image 
              source={require('../assets/logo.png')} 
              style={styles.logoImage} 
              resizeMode="contain" 
            />
            <Text style={styles.title}>ClassTrack</Text>
          </Animated.View>

          <View style={{ minHeight: 400 }}>
            {/* FRONT CARD: LOGIN */}
            <Animated.View style={[styles.card, frontStyle]}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput 
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Password</Text>
                  <TouchableOpacity activeOpacity={0.7} onPress={flipToBack}>
                    <Text style={styles.forgotPassword}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>
                <View>
                  <TextInput 
                    ref={passwordRef}
                    style={[styles.input, { paddingRight: 50 }]}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon} 
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Icon name={showPassword ? "visibility" : "visibility-off"} size={24} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ height: 16, alignItems: 'center' }}>
                {errorMsg ? <Text style={{color: '#EF4444', fontSize: 13, fontWeight: '600'}}>{errorMsg}</Text> : null}
              </View>

              <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.8} disabled={loading}>
                <Text style={styles.loginButtonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
              </TouchableOpacity>

              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>By signing in, you agree to our </Text>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.termsLink}>Terms and Conditions</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* BACK CARD: FORGOT PASSWORD */}
            <Animated.View style={[styles.card, backStyle]}>
              <Text style={styles.backCardTitle}>Reset Password</Text>
              <Text style={styles.backCardSubtitle}>Enter your email and we will send you a reset link.</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput 
                  style={styles.input}
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="done"
                />
              </View>

              <View style={{ height: 20 }} />

              <TouchableOpacity style={styles.loginButton} onPress={handlePasswordReset} activeOpacity={0.8}>
                <Text style={styles.loginButtonText}>Request Password Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backToLoginButton} onPress={flipToFront} activeOpacity={0.7}>
                <Text style={styles.backToLoginText}>Back to Sign In</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <Animated.View entering={FadeInUp.delay(600).duration(800).springify()} style={styles.footer}>
            <Text style={styles.footerText}>© {currentYear} ClassTrack. All rights reserved.</Text>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    zIndex: 1,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 200,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -1,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 28,
    padding: 28,
    paddingVertical: 44,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.06,
    shadowRadius: 32,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
  },
  backCardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  backCardSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  forgotPassword: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F1F5F9', 
    borderRadius: 16,
    paddingVertical: 16, 
    paddingHorizontal: 18,
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '500',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  eyeIcon: {
    position: 'absolute',
    right: 18,
    top: 18,
  },
  eyeImage: {
    width: 20,
    height: 20,
    opacity: 0.5,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  backToLoginButton: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },
  backToLoginText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  termsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    flexWrap: 'wrap',
  },
  termsText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '400',
  },
  termsLink: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
  }
});
