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

            const calResponse = await fetch(`${API_BASE_URL}/calendar/today`);
            const calData = await calResponse.json();

            if (calData && !calData.is_holiday && calData.day_order) {
              const day = calData.day_order;
              const romanDays = ['I', 'II', 'III', 'IV', 'V'];
              setDayOrderStr(`Day Order ${romanDays[day - 1]}`);
              setIsHoliday(false);
              setEventName(calData.event_name || '');

              const response = await fetch(`${API_BASE_URL}/timetable?day=${day}&teacher_id=${profile.id}`);
              const data = await response.json();
              setClasses(Array.isArray(data) ? data : []);
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
        <TouchableOpacity style={styles.appBarBtn} onPress={() => setIsSidebarOpen(true)}>
          <Icon name="menu" size={28} color="#0F172A" />
        </TouchableOpacity>
        
        <View style={styles.headerLogoContainer}>
          <Icon name="import-contacts" size={32} color="#F97316" style={{ marginRight: 8 }} />
          <View>
            <Text style={{ fontSize: 13, fontWeight: '900', color: '#1E293B', letterSpacing: 0.5, lineHeight: 16 }}>SRI KRISHNA</Text>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#1E293B', lineHeight: 14 }}>INSTITUTIONS</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.appBarBtn} onPress={() => navigation.navigate('Notifications')}>
          <View style={{position: 'relative', width: 44, height: 44, borderRadius: 22, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <Icon name="notifications-none" size={24} color="#0F172A" />
            <View style={styles.notificationDot} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Welcome Banner */}
        <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.welcomeContainer}>
          <LinearGradient 
            colors={['#FFF5ED', '#FFE4D6']} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }} 
            style={styles.welcomeCard}
          >
            <View style={styles.buildingBg}>
              <Icon name="location-city" size={160} color="rgba(249, 115, 22, 0.12)" />
            </View>
            <View style={{ zIndex: 2 }}>
              <Text style={styles.greeting}>Good Morning,</Text>
              <Text style={styles.name}>{getFormatName(facultyName)}</Text>
              
              <View style={styles.departmentBadge}>
                <Icon name="business" size={16} color="#F97316" style={{ marginRight: 6 }} />
                <Text style={styles.departmentText}>{facultyDept} Department</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Actions Grid */}
        <Animated.View entering={FadeInUp.delay(150).duration(500)} style={styles.gridContainer}>
          <View style={styles.rowGrid}>
            <TouchableOpacity style={styles.gridItem}>
              <View style={styles.gridIconBox}>
                <Icon name="qr-code-scanner" size={26} color="#F97316" />
              </View>
              <Text style={styles.gridTitle}>Mark</Text>
              <Text style={styles.gridSubtitle}>Attendance</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridItem}>
              <View style={styles.gridIconBox}>
                <Icon name="calendar-today" size={26} color="#F97316" />
              </View>
              <Text style={styles.gridTitle}>My</Text>
              <Text style={styles.gridSubtitle}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridItem}>
              <View style={styles.gridIconBox}>
                <Icon name="bar-chart" size={26} color="#F97316" />
              </View>
              <Text style={styles.gridTitle}>Attendance</Text>
              <Text style={styles.gridSubtitle}>Summary</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridItem}>
              <View style={styles.gridIconBox}>
                <Icon name="event-note" size={26} color="#F97316" />
                <View style={styles.leaveTickBadge}>
                   <Icon name="check-circle" size={12} color="#ffffff" />
                </View>
              </View>
              <Text style={styles.gridTitle}>Leave</Text>
              <Text style={styles.gridSubtitle}>Request</Text>
            </TouchableOpacity>
          </View>
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
            (showAllClasses ? classes : classes.filter(cls => getClassStatus(cls.period) !== 'past')).length === 0 ? (
               <View style={[styles.classCard, { alignItems: 'center', padding: 30 }]}>
                 <Icon name="check-circle" size={48} color="#4ADE80" />
                 <Text style={{ marginTop: 10, color: '#64748B', fontWeight: '600' }}>All classes completed for today!</Text>
               </View>
            ) : (
              (showAllClasses ? classes : classes.filter(cls => getClassStatus(cls.period) !== 'past')).map((cls, index) => {
                const timeSlots = ['08:45 AM - 09:40 AM', '09:40 AM - 10:35 AM', '10:50 AM - 11:45 AM', '11:45 AM - 12:40 PM', '01:30 PM - 02:25 PM', '02:25 PM - 03:20 PM', '03:20 PM - 04:15 PM'];
                const timeString = timeSlots[cls.period - 1] || `Period ${cls.period}`;
                const status = getClassStatus(cls.period);
                const isOngoing = status === 'ongoing';
                const isPast = status === 'past';
                
                return (
                  <TouchableOpacity 
                    key={cls.id} 
                    activeOpacity={0.8}
                    onPress={() => {
                      if (isOngoing) {
                        navigation.navigate('StudentDirectoryList', { 
                          classDetails: { subject: cls.Subject ? cls.Subject.title : 'Subject', className: cls.section } 
                        });
                      } else {
                        Alert.alert("Time Restricted", "Attendance marking is strictly time-based. You can only mark attendance during the active ongoing class period.");
                      }
                    }}
                    style={[styles.classCard, isPast && { opacity: 0.7, borderColor: '#CBD5E1' }]}
                  >
                    <View style={styles.classTopRow}>
                      <View style={styles.timeBadge}>
                        <Icon name="access-time" size={14} color={isPast ? "#94A3B8" : "#F97316"} style={{marginRight: 6}} />
                        <Text style={[styles.timeText, isPast && { color: '#94A3B8' }]}>{timeString}</Text>
                      </View>
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        {isOngoing && <View style={styles.ongoingBadge}><Text style={styles.ongoingText}>ONGOING</Text></View>}
                        {isPast && <View style={[styles.ongoingBadge, { backgroundColor: '#94A3B8' }]}><Text style={styles.ongoingText}>COMPLETED</Text></View>}
                        <View style={styles.sectionBadge}><Text style={styles.sectionText}>{cls.section}</Text></View>
                      </View>
                    </View>

                    <Text style={styles.classTitle}>{cls.Subject ? cls.Subject.title : 'Subject Title'}</Text>
                    
                    <View style={styles.classBottomRow}>
                      <View style={styles.classDetailsBox}>
                        <View style={styles.detailItem}>
                          <Icon name="badge" size={18} color="#94A3B8" />
                          <View style={{marginLeft: 12}}>
                            <Text style={styles.detailValue}>{cls.Subject ? cls.Subject.code : '-'}</Text>
                            <Text style={styles.detailLabel}>Course Code</Text>
                          </View>
                        </View>
                        <View style={styles.detailDivider} />
                        <View style={styles.detailItem}>
                          <Icon name="business" size={18} color="#94A3B8" />
                          <View style={{marginLeft: 12}}>
                            <Text style={styles.detailValue}>{facultyDept} Block</Text>
                            <Text style={styles.detailLabel}>Location</Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.arrowButton}>
                        <Icon name="arrow-forward" size={24} color="#F97316" />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )
          )}
          
          {classes.length > 0 && !isHoliday && (
            <TouchableOpacity style={styles.seeAllBtn} onPress={() => setShowAllClasses(!showAllClasses)}>
              <Text style={styles.seeAllText}>
                {showAllClasses ? 'Hide Past Schedule' : 'See All Classes'}
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Attendance Overview */}
        <Animated.View entering={FadeInUp.delay(250).duration(500)} style={styles.overviewSection}>
          <View style={styles.sectionHeader}>
             <Text style={styles.sectionTitleLabel}>Attendance Overview</Text>
             <TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
          </View>
          <View style={styles.overviewCard}>
             <View style={styles.progressCircleWrap}>
               <View style={styles.progressCircle}>
                 <Text style={styles.progressValue}>92%</Text>
                 <Text style={styles.progressLabel}>Present</Text>
               </View>
             </View>
             
             <View style={styles.statBlocks}>
               <View style={styles.statBlock}>
                 <Text style={[styles.statValue, {color: '#16A34A'}]}>23</Text>
                 <View style={styles.statLabelRow}>
                    <View style={[styles.dot, {backgroundColor: '#16A34A'}]} />
                    <Text style={styles.statLabelText}>Present</Text>
                 </View>
               </View>
               <View style={styles.statBlock}>
                 <Text style={[styles.statValue, {color: '#EF4444'}]}>02</Text>
                 <View style={styles.statLabelRow}>
                    <View style={[styles.dot, {backgroundColor: '#EF4444'}]} />
                    <Text style={styles.statLabelText}>Absent</Text>
                 </View>
               </View>
               <View style={styles.statBlock}>
                 <Text style={[styles.statValue, {color: '#F59E0B'}]}>01</Text>
                 <View style={styles.statLabelRow}>
                    <View style={[styles.dot, {backgroundColor: '#F59E0B'}]} />
                    <Text style={styles.statLabelText}>Late</Text>
                 </View>
               </View>
             </View>
          </View>
        </Animated.View>

        {/* Daily Wisdom */}
        <Animated.View entering={FadeInUp.delay(300).duration(500)} style={styles.wisdomSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitleLabel, { color: '#F97316' }]}>Daily Wisdom</Text>
            <Icon name="format-quote" size={32} color="rgba(249, 115, 22, 0.4)" />
          </View>
          <View style={styles.wisdomCard}>
             <Text style={styles.wisdomQuote}>"{dailyQuote}"</Text>
             <Text style={styles.wisdomAuthor}>- ClassTrack Inspiration</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Navigation (Mockup overlay) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
           <Icon name="description" size={26} color="#94A3B8" />
           <Text style={styles.navText}>Logs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItemActive}>
           <Icon name="home" size={26} color="#F97316" />
           <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
           <Icon name="person-outline" size={26} color="#94A3B8" />
           <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>

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
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#1E293B' }}>SRI KRISHNA</Text>
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
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, backgroundColor: '#FAFAFA' },
  appBarBtn: { padding: 4 },
  headerLogoContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  notificationDot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1, borderColor: '#ffffff' },
  
  welcomeContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  welcomeCard: { borderRadius: 28, padding: 28, overflow: 'hidden', shadowColor: '#F97316', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 8 },
  buildingBg: { position: 'absolute', right: -30, bottom: -20, opacity: 0.8 },
  greeting: { fontSize: 15, color: '#334155', fontWeight: '600', marginBottom: 4 },
  name: { fontSize: 28, fontWeight: '900', color: '#0F172A', marginBottom: 20, letterSpacing: -0.5 },
  departmentBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF0E5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#FFE4D6' },
  departmentText: { fontSize: 13, color: '#F97316', fontWeight: '700' },
  
  gridContainer: { paddingHorizontal: 20, marginTop: 15 },
  rowGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  gridItem: { flex: 1, backgroundColor: '#ffffff', paddingVertical: 18, paddingHorizontal: 8, borderRadius: 24, marginHorizontal: 4, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: '#F8FAFC' },
  gridIconBox: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#FFF5ED', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  gridTitle: { fontSize: 13, fontWeight: '800', color: '#1E293B', textAlign: 'center' },
  gridSubtitle: { fontSize: 11, color: '#64748B', fontWeight: '600', textAlign: 'center', marginTop: 2 },
  leaveTickBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#F97316', borderRadius: 10, borderWidth: 2, borderColor: '#FFF5ED' },

  scheduleSection: { paddingHorizontal: 20, marginTop: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitleLabel: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  dayOrderBadge: { backgroundColor: '#FFF5ED', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  dayOrderText: { color: '#F97316', fontSize: 12, fontWeight: '700' },
  
  classCard: { backgroundColor: '#ffffff', borderRadius: 28, padding: 24, borderWidth: 1.5, borderColor: '#F97316', shadowColor: '#F97316', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 6, marginBottom: 16 },
  classTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  timeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5ED', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  timeText: { color: '#F97316', fontSize: 13, fontWeight: '800' },
  ongoingBadge: { backgroundColor: '#F97316', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8 },
  ongoingText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
  sectionBadge: { backgroundColor: '#3B82F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  sectionText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
  
  classTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 24, lineHeight: 28 },
  classBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  classDetailsBox: { flex: 1, flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 20, marginRight: 16 },
  detailItem: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  detailValue: { fontSize: 13, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  detailLabel: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  detailDivider: { width: 1, height: 24, backgroundColor: '#E2E8F0', marginHorizontal: 12 },
  arrowButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFF5ED', justifyContent: 'center', alignItems: 'center' },

  seeAllBtn: { alignSelf: 'center', paddingVertical: 8, marginTop: -4 },
  seeAllText: { color: '#F97316', fontSize: 14, fontWeight: '700' },

  overviewSection: { paddingHorizontal: 20, marginTop: 24 },
  viewAllText: { color: '#F97316', fontSize: 14, fontWeight: '700' },
  overviewCard: { flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 28, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 4 },
  progressCircleWrap: { marginRight: 24 },
  progressCircle: { width: 90, height: 90, borderRadius: 45, borderWidth: 6, borderColor: '#F97316', borderTopColor: '#FFE4D6', justifyContent: 'center', alignItems: 'center', transform: [{ rotate: '45deg' }] },
  progressValue: { fontSize: 20, fontWeight: '900', color: '#0F172A', transform: [{ rotate: '-45deg' }] },
  progressLabel: { fontSize: 11, color: '#64748B', fontWeight: '600', transform: [{ rotate: '-45deg' }], marginTop: -2 },
  
  statBlocks: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  statBlock: { alignItems: 'center', backgroundColor: '#F8FAFC', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 16, minWidth: 60 },
  statValue: { fontSize: 18, fontWeight: '900', marginBottom: 6 },
  statLabelRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  statLabelText: { fontSize: 10, color: '#64748B', fontWeight: '600' },

  wisdomSection: { paddingHorizontal: 20, marginTop: 32 },
  wisdomCard: { backgroundColor: '#ffffff', borderRadius: 28, padding: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 4 },
  wisdomQuote: { fontSize: 17, color: '#334155', fontStyle: 'italic', lineHeight: 28, fontWeight: '500', marginBottom: 16 },
  wisdomAuthor: { fontSize: 13, color: '#94A3B8', fontWeight: '700', textAlign: 'right' },

  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#ffffff', paddingVertical: 16, paddingHorizontal: 32, justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: 30, borderTopRightRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 15, paddingBottom: Platform.OS === 'ios' ? 32 : 16 },
  navItem: { alignItems: 'center', padding: 8 },
  navText: { fontSize: 11, color: '#94A3B8', fontWeight: '600', marginTop: 4 },
  navItemActive: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5ED', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24 },
  navTextActive: { fontSize: 13, color: '#F97316', fontWeight: '800', marginLeft: 8 },

  sidebarOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', zIndex: 99 },
  sidebarContainer: { position: 'absolute', top: 0, left: 0, bottom: 0, width: width * 0.75, backgroundColor: '#ffffff', zIndex: 100, borderTopRightRadius: 30, borderBottomRightRadius: 30, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 40 },
  sidebarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sidebarMenu: { padding: 24 },
  sidebarMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  sidebarMenuText: { fontSize: 16, fontWeight: '700', color: '#64748B', marginLeft: 16 },
  sidebarDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24, width: '100%', alignItems: 'center' },
  modalIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(239, 68, 68, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  modalBtnRow: { flexDirection: 'row', width: '100%' },
  modalCancelBtn: { flex: 1, paddingVertical: 14, backgroundColor: '#F1F5F9', borderRadius: 12, alignItems: 'center', marginRight: 8 },
  modalCancelText: { color: '#64748B', fontWeight: '700', fontSize: 15 },
  modalConfirmBtn: { flex: 1, paddingVertical: 14, backgroundColor: Colors.error, borderRadius: 12, alignItems: 'center', marginLeft: 8 },
  modalConfirmText: { color: '#ffffff', fontWeight: '700', fontSize: 15 }
});
