import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import Animated, { FadeInUp } from 'react-native-reanimated';
import BreatheLoader from '../components/BreatheLoader';

export default function Settings() {
  const navigation = useNavigation<any>();
  
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 600);
      return () => clearTimeout(timer);
    }, [])
  );

  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometrics, setBiometrics] = useState(true);

  const SettingSwitch = ({ icon, title, subtitle, value, onValueChange }: any) => (
    <View style={styles.settingRow}>
      <View style={styles.iconBox}>
        <Icon name={icon} size={22} color={Colors.primary} />
      </View>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        trackColor={{ false: '#E2E8F0', true: Colors.primary }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#E2E8F0"
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  );

  const SettingLink = ({ icon, title, value, onPress }: any) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.iconBox, { backgroundColor: '#F8FAFC' }]}>
        <Icon name={icon} size={22} color="#64748B" />
      </View>
      <Text style={[styles.settingTitle, { flex: 1 }]}>{title}</Text>
      {value ? <Text style={styles.settingValue}>{value}</Text> : null}
      <Icon name="chevron-right" size={22} color="#CBD5E1" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <BreatheLoader message="Loading settings..." />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Settings</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.duration(400)}>
          
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <SettingSwitch 
              icon="notifications-active" 
              title="Push Notifications" 
              subtitle="Receive alerts for schedule changes" 
              value={pushEnabled} 
              onValueChange={setPushEnabled} 
            />
            <View style={styles.divider} />
            <SettingSwitch 
              icon="sms" 
              title="SMS Delivery Reports" 
              subtitle="Get notified when parent SMS fails" 
              value={smsEnabled} 
              onValueChange={setSmsEnabled} 
            />
          </View>

          <Text style={styles.sectionTitle}>Appearance & Access</Text>
          <View style={styles.card}>
            <SettingSwitch 
              icon="dark-mode" 
              title="Dark Mode" 
              subtitle="Switch to dark theme" 
              value={darkMode} 
              onValueChange={setDarkMode} 
            />
            <View style={styles.divider} />
            <SettingSwitch 
              icon="fingerprint" 
              title="Biometric Login" 
              subtitle="Use FaceID / TouchID to login" 
              value={biometrics} 
              onValueChange={setBiometrics} 
            />
            <View style={styles.divider} />
            <SettingLink 
              icon="language" 
              title="Language" 
              value="English (US)" 
            />
          </View>

          <Text style={styles.sectionTitle}>Data Management</Text>
          <View style={styles.card}>
            <SettingLink 
              icon="cloud-sync" 
              title="Sync Status" 
              value="Up to date" 
            />
            <View style={styles.divider} />
            <TouchableOpacity style={styles.destructiveRow} activeOpacity={0.75}>
              <View style={[styles.iconBox, { backgroundColor: Colors.errorSoft }]}>
                <Icon name="delete-outline" size={22} color={Colors.error} />
              </View>
              <Text style={styles.destructiveText}>Clear App Cache</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            <SettingLink 
              icon="help-outline" 
              title="Help & Support" 
              onPress={() => navigation.navigate('HelpSupport')} 
            />
            <View style={styles.divider} />
            <SettingLink 
              icon="info-outline" 
              title="About ClassTrack" 
              onPress={() => navigation.navigate('About')} 
            />
          </View>
          
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 14, 
    backgroundColor: '#FFFFFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F1F5F9' 
  },
  backBtn: { padding: 4, marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.text },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginLeft: 6 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 18, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9', overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.primarySoft, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  settingText: { flex: 1, paddingRight: 12 },
  settingTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  settingSubtitle: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  settingValue: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600', marginRight: 8 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 70 },
  destructiveRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  destructiveText: { fontSize: 15, fontWeight: '700', color: Colors.error }
});
