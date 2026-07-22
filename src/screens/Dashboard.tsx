import React, { useState, useEffect } from 'react';
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
  const [facultyName, setFacultyName] = useState('Faculty Member');
  const [facultyDept, setFacultyDept] = useState('Loading...');
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

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

  const [classes, setClasses] = useState<any[]>([]);
  const [dailyQuote, setDailyQuote] = useState("The beautiful thing about learning is that no one can take it away from you.");

  useFocusEffect(
    React.useCallback(() => {
      const loadDashboard = async () => {
        try {
          const profileStr = await AsyncStorage.getItem('teacherProfile');
          if (profileStr) {
            const profile = JSON.parse(profileStr);
            setFacultyName(profile.name);
            setFacultyDept(profile.department || 'IT');

            let day = new Date().getDay(); // 0 is Sunday, 1 is Monday
            if (day === 0 || day === 6) day = 1; // Default to Monday if weekend

            const response = await fetch(`${API_BASE_URL}/timetable?day=${day}&teacher_id=${profile.id}`);
            const data = await response.json();
            setClasses(Array.isArray(data) ? data : []);
            
            try {
              const quoteRes = await fetch(`${API_BASE_URL}/quote/daily`);
              if (quoteRes.ok) {
                const quoteData = await quoteRes.json();
                if (quoteData && quoteData.text) {
                  setDailyQuote(quoteData.text);
                }
              }
            } catch (qErr) {
              console.log('Could not load daily quote', qErr);
            }
          }
        } catch (error) {
          console.error('Failed to load dashboard:', error);
        }
      };
      
      loadDashboard();
      
      // Update current time every minute to keep UI in sync
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 60000);
      
      return () => clearInterval(timer);
    }, [])
  );
  
  const [currentTime, setCurrentTime] = useState(new Date());

  const getClassStatus = (period: number) => {
    const timeSlots = [
      { start: '08:45', end: '09:40' },
      { start: '09:40', end: '10:35' },
      { start: '10:50', end: '11:45' },
      { start: '11:45', end: '12:40' },
      { start: '13:30', end: '14:25' },
      { start: '14:25', end: '15:20' },
      { start: '15:20', end: '16:15' }
    ];
    if (period < 1 || period > 7) return 'upcoming';
    
    const slot = timeSlots[period - 1];
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    
    const [startH, startM] = slot.start.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    
    const [endH, endM] = slot.end.split(':').map(Number);
    const endMinutes = endH * 60 + endM;
    
    if (currentMinutes < startMinutes) return 'upcoming';
    if (currentMinutes > endMinutes) return 'past';
    return 'ongoing';
  };

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
            style={[styles.fullWidthCard, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]} 
            onPress={() => navigation.navigate('ClassesList', { mode: 'directory' })}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.gridIconWrap, { backgroundColor: '#4ADE80', marginBottom: 0, marginRight: 16 }]}>
                <Icon name="people" size={32} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.gridTitle}>Student Directory</Text>
                <Text style={styles.gridSubtitle}>View student info and details</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#4ADE80" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Upcoming Classes */}
        <Animated.View entering={FadeInUp.delay(150).duration(500)} style={styles.upcomingContainer}>
          <Text style={styles.sectionTitleLabel}>Today's Schedule</Text>
          
          {classes.filter(cls => getClassStatus(cls.period) !== 'past').length === 0 ? (
             <View style={[styles.upcomingCard, { alignItems: 'center', padding: 30 }]}>
               <Icon name="event-available" size={48} color="#CBD5E1" />
               <Text style={{ marginTop: 10, color: '#64748B', fontWeight: '600' }}>No more classes scheduled for today.</Text>
             </View>
          ) : (
            classes.filter(cls => getClassStatus(cls.period) !== 'past').map((cls, index) => {
              // Convert period to roughly time slot
              const timeSlots = ['08:45 AM - 09:40 AM', '09:40 AM - 10:35 AM', '10:50 AM - 11:45 AM', '11:45 AM - 12:40 PM', '01:30 PM - 02:25 PM', '02:25 PM - 03:20 PM', '03:20 PM - 04:15 PM'];
              const timeString = timeSlots[cls.period - 1] || `Period ${cls.period}`;
              const status = getClassStatus(cls.period);
              const isOngoing = status === 'ongoing';
              
              return (
                <View key={cls.id} style={[
                  styles.upcomingCard, 
                  { marginBottom: 16 },
                  isOngoing && { borderColor: Colors.primary, borderWidth: 2, shadowColor: Colors.primary, shadowOpacity: 0.15 }
                ]}>
                  <View style={styles.upcomingHeader}>
                    <View style={styles.upcomingBadge}>
                      <Icon name="schedule" size={16} color={Colors.primary} style={{ marginRight: 4 }} />
                      <Text style={styles.upcomingBadgeText}>{timeString}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {isOngoing && (
                        <View style={[styles.attendanceBadge, { backgroundColor: '#EF4444', marginRight: 8, flexDirection: 'row', alignItems: 'center' }]}>
                          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#ffffff', marginRight: 4 }} />
                          <Text style={styles.attendanceBadgeText}>ONGOING</Text>
                        </View>
                      )}
                      <View style={[styles.attendanceBadge, { backgroundColor: '#3B82F6' }]}>
                        <Text style={styles.attendanceBadgeText}>{cls.section}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.upcomingSubject}>{cls.Subject ? cls.Subject.title : 'Subject'}</Text>
                  <View style={styles.upcomingFooter}>
                    <View style={styles.footerItem}>
                      <Icon name="badge" size={20} color="#64748B" />
                      <Text style={styles.footerItemText}>{cls.Subject ? cls.Subject.code : '-'}</Text>
                    </View>
                    <View style={styles.footerDivider} />
                    <View style={styles.footerItem}>
                      <Icon name="domain" size={20} color="#64748B" />
                      <Text style={styles.footerItemText}>{facultyDept} Block</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </Animated.View>

        {/* Daily Wisdom */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.wisdomContainer}>
          <View style={styles.wisdomCard}>
            <Icon name="format-quote" size={36} color="rgba(255, 93, 56, 0.2)" style={styles.quoteIcon} />
            <Text style={styles.wisdomTitle}>Daily Wisdom</Text>
            <Text style={styles.wisdomText}>"{dailyQuote}"</Text>
            <Text style={styles.wisdomAuthor}>- ClassTrack Inspiration</Text>
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
