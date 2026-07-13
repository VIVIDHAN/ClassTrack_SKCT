import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Dimensions, ScrollView, KeyboardAvoidingView } from 'react-native';
import Animated, { FadeInDown, FadeInUp, withRepeat, withTiming, useSharedValue, useAnimatedStyle, Easing } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { Colors } from '../constants/Colors';
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
  const passwordRef = useRef<TextInput>(null);

  const handleLogin = () => {
    navigation.replace('MainTabs');
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Background */}
      <BackgroundOrb color="rgba(255, 93, 56, 0.12)" size={width * 1.2} top={-height * 0.2} left={-width * 0.2} delay={0} />
      <BackgroundOrb color="rgba(66, 133, 244, 0.1)" size={width * 0.8} top={height * 0.5} left={width * 0.4} delay={1000} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInDown.delay(200).duration(800).springify()} style={styles.headerContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>📚</Text>
            </View>
            <Text style={styles.title}>ClassTrack</Text>
            <Text style={styles.subtitle}>Welcome back, Professor</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400).duration(800).springify()} style={styles.card}>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput 
                style={styles.input}
                placeholder="faculty@gmail.com"
                placeholderTextColor="#94A3B8"
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
            <Text style={styles.label}>Password</Text>
            <View>
              <TextInput 
                ref={passwordRef}
                style={[styles.input, { paddingRight: 50 }]}
                placeholder="123456"
                placeholderTextColor="#94A3B8"
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
                <Icon name={showPassword ? "eye" : "eye-off"} size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 16 }} />

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.8}>
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
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
    marginBottom: 48,
  },
  logoBadge: {
    width: 72,
    height: 72,
    backgroundColor: '#ffffff',
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
    marginBottom: 20,
  },
  logoIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    padding: 24,
    paddingVertical: 48,
    marginHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  inputContainer: {
    marginBottom: 24,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  eyeText: {
    fontSize: 18, 
  },
  label: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#F1F5F9', 
    borderRadius: 16,
    paddingVertical: 14, 
    paddingHorizontal: 16,
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '500',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
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
    fontWeight: '800',
    letterSpacing: 1,
  },
});
