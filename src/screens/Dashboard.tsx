import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, StatusBar, Image, ScrollView, Dimensions, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInUp, FadeInRight, SlideInLeft, SlideOutLeft, Easing } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../constants/Colors';
import { API_BASE_URL } from '../constants/Config';

const { width, height } = Dimensions.get('window');

type ViewMode = 'grid' | 'classes';

export default function Dashboard() {
  const navigation = useNavigation<any>();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [facultyName, setFacultyName] = useState('Ms. B Narmatha');
  const [facultyDept, setFacultyDept] = useState('Information Technology');
  const [upcomingClass, setUpcomingClass] = useState<any>({
    subject: 'Applied Cryptography',
    time: 'Period 4 (11:35 - 12:25)',
    section: 'III IT G',
    room: 'Room 204'
  });
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('loggedInTeacher');
      setLogoutModalVisible(false);
      navigation.replace('Login');
    } catch (e) {
      console.log('Error logging out', e);
      setLogoutModalVisible(false);
      navigation.replace('Login');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const loadTeacherDashboard = async () => {
        try {
          const stored = await AsyncStorage.getItem('loggedInTeacher');
          let teacherId = 3;
          if (stored) {
            const teacher = JSON.parse(stored);
            setFacultyName(teacher.name);
            setFacultyDept(teacher.department || 'Information Technology');
            teacherId = teacher.id;
          }

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);

          // Get Day of week (1 to 5, default to 1 for Monday)
          const jsDay = new Date().getDay();
          const currentDay = (jsDay >= 1 && jsDay <= 5) ? jsDay : 1;

          const res = await fetch(`${API_BASE_URL}/timetable?teacher_id=${teacherId}&day=${currentDay}`, { signal: controller.signal });
          clearTimeout(timeoutId);
          const data = await res.json();

          if (Array.isArray(data) && data.length > 0) {
            const first = data[0];
            setUpcomingClass({
              subject: first.Subject ? first.Subject.title : 'IT Course',
              time: `Period ${first.period}`,
              section: first.section,
              room: `Room 20${first.period || 4}`
            });
          } else {
            // Default fallback based on teacher
            if (teacherId === 3) {
              setUpcomingClass({ subject: 'Applied Cryptography', time: 'Period 4 (11:35 - 12:25)', section: 'III IT G', room: 'Room 204' });
            } else if (teacherId === 4) {
              setUpcomingClass({ subject: 'Distributed Computing', time: 'Period 3 (10:45 - 11:35)', section: 'III IT G', room: 'Room 202' });
            } else if (teacherId === 2) {
              setUpcomingClass({ subject: 'Software Testing', time: 'Period 1 (08:45 - 09:35)', section: 'III IT G', room: 'Room 201' });
            }
          }
        } catch (err) {
          console.log('Failed to fetch faculty classes:', err);
        }
      };

      loadTeacherDashboard();
    }, [])
  );
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.appBarBtn} onPress={() => setIsSidebarOpen(true)}>
          <Icon name="menu" size={28} color="#0F172A" />
        </TouchableOpacity>
        
        <View style={styles.headerLogoContainer}>
          <Image 
            source={require('../assets/logo.png')} 
            style={styles.headerLogo} 
            resizeMode="contain" 
          />
        </View>

        <TouchableOpacity style={styles.appBarBtn} onPress={() => navigation.navigate('Notifications')}>
          <Icon name="notifications-none" size={28} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Welcome Banner */}
        <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.welcomeContainer}>
          <View style={styles.facultyCard}>
            <View style={styles.facultyCardContent}>
              <Text style={styles.greeting}>Good Morning,</Text>
              <Text style={styles.name}>{facultyName}</Text>
              <View style={styles.departmentBadge}>
                <Icon name="business" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.subtitle}>{facultyDept}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={styles.gridContainer}>
          <TouchableOpacity 
            style={[styles.fullWidthCard, { backgroundColor: '#E0F2FE', borderColor: '#7DD3FC' }]} 
            onPress={() => navigation.navigate('ClassesList', { mode: 'attendance' })}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.gridIconWrap, { backgroundColor: '#38BDF8', marginBottom: 0, marginRight: 16 }]}>
                <Icon name="fact-check" size={32} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.gridTitle}>Mark Attendance</Text>
                <Text style={styles.gridSubtitle}>Select a class to mark</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#38BDF8" />
            </View>
          </TouchableOpacity>

          <View style={styles.rowGrid}>
            <TouchableOpacity 
              style={[styles.gridBox, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]} 
              onPress={() => navigation.navigate('History')}
              activeOpacity={0.8}
            >
              <View style={[styles.gridIconWrap, { backgroundColor: '#F87171' }]}>
                <Icon name="history" size={28} color="#ffffff" />
              </View>
              <Text style={styles.gridTitle}>Logs</Text>
              <Text style={styles.gridSubtitle}>View reports</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.gridBox, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]} 
              onPress={() => navigation.navigate('ClassesList', { mode: 'directory' })}
              activeOpacity={0.8}
            >
              <View style={[styles.gridIconWrap, { backgroundColor: '#4ADE80' }]}>
                <Icon name="people" size={28} color="#ffffff" />
              </View>
              <Text style={styles.gridTitle}>Directory</Text>
              <Text style={styles.gridSubtitle}>Student info</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.fullWidthCard, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A', marginTop: 12 }]} 
            onPress={() => navigation.navigate('AttendanceReport')}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.gridIconWrap, { backgroundColor: '#F59E0B', marginBottom: 0, marginRight: 16 }]}>
                <Icon name="assessment" size={30} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.gridTitle}>Attendance Report</Text>
                <Text style={styles.gridSubtitle}>Date-range student % & analytics</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#F59E0B" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Upcoming Classes */}
        <Animated.View entering={FadeInUp.delay(150).duration(500)} style={styles.upcomingContainer}>
          <Text style={styles.sectionTitleLabel}>Upcoming Classes</Text>
          <View style={styles.upcomingCard}>
            <View style={styles.upcomingHeader}>
              <View style={styles.upcomingBadge}>
                <Icon name="schedule" size={16} color={Colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.upcomingBadgeText}>{upcomingClass.time} • {upcomingClass.section}</Text>
              </View>
              <View style={styles.attendanceBadge}>
                <Text style={styles.attendanceBadgeText}>Live Sync</Text>
              </View>
            </View>
            <Text style={styles.upcomingSubject}>{upcomingClass.subject}</Text>
            <View style={styles.upcomingFooter}>
              <View style={styles.footerItem}>
                <Icon name="door-front" size={20} color="#64748B" />
                <Text style={styles.footerItemText}>{upcomingClass.room}</Text>
              </View>
              <View style={styles.footerDivider} />
              <View style={styles.footerItem}>
                <Icon name="domain" size={20} color="#64748B" />
                <Text style={styles.footerItemText}>IT Block, 2nd Floor</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Daily Wisdom */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.wisdomContainer}>
          <View style={styles.wisdomCard}>
            <Icon name="format-quote" size={36} color="rgba(255, 93, 56, 0.2)" style={styles.quoteIcon} />
            <Text style={styles.wisdomTitle}>Daily Wisdom</Text>
            <Text style={styles.wisdomText}>"The beautiful thing about learning is that no one can take it away from you."</Text>
            <Text style={styles.wisdomAuthor}>- B.B. King</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* CUSTOM SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <View style={StyleSheet.absoluteFill}>
          <Pressable style={styles.sidebarOverlay} onPress={() => setIsSidebarOpen(false)} />
          <Animated.View 
            entering={SlideInLeft.duration(300).easing(Easing.out(Easing.poly(4)))}
            exiting={SlideOutLeft.duration(300)}
            style={styles.sidebarContainer}
          >
            <View style={styles.sidebarHeader}>
              <View style={{ width: 28 }} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Image source={require('../assets/logo.png')} style={{ width: 170, height: 55 }} resizeMode="contain" />
              </View>
              <TouchableOpacity onPress={() => setIsSidebarOpen(false)}>
                <Icon name="close" size={28} color="#0F172A" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.sidebarMenu}>
              <TouchableOpacity style={styles.sidebarMenuItem} onPress={() => setIsSidebarOpen(false)}>
                <Icon name="space-dashboard" size={24} color={Colors.primary} />
                <Text style={[styles.sidebarMenuText, { color: Colors.primary }]}>Dashboard</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.sidebarMenuItem} 
                onPress={() => {
                  setIsSidebarOpen(false);
                  navigation.navigate('AttendanceReport');
                }}
              >
                <Icon name="assessment" size={24} color="#64748B" />
                <Text style={styles.sidebarMenuText}>Attendance Report</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.sidebarMenuItem} 
                onPress={() => {
                  setIsSidebarOpen(false);
                  navigation.navigate('Profile');
                }}
              >
                <Icon name="account-circle" size={24} color="#64748B" />
                <Text style={styles.sidebarMenuText}>Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.sidebarMenuItem} 
                onPress={() => {
                  setIsSidebarOpen(false);
                  navigation.navigate('Settings');
                }}
              >
                <Icon name="settings" size={24} color="#64748B" />
                <Text style={styles.sidebarMenuText}>Settings</Text>
              </TouchableOpacity>
              
              <View style={styles.sidebarDivider} />

              <TouchableOpacity 
                style={styles.sidebarMenuItem} 
                onPress={() => {
                  setIsSidebarOpen(false);
                  setLogoutModalVisible(true);
                }}
              >
                <Icon name="logout" size={24} color={Colors.error} />
                <Text style={[styles.sidebarMenuText, { color: Colors.error }]}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}

      {/* CUSTOM LOGOUT MODAL */}
      <Modal transparent visible={logoutModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconBox}>
              <Icon name="logout" size={32} color={Colors.error} />
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
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  appBarBtn: { padding: 8, borderRadius: 12, backgroundColor: '#F8FAFC' },
  headerLogoContainer: { flex: 1, alignItems: 'center' },
  headerLogo: { width: 240, height: 60, transform: [{ scale: 1.2 }] },
  welcomeContainer: { padding: 20, paddingTop: 24 },
  facultyCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.08, shadowRadius: 24, elevation: 8, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255, 93, 56, 0.1)' },
  facultyCardContent: { flex: 1, zIndex: 2 },
  greeting: { fontSize: 14, color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.5 },
  name: { fontSize: 26, fontWeight: '900', color: '#0F172A', marginTop: 6, marginBottom: 16, letterSpacing: -0.5 },
  departmentBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 93, 56, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start' },
  subtitle: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  
  gridContainer: { paddingHorizontal: 20, marginTop: 10 },
  fullWidthCard: { padding: 20, borderRadius: 24, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2, marginBottom: 16 },
  rowGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  gridBox: { flex: 1, padding: 20, borderRadius: 24, marginHorizontal: 6, borderWidth: 1, alignItems: 'flex-start', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  gridIconWrap: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  gridTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  gridSubtitle: { fontSize: 12, color: '#64748B', fontWeight: '600', lineHeight: 16 },

  wisdomContainer: { paddingHorizontal: 20, marginTop: 10, paddingBottom: 20 },
  wisdomCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 4 },
  quoteIcon: { position: 'absolute', top: 16, right: 16 },
  wisdomTitle: { fontSize: 14, fontWeight: '800', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12 },
  wisdomText: { fontSize: 18, color: '#334155', fontStyle: 'italic', lineHeight: 28, fontWeight: '500', marginBottom: 16 },
  wisdomAuthor: { fontSize: 14, color: '#94A3B8', fontWeight: '700', textAlign: 'right' },

  upcomingContainer: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitleLabel: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 12, marginLeft: 4 },
  upcomingCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 4 },
  upcomingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  upcomingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 93, 56, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  upcomingBadgeText: { color: Colors.primary, fontSize: 13, fontWeight: '700' },
  attendanceBadge: { backgroundColor: Colors.success, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  attendanceBadgeText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  upcomingSubject: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 20, lineHeight: 28 },
  upcomingFooter: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  footerItem: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' },
  footerItemText: { color: '#64748B', fontSize: 13, fontWeight: '600', marginLeft: 6 },
  footerDivider: { width: 1, height: 20, backgroundColor: '#E2E8F0' },

  listContainer: { flex: 1, padding: 20, paddingTop: 10 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  backBtn: { padding: 6, backgroundColor: '#E2E8F0', borderRadius: 10 },
  loadingText: { textAlign: 'center', marginTop: 20, color: '#94A3B8', fontWeight: '500' },
  classCard: { flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 2 },
  cardLeft: { flex: 1 },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  classTime: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  className: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  subjectName: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  cardRight: { marginLeft: 16 },
  takeAttendanceBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 14, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  takeAttendanceText: { color: '#ffffff', fontWeight: '700', fontSize: 14, marginRight: 4 },

  sidebarOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', zIndex: 99 },
  sidebarContainer: { position: 'absolute', top: 0, left: 0, bottom: 0, width: width * 0.75, backgroundColor: '#ffffff', zIndex: 100, borderTopRightRadius: 30, borderBottomRightRadius: 30, shadowColor: '#000', shadowOffset: { width: 10, height: 0 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 40 },
  sidebarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sidebarMenu: { padding: 24 },
  sidebarMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sidebarMenuText: { fontSize: 16, fontWeight: '700', color: '#64748B', marginLeft: 16 },
  sidebarDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24, width: '100%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  modalIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(239, 68, 68, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  modalBtnRow: { flexDirection: 'row', width: '100%' },
  modalCancelBtn: { flex: 1, paddingVertical: 14, backgroundColor: '#F1F5F9', borderRadius: 12, alignItems: 'center', marginRight: 8 },
  modalCancelText: { color: '#64748B', fontWeight: '700', fontSize: 15 },
  modalConfirmBtn: { flex: 1, paddingVertical: 14, backgroundColor: Colors.error, borderRadius: 12, alignItems: 'center', marginLeft: 8 },
  modalConfirmText: { color: '#ffffff', fontWeight: '700', fontSize: 15 }
});
