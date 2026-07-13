import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../constants/Colors';
import { DUMMY_USER } from '../constants/DummyData';
import { useNavigation } from '@react-navigation/native';

export default function Profile() {
  const navigation = useNavigation<any>();

  const MenuItem = ({ icon, title, subtitle, isDestructive = false, onPress }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconBox, { backgroundColor: isDestructive ? 'rgba(239, 68, 68, 0.1)' : '#F1F5F9' }]}>
        <Icon name={icon} size={22} color={isDestructive ? '#EF4444' : '#64748B'} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuTitle, { color: isDestructive ? '#EF4444' : '#0F172A' }]}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {!isDestructive && <Icon name="chevron-right" size={24} color="#CBD5E1" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Account</Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* User Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Icon name="person" size={40} color={Colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{DUMMY_USER.name}</Text>
            <Text style={styles.userEmail}>faculty@skct.edu.in</Text>
            <Text style={styles.userPhone}>+91 98765 43210</Text>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Icon name="edit" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Menu Sections */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="person-outline" title="Personal Details" subtitle="Name, DOB, Gender" onPress={() => navigation.navigate('PersonalDetails')} />
          <View style={styles.divider} />
          <MenuItem icon="business" title="Department Info" subtitle="Subjects, Schedule" onPress={() => navigation.navigate('DepartmentInfo')} />
          <View style={styles.divider} />
          <MenuItem icon="security" title="Security & Password" onPress={() => navigation.navigate('SecurityPassword')} />
        </View>

        <Text style={styles.sectionTitle}>More</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="settings" title="App Settings" subtitle="Theme, Notifications" onPress={() => navigation.navigate('Settings')} />
          <View style={styles.divider} />
          <MenuItem icon="help-outline" title="Help & Support" onPress={() => navigation.navigate('HelpSupport')} />
          <View style={styles.divider} />
          <MenuItem icon="info-outline" title="About ClassTrack" onPress={() => navigation.navigate('About')} />
        </View>

        <View style={[styles.menuCard, { marginTop: 12 }]}>
          <MenuItem 
            icon="logout" 
            title="Log Out" 
            isDestructive={true} 
            onPress={() => navigation.replace('Login')}
          />
        </View>
        
        <Text style={styles.versionText}>App Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 93, 56, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 93, 56, 0.2)',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#64748B',
  },
  editBtn: {
    padding: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 8,
  },
  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 72, 
  },
  versionText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 12,
  },
});
