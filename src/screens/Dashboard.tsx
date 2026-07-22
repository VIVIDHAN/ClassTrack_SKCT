import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, Image, ScrollView, Dimensions, Pressable, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInUp, SlideInLeft, SlideOutLeft, Easing } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../constants/Colors';
import { API_BASE_URL } from '../constants/Config';

const { width, height } = Dimensions.get('window');

export default function Dashboard() {
  const navigation = useNavigation<any>();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [facultyName, setFacultyName] = useState('Faculty Member');
  const [facultyDept, setFacultyDept] = useState('Loading...');
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const [classes, setClasses] = useState<any[]>([]);
  const [dailyQuote, setDailyQuote] = useState("Every achievement begins with effort.");
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayName, setHolidayName] = useState('');
  const [dayOrderStr, setDayOrderStr] = useState('');
  const [eventName, setEventName] = useState('');
  const [showAllClasses, setShowAllClasses] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [totalNotified, setTotalNotified] = useState(0);

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

  useFocusEffect(
    React.useCallback(() => {
      const loadDashboard = async () => {
        try {
          const profileStr = await AsyncStorage.getItem('teacherProfile');
          if (profileStr) {
            const profile = JSON.parse(profileStr);
            setFacultyName(profile.name);
            setFacultyDept(profile.department || 'IT');
            
            try {
              const overviewRes = await fetch(`${API_BASE_URL}/attendance/overview/today?teacher_id=${profile.id}`);
              if (overviewRes.ok) {
                const overviewData = await overviewRes.json();
                setTotalNotified(overviewData.total_notified_absent || 0);
              }
            } catch (err) {
              console.log("Could not load notified overview", err);
            }

            const calResponse = await fetch(`${API_BASE_URL}/calendar/today`);
            const calData = await calResponse.json();

            if (calData && !calData.is_holiday && calData.day_order) {
              const day = calData.day_order;
              const romanDays = ['I', 'II', 'III', 'IV', 'V'];
              setDayOrderStr(`Day Order ${romanDays[day - 1]}`);
              setIsHoliday(false);
              setEventName(calData.event_name || '');

              const response = await fetch(`${API_BASE_URL}/timetable?day=${day}&teacher_id=${profile.id}`);
              const fetchedClasses = Array.isArray(data) ? data : [];
              
              // Inject a dummy class for testing that is always ongoing
              const dummyClass = {
                id: 9999,
                period: 99,
                section: 'III IT G', // Using a known section for students
                Subject: { title: 'Testing / Demo Class', code: 'DEMO101' }
              };
              
              setClasses([...fetchedClasses, dummyClass]);
            } else {
              setClasses([]);
              setIsHoliday(true);
              setHolidayName(calData?.holiday_name || "Holiday");
              setEventName(calData?.event_name || '');
              setDayOrderStr('');
            }
            
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
      
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 60000);
      
      return () => clearInterval(timer);
    }, [])
  );

  const getClassStatus = (period: number) => {
    if (period === 99) return 'ongoing'; // Dummy class is always ongoing

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

  const getFormatName = (name: string) => {
     if(name.includes('Mr.') || name.includes('Ms.') || name.includes('Dr.')) return name;
     return `Mr. ${name}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.appBar}>
        <View style={{ width: 44 }} />
        
        <View style={styles.headerLogoContainer}>
          <Image source={require('../assets/logo.png')} style={{ height: 40, width: 220 }} resizeMode="contain" />
        </View>

        <TouchableOpacity style={styles.appBarBtn} onPress={() => navigation.navigate('Notifications')}>
          <View style={styles.bellBox}>
            <Icon name="notifications-none" size={24} color="#1E293B" />
            <View style={styles.notificationDot} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Welcome Banner */}
        <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.welcomeContainer}>
          <LinearGradient 
            colors={['#ffffff', '#FFF5ED']} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }} 
            style={styles.welcomeCard}
          >
            <View style={{ zIndex: 2 }}>
              <Text style={styles.greeting}>WELCOME BACK,</Text>
              <Text style={styles.name}>{getFormatName(facultyName)}</Text>
              
              <View style={styles.departmentBadge}>
                <Icon name="business" size={16} color="#EA580C" style={{ marginRight: 6 }} />
                <Text style={styles.departmentText}>{facultyDept} Department</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Today's Schedule */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.scheduleSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleLabel}>Today's Schedule</Text>
            {dayOrderStr ? (
              <View style={styles.dayOrderBadge}>
                <Text style={styles.dayOrderText}>{dayOrderStr}</Text>
              </View>
            ) : null}
          </View>
          
          {isHoliday ? (
             <View style={[styles.classCard, { alignItems: 'center', padding: 30, backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
               <Icon name="celebration" size={48} color="#F59E0B" />
               <Text style={{ marginTop: 12, color: '#92400E', fontWeight: '800', fontSize: 18 }}>{holidayName}</Text>
               <Text style={{ marginTop: 4, color: '#B45309', fontWeight: '600' }}>No classes scheduled for today.</Text>
             </View>
          ) : classes.length === 0 ? (
             <View style={[styles.classCard, { alignItems: 'center', padding: 30 }]}>
               <Icon name="event-available" size={48} color="#CBD5E1" />
               <Text style={{ marginTop: 10, color: '#64748B', fontWeight: '600' }}>No classes scheduled for today.</Text>
             </View>
          ) : (
            (() => {
              const activeClass = classes.find(cls => getClassStatus(cls.period) === 'ongoing' || getClassStatus(cls.period) === 'upcoming');
              if (!activeClass) {
                return (
                  <View style={[styles.classCard, { alignItems: 'center', padding: 30 }]}>
                    <Icon name="check-circle" size={48} color="#4ADE80" />
                    <Text style={{ marginTop: 10, color: '#64748B', fontWeight: '600' }}>All classes completed for today!</Text>
                  </View>
                );
              }

              const timeSlots = ['08:45 AM - 09:40 AM', '09:40 AM - 10:35 AM', '10:50 AM - 11:45 AM', '11:45 AM - 12:40 PM', '01:30 PM - 02:25 PM', '02:25 PM - 03:20 PM', '03:20 PM - 04:15 PM'];
              const timeString = activeClass.period === 99 ? 'Anytime' : (timeSlots[activeClass.period - 1] || `Period ${activeClass.period}`);
              const status = getClassStatus(activeClass.period);
              const isOngoing = status === 'ongoing';
              const isUpcoming = status === 'upcoming';
              
              return (
                <TouchableOpacity 
                  key={activeClass.id} 
                  activeOpacity={0.8}
                  onPress={() => {
                    if (isOngoing) {
                      navigation.navigate('StudentDirectoryList', { 
                        classDetails: { subject: activeClass.Subject ? activeClass.Subject.title : 'Subject', className: activeClass.section } 
                      });
                    } else {
                      Alert.alert("Time Restricted", "Attendance marking is strictly time-based. You can only mark attendance during the active ongoing class period.");
                    }
                  }}
                >
                  <LinearGradient 
                    colors={['#F97316', '#EA580C']} 
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} 
                    style={[styles.classCard, isUpcoming && { opacity: 0.9, shadowOpacity: 0.04 }]}
                  >
                  <View style={styles.classTopRow}>
                    <View style={styles.timeBadge}>
                      <Icon name="access-time" size={14} color="#F97316" style={{marginRight: 6}} />
                      <Text style={styles.timeText}>{timeString}</Text>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      {isOngoing && <View style={styles.ongoingBadge}><Icon name="fiber-manual-record" size={10} color="#F97316" style={{marginRight: 4}} /><Text style={styles.ongoingText}>ONGOING</Text></View>}
                      {isUpcoming && <View style={[styles.ongoingBadge, { backgroundColor: '#38BDF8' }]}><Text style={[styles.ongoingText, {color: '#ffffff'}]}>UPCOMING</Text></View>}
                      <View style={styles.sectionBadge}><Text style={styles.sectionText}>{activeClass.section}</Text></View>
                    </View>
                  </View>

                  <View style={styles.classBottomRow}>
                    <View style={styles.detailItem}>
                      <Icon name="badge" size={20} color="#F97316" />
                      <View style={{marginLeft: 12}}>
                        <Text style={styles.detailValue}>{activeClass.Subject ? activeClass.Subject.code : '-'}</Text>
                        <Text style={styles.detailLabel}>Course Code</Text>
                      </View>
                    </View>
                    <View style={styles.detailDivider} />
                    <View style={styles.detailItem}>
                      <Icon name="business" size={20} color="#F97316" />
                      <View style={{marginLeft: 12}}>
                        <Text style={styles.detailValue}>{facultyDept} Block</Text>
                        <Text style={styles.detailLabel}>Location</Text>
                      </View>
                    </View>
                    <View style={[styles.arrowButton, !isOngoing && { backgroundColor: '#F1F5F9' }]}>
                      <Icon name="arrow-forward" size={20} color={isOngoing ? "#ffffff" : "#94A3B8"} />
                    </View>
                  </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })()
          )}
          
          {classes.length > 0 && !isHoliday && (
            <TouchableOpacity style={styles.seeAllBtn} onPress={() => navigation.navigate('FullSchedule', { classes, facultyDept })}>
              <Text style={styles.seeAllText}>See Full Schedule</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Notification Overview */}
        <Animated.View entering={FadeInUp.delay(250).duration(500)} style={styles.overviewSection}>
          <View style={styles.notificationCard}>
            <View style={styles.notificationHeader}>
               <Text style={styles.notificationTitle}>Notification Overview</Text>
               <TouchableOpacity style={styles.todayDropdown}>
                 <Text style={styles.todayText}>Today</Text>
                 <Icon name="keyboard-arrow-down" size={16} color="#64748B" />
               </TouchableOpacity>
            </View>

            <View style={styles.notificationInner}>
               <View style={styles.statBlockFull}>
                 <View style={[styles.statIconBox, { backgroundColor: '#FFF5ED' }]}><Icon name="send" size={20} color="#EA580C" /></View>
                 <View style={{ alignItems: 'center' }}>
                   <Text style={[styles.statValueLarge, { color: '#EA580C' }]}>{totalNotified < 10 ? `0${totalNotified}` : totalNotified}</Text>
                   <Text style={styles.statLabelLarge}>Sent</Text>
                 </View>
               </View>
               <View style={styles.verticalDivider} />
               <View style={styles.statBlockFull}>
                 <View style={[styles.statIconBox, { backgroundColor: '#ECFDF5' }]}><Icon name="people" size={20} color="#10B981" /></View>
                 <View style={{ alignItems: 'center' }}>
                   <Text style={[styles.statValueLarge, { color: '#10B981' }]}>24</Text>
                   <Text style={styles.statLabelLarge}>Present</Text>
                 </View>
               </View>
               <View style={styles.verticalDivider} />
               <View style={styles.statBlockFull}>
                 <View style={[styles.statIconBox, { backgroundColor: '#FEF2F2' }]}><Icon name="person-off" size={20} color="#EF4444" /></View>
                 <View style={{ alignItems: 'center' }}>
                   <Text style={[styles.statValueLarge, { color: '#EF4444' }]}>02</Text>
                   <Text style={styles.statLabelLarge}>Absent</Text>
                 </View>
               </View>
            </View>
          </View>
        </Animated.View>

        {/* Daily Wisdom */}
        <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.wisdomSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitleLabel, { color: '#DC2626' }]}>Daily Wisdom</Text>
            <Icon name="format-quote" size={32} color="#DC2626" />
          </View>
          <View style={styles.wisdomCard}>
             <Text style={styles.wisdomQuote}>"{dailyQuote}"</Text>
             <Text style={styles.wisdomAuthor}>- ClassTrack Inspiration</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('ViewLog')}>
           <Icon name="assignment" size={26} color="#94A3B8" />
           <Text style={styles.navText}>Logs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItemActive}>
           <Icon name="home" size={26} color="#DC2626" />
           <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
           <Icon name="person-outline" size={26} color="#94A3B8" />
           <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>

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
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, backgroundColor: '#FAFAFA' },
  appBarBtn: { padding: 4 },
  headerLogoContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  menuBox: { position: 'relative', width: 48, height: 48, borderRadius: 12, backgroundColor: '#FFF5ED', justifyContent: 'center', alignItems: 'center', shadowColor: '#EA580C', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  bellBox: { position: 'relative', width: 48, height: 48, borderRadius: 12, backgroundColor: '#FFF5ED', justifyContent: 'center', alignItems: 'center', shadowColor: '#EA580C', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  notificationDot: { position: 'absolute', top: 12, right: 12, width: 10, height: 10, borderRadius: 5, backgroundColor: '#DC2626', borderWidth: 2, borderColor: '#FFF5ED' },
  
  welcomeContainer: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  welcomeCard: { borderRadius: 32, padding: 32, shadowColor: '#EA580C', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 12, minHeight: 200, borderWidth: 1, borderColor: '#FFF5ED' },
  greeting: { fontFamily: 'Poppins-Medium', fontSize: 12, color: '#94A3B8', marginBottom: 4, letterSpacing: 2, textTransform: 'uppercase' },
  name: { fontFamily: 'Poppins-Bold', fontSize: 32, color: '#0F172A', marginBottom: 20, letterSpacing: -0.5 },
  departmentBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5ED', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, alignSelf: 'flex-start' },
  departmentText: { fontFamily: 'Poppins-Bold', fontSize: 13, color: '#EA580C' },

  scheduleSection: { paddingHorizontal: 24, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitleLabel: { fontFamily: 'Poppins-Bold', fontSize: 22, color: '#0F172A', letterSpacing: -0.5 },
  dayOrderBadge: { backgroundColor: '#FFF5ED', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  dayOrderText: { fontFamily: 'Poppins-Bold', color: '#F97316', fontSize: 13 },
  
  classCard: { borderRadius: 28, padding: 24, shadowColor: '#EA580C', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 24, elevation: 8, marginBottom: 20 },
  classTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  timeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 24, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.05, shadowRadius: 8 },
  timeText: { fontFamily: 'Poppins-Bold', color: '#EA580C', fontSize: 13 },
  ongoingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, marginRight: 8, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.05, shadowRadius: 8 },
  ongoingText: { fontFamily: 'Poppins-Bold', color: '#EA580C', fontSize: 12, letterSpacing: 0.5 },
  sectionBadge: { backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.05, shadowRadius: 8 },
  sectionText: { fontFamily: 'Poppins-Bold', color: '#EA580C', fontSize: 12 },
  
  classTitle: { fontFamily: 'Poppins-Bold', fontSize: 24, color: '#ffffff', marginBottom: 28, lineHeight: 32, width: '90%' },
  classBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 20 },
  detailItem: { flexDirection: 'row', alignItems: 'center' },
  detailValue: { fontFamily: 'Poppins-Bold', fontSize: 14, color: '#0F172A', marginBottom: 2 },
  detailLabel: { fontFamily: 'Poppins-Medium', fontSize: 11, color: '#64748B' },
  detailDivider: { width: 1, height: 32, backgroundColor: '#F97316', opacity: 0.2, marginHorizontal: 16 },
  arrowButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center' },

  seeAllBtn: { alignSelf: 'center', paddingVertical: 12, marginTop: -4 },
  seeAllText: { fontFamily: 'Poppins-Bold', color: '#F97316', fontSize: 15 },

  overviewSection: { paddingHorizontal: 24, marginTop: 24 },
  notificationCard: { backgroundColor: '#ffffff', borderRadius: 28, padding: 24, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.05, shadowRadius: 24, elevation: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  notificationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  notificationTitle: { fontFamily: 'Poppins-Bold', fontSize: 18, color: '#0F172A' },
  todayDropdown: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  todayText: { fontFamily: 'Poppins-Bold', color: '#64748B', fontSize: 12, marginRight: 4 },
  notificationInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: 10, borderRadius: 20 },
  statBlockFull: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statIconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValueLarge: { fontFamily: 'Poppins-Bold', fontSize: 24, marginBottom: 2, textAlign: 'center' },
  statLabelLarge: { fontFamily: 'Poppins-Medium', fontSize: 11, color: '#64748B', lineHeight: 14, textAlign: 'center' },
  verticalDivider: { width: 1, height: 40, backgroundColor: '#F1F5F9', marginHorizontal: 12 },

  wisdomSection: { paddingHorizontal: 24, marginTop: 32 },
  wisdomCard: { backgroundColor: '#ffffff', borderRadius: 28, padding: 32, shadowColor: '#EA580C', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.05, shadowRadius: 24, elevation: 6, borderWidth: 1, borderColor: '#FFF5ED' },
  wisdomQuote: { fontFamily: 'Poppins-Medium', fontSize: 17, color: '#0F172A', fontStyle: 'italic', lineHeight: 28, marginBottom: 20 },
  wisdomAuthor: { fontFamily: 'Poppins-Bold', fontSize: 13, color: '#64748B', textAlign: 'right' },

  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#ffffff', paddingVertical: 16, paddingHorizontal: 24, justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: 32, borderTopRightRadius: 32, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 15, paddingBottom: Platform.OS === 'ios' ? 32 : 16 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navText: { fontFamily: 'Poppins-Bold', fontSize: 12, color: '#64748B', marginTop: 6 },
  navItemActive: { flex: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF5ED', paddingVertical: 14, borderRadius: 24 },
  navTextActive: { fontFamily: 'Poppins-Bold', fontSize: 14, color: '#EA580C', marginLeft: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24, width: '100%', alignItems: 'center' },
  modalIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(239, 68, 68, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontFamily: 'Poppins-Bold', fontSize: 20, color: '#0F172A', marginBottom: 8 },
  modalSubtitle: { fontFamily: 'Poppins-Regular', fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  modalBtnRow: { flexDirection: 'row', width: '100%' },
  modalCancelBtn: { flex: 1, paddingVertical: 14, backgroundColor: '#F1F5F9', borderRadius: 12, alignItems: 'center', marginRight: 8 },
  modalCancelText: { fontFamily: 'Poppins-Bold', color: '#64748B', fontSize: 15 },
  modalConfirmBtn: { flex: 1, paddingVertical: 14, backgroundColor: Colors.error, borderRadius: 12, alignItems: 'center', marginLeft: 8 },
  modalConfirmText: { fontFamily: 'Poppins-Bold', color: '#ffffff', fontSize: 15 }
});
