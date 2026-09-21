import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../constants/Colors';
import { API_BASE_URL } from '../constants/Config';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import BreatheLoader from '../components/BreatheLoader';

export default function Profile() {
  const navigation = useNavigation<any>();
  const [facultyName, setFacultyName] = React.useState('Faculty Member');
  const [facultyEmail, setFacultyEmail] = React.useState('faculty@skct.edu.in');
  const [facultyDept, setFacultyDept] = React.useState('Information Technology');
  const [facultyPhone, setFacultyPhone] = React.useState('+91 98765 43210');
  const [loading, setLoading] = React.useState(true);
  const [logoutModalVisible, setLogoutModalVisible] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const loadProfile = async () => {
        try {
          const stored = await AsyncStorage.getItem('loggedInTeacher');
          if (stored) {
            const teacher = JSON.parse(stored);
            if (teacher.name) setFacultyName(teacher.name);
            if (teacher.email) setFacultyEmail(teacher.email);
            if (teacher.department) setFacultyDept(teacher.department);
          }
        } catch (e) {
          console.log('Error reading profile:', e);
        } finally {
          setLoading(false);
        }
      };

      loadProfile();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      setLogoutModalVisible(false);
      navigation.replace('Login');
    } catch (e) {
      console.log('Error logging out', e);
      setLogoutModalVisible(false);
      navigation.replace('Login');
    }
  };

  const MenuItem = ({ icon, title, subtitle, isDestructive = false, onPress }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.iconBox, { backgroundColor: isDestructive ? 'rgba(239, 68, 68, 0.1)' : Colors.primarySoft }]}>
        <Icon name={icon} size={22} color={isDestructive ? Colors.error : Colors.primary} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuTitle, { color: isDestructive ? Colors.error : '#0F172A' }]}>{title}</Text>
        {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
      </View>
      {!isDestructive && <Icon name="chevron-right" size={22} color="#CBD5E1" />}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <BreatheLoader message="Loading profile..." />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={26} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>My Account</Text>
          <View style={{ width: 28 }} />
        </View>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile User Header Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Icon name="person" size={38} color={Colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{facultyName}</Text>
            <Text style={styles.userEmail}>{facultyEmail}</Text>
            <Text style={styles.userPhone}>{facultyPhone}</Text>
          </View>
        </View>

        {/* Preferences Menu */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="person-outline" title="Personal Details" subtitle="Name, DOB, Gender" onPress={() => navigation.navigate('PersonalDetails')} />
          <View style={styles.divider} />
          <MenuItem icon="business" title="Department Info" subtitle="Subjects, Schedule" onPress={() => navigation.navigate('DepartmentInfo')} />
          <View style={styles.divider} />
          <MenuItem icon="security" title="Security & Password" onPress={() => navigation.navigate('SecurityPassword')} />
        </View>

        <View style={[styles.menuCard, { marginTop: 4 }]}>
          <MenuItem 
            icon="logout" 
            title="Log Out" 
            isDestructive={true} 
            onPress={() => setLogoutModalVisible(true)}
          />
        </View>
        
        <Text style={styles.versionText}>ClassTrack App Version 1.0.0</Text>
      </ScrollView>

      {/* CUSTOM LOGOUT MODAL */}
      <Modal transparent visible={logoutModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconBox}>
              <Icon name="logout" size={30} color={Colors.error} />
            </View>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalSubtitle}>Are you sure you want to log out of your session?</Text>
            
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setLogoutModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleLogout}>
                <Text style={styles.modalConfirmText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 4,
    marginLeft: -4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatarContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.2)',
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 6,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 20,
    shadowColor: '#0F172A',
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
    marginRight: 14,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 70, 
  },
  versionText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 12,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, width: '100%', alignItems: 'center', elevation: 8 },
  modalIconBox: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.errorSoft, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  modalSubtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 20 },
  modalBtnRow: { flexDirection: 'row', width: '100%', gap: 10 },
  modalCancelBtn: { flex: 1, paddingVertical: 12, backgroundColor: '#F1F5F9', borderRadius: 12, alignItems: 'center' },
  modalCancelText: { color: '#64748B', fontWeight: '700', fontSize: 14 },
  modalConfirmBtn: { flex: 1, paddingVertical: 12, backgroundColor: Colors.error, borderRadius: 12, alignItems: 'center' },
  modalConfirmText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 }
});
