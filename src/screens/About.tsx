import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function About() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
      </View>
      <View style={styles.content}>
        <Animated.View entering={FadeInUp.duration(400)} style={styles.centerBox}>
          <View style={styles.logoBox}>
            <Icon name="school" size={64} color="#fff" />
          </View>
          <Text style={styles.appName}>ClassTrack</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          
          <Text style={styles.desc}>
            The premium attendance tracking solution built for modern educational institutions. 
            Streamline your workflow with instant SMS notifications and powerful dashboard insights.
          </Text>

          <View style={styles.devSection}>
            <Text style={styles.devHeader}>Developed By</Text>
            <Text style={styles.devNames}>Vividhan</Text>
            <Text style={styles.devNames}>Darshini</Text>
            <Text style={styles.devNames}>Sivakumar</Text>
            <Text style={styles.devNames}>Sudhan</Text>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2026 ClassTrack Technologies</Text>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { padding: 10, backgroundColor: Colors.background, borderRadius: 10, marginRight: 16, borderWidth: 1, borderColor: Colors.border },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.text },
  content: { flex: 1, padding: 32, justifyContent: 'center' },
  centerBox: { alignItems: 'center' },
  logoBox: { width: 120, height: 120, borderRadius: 32, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 24, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  appName: { fontSize: 32, fontWeight: '900', color: Colors.text, marginBottom: 8 },
  version: { fontSize: 16, fontWeight: '700', color: Colors.primary, marginBottom: 24 },
  desc: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', lineHeight: 26, marginBottom: 32 },
  devSection: { alignItems: 'center', backgroundColor: Colors.surface, padding: 20, borderRadius: 16, width: '100%', borderWidth: 1, borderColor: Colors.border },
  devHeader: { fontSize: 14, color: Colors.primary, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  devNames: { fontSize: 16, color: Colors.text, fontWeight: '700', marginBottom: 6 },
  footer: { marginTop: 32 },
  footerText: { fontSize: 14, color: '#94A3B8', fontWeight: '600' }
});
