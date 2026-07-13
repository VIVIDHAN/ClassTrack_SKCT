import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform, StatusBar, ScrollView, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function Settings() {
  const navigation = useNavigation<any>();
  
  const [pushEnabled, setPushEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometrics, setBiometrics] = useState(true);

  const SettingSwitch = ({ icon, title, subtitle, value, onValueChange }: any) => (
    <View style={styles.settingRow}>
      <View style={styles.iconBox}>
        <Icon name={icon} size={24} color={Colors.primary} />
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

  const SettingLink = ({ icon, title, value }: any) => (
    <TouchableOpacity style={styles.settingRow}>
      <View style={[styles.iconBox, { backgroundColor: '#F1F5F9' }]}>
        <Icon name={icon} size={24} color="#64748B" />
      </View>
      <Text style={[styles.settingTitle, { flex: 1 }]}>{title}</Text>
      <Text style={styles.settingValue}>{value}</Text>
      <Icon name="chevron-right" size={24} color={Colors.border} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Settings</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
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
            <TouchableOpacity style={styles.destructiveRow}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <Icon name="delete-outline" size={24} color="#EF4444" />
              </View>
              <Text style={styles.destructiveText}>Clear App Cache</Text>
            </TouchableOpacity>
          </View>
          
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { padding: 10, backgroundColor: Colors.background, borderRadius: 10, marginRight: 16, borderWidth: 1, borderColor: Colors.border },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.text },
  content: { padding: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 8 },
  card: { backgroundColor: Colors.surface, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255, 93, 56, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  settingText: { flex: 1, paddingRight: 16 },
  settingTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  settingSubtitle: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  settingValue: { fontSize: 15, color: Colors.textSecondary, fontWeight: '600', marginRight: 8 },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: 76 },
  destructiveRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  destructiveText: { fontSize: 16, fontWeight: '700', color: '#EF4444' }
});
