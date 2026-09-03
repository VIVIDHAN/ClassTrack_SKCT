import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, StatusBar, Image, ScrollView, Dimensions, Pressable, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInUp, FadeInRight, SlideInLeft, SlideOutLeft, Easing } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../constants/Colors';
import { API_BASE_URL } from '../constants/Config';
import { PERIOD_SCHEDULE, getTeacherFullTimetableFallback } from '../constants/DummyData';

const { width, height } = Dimensions.get('window');

type ViewMode = 'grid' | 'classes';

export default function Dashboard() {
  const navigation = useNavigation<any>();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [facultyName, setFacultyName] = useState('Ms. B Narmatha');
  const [facultyDept, setFacultyDept] = useState('Information Technology');
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Auto-refresh clock every 15 seconds to update ongoing/upcoming states accurately
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const todayDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

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
      let currentTeacher = { id: 3, name: 'Ms. B Narmatha', department: 'Information Technology' };
      const loadTeacherDashboard = async () => {
        try {
          const stored = await AsyncStorage.getItem('loggedInTeacher');
          if (stored) {
            currentTeacher = JSON.parse(stored);
            setFacultyName(currentTeacher.name);
            setFacultyDept(currentTeacher.department || 'Information Technology');
          }
          const teacherId = currentTeacher.id || 3;

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);

          // Fetch all timetable slots for this teacher across all days
          const res = await fetch(`${API_BASE_URL}/timetable?teacher_id=${teacherId}`, { signal: controller.signal });
          clearTimeout(timeoutId);
          const data = await res.json();

          if (Array.isArray(data) && data.length > 0) {
            setAllClasses(data);
          } else {
            setAllClasses(getTeacherFullTimetableFallback(teacherId, currentTeacher.name));
          }
        } catch (err) {
          console.log('Failed to fetch faculty timetable:', err);
          setAllClasses(getTeacherFullTimetableFallback(currentTeacher?.id || 3, currentTeacher?.name));
        }
      };

      loadTeacherDashboard();
    }, [])
  );

  // Evaluate ongoing and upcoming classes according to current local time
  const scheduleState = useMemo(() => {
    const jsDay = currentTime.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
    const isWeekend = jsDay === 0 || jsDay === 6;
    const currentDay = isWeekend ? 1 : jsDay;
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

    // Classes for today (only if not weekend)
    const todayRaw = !isWeekend ? allClasses.filter((c: any) => c.day === currentDay) : [];

    const enrichedToday = todayRaw.map((item: any) => {
      const sched = PERIOD_SCHEDULE[item.period] || {
        period: item.period,
        label: `Period ${item.period}`,
        startMinutes: item.period * 60,
        endMinutes: (item.period + 1) * 60,
        startTimeStr: '',
        endTimeStr: '',
        timeRange: `Period ${item.period}`
      };
      return {
        id: String(item.id),
        period: item.period,
        className: item.section,
        section: item.section,
        subject: item.Subject ? item.Subject.title : (item.subject || 'IT Course'),
        room: `Room 20${item.period || 4}`,
        timeRange: sched.timeRange,
        startTimeStr: sched.startTimeStr,
        endTimeStr: sched.endTimeStr,
        startMinutes: sched.startMinutes,
        endMinutes: sched.endMinutes,
        timetable_id: item.id
      };
    }).sort((a: any, b: any) => a.startMinutes - b.startMinutes);

    // Find Ongoing Class
    let ongoing: any = null;
    for (const c of enrichedToday) {
      if (currentMinutes >= c.startMinutes && currentMinutes < c.endMinutes) {
        const minsLeft = c.endMinutes - currentMinutes;
        ongoing = {
          ...c,
          timeStatus: `Ends in ${minsLeft}m`,
          minsLeft
        };
        break;
      }
    }

    // Find Upcoming Class today
    let upcoming: any = null;
    for (const c of enrichedToday) {
      if (currentMinutes < c.startMinutes) {
        const minsUntil = c.startMinutes - currentMinutes;
        upcoming = {
          ...c,
          timeStatus: minsUntil <= 60 ? `Starts in ${minsUntil}m` : `Starts at ${c.startTimeStr}`,
          minsUntil
        };
        break;
      }
    }

    const allCompletedToday = enrichedToday.length > 0 && !ongoing && !upcoming;
    const noClassesToday = !isWeekend && enrichedToday.length === 0;

    // Find Next Class on future days if today has no upcoming class or if weekend / all done
    let nextSession: any = null;
    if (!upcoming || isWeekend || noClassesToday) {
      const dayNames: Record<number, string> = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday' };
      for (let offset = 1; offset <= 5; offset++) {
        const targetDay = ((currentDay - 1 + offset) % 5) + 1;
        const futureClasses = allClasses
          .filter((c: any) => c.day === targetDay)
          .sort((a: any, b: any) => a.period - b.period);

        if (futureClasses.length > 0) {
          const firstNext = futureClasses[0];
          const sched = PERIOD_SCHEDULE[firstNext.period] || { timeRange: `Period ${firstNext.period}`, startTimeStr: '' };
          nextSession = {
            id: String(firstNext.id),
            period: firstNext.period,
            className: firstNext.section,
            section: firstNext.section,
            subject: firstNext.Subject ? firstNext.Subject.title : (firstNext.subject || 'IT Course'),
            room: `Room 20${firstNext.period || 4}`,
            timeRange: sched.timeRange,
            startTimeStr: sched.startTimeStr,
            dayName: dayNames[targetDay],
            isTomorrow: offset === 1 && !isWeekend,
            timetable_id: firstNext.id
          };
          break;
        }
      }
    }

    return {
      ongoing,
      upcoming,
      isWeekend,
      allCompletedToday,
      noClassesToday,
      nextSession,
      todayClassCount: enrichedToday.length
    };
  }, [allClasses, currentTime]);
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
              <View style={styles.greetingRow}>
                <Text style={styles.greeting}>Good Morning,</Text>
                <View style={styles.dateBadge}>
                  <Icon name="event" size={13} color={Colors.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.dateText}>{todayDate}</Text>
                </View>
              </View>
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
            style={styles.fullWidthCard} 
            onPress={() => navigation.navigate('ClassesList', { mode: 'attendance' })}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.gridIconWrap, { backgroundColor: '#E0F2FE', marginBottom: 0, marginRight: 16 }]}>
                <Icon name="fact-check" size={28} color="#0284C7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.gridTitle}>Mark Attendance</Text>
                <Text style={styles.gridSubtitle}>Select a class to mark</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#94A3B8" />
            </View>
          </TouchableOpacity>

          <View style={styles.rowGrid}>
            <TouchableOpacity 
              style={styles.gridBox} 
              onPress={() => navigation.navigate('History')}
              activeOpacity={0.8}
            >
              <View style={[styles.gridIconWrap, { backgroundColor: '#FEE2E2' }]}>
                <Icon name="history" size={26} color="#EF4444" />
              </View>
              <Text style={styles.gridTitle}>Logs</Text>
              <Text style={styles.gridSubtitle}>View reports</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.gridBox} 
              onPress={() => navigation.navigate('ClassesList', { mode: 'directory' })}
              activeOpacity={0.8}
            >
              <View style={[styles.gridIconWrap, { backgroundColor: '#DCFCE7' }]}>
                <Icon name="people" size={26} color="#10B981" />
              </View>
              <Text style={styles.gridTitle}>Directory</Text>
              <Text style={styles.gridSubtitle}>Student info</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.rowGrid, { marginTop: 12 }]}>
            <TouchableOpacity 
              style={styles.gridBox} 
              onPress={() => navigation.navigate('Notify')}
              activeOpacity={0.8}
            >
              <View style={[styles.gridIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Icon name="campaign" size={26} color="#F59E0B" />
              </View>
              <Text style={styles.gridTitle}>Notify</Text>
              <Text style={styles.gridSubtitle}>Call & SMS absentees</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.gridBox} 
              onPress={() => navigation.navigate('FacultyTimetable')}
              activeOpacity={0.8}
            >
              <View style={[styles.gridIconWrap, { backgroundColor: '#EEF2FF' }]}>
                <Icon name="calendar-month" size={26} color="#4F46E5" />
              </View>
              <Text style={styles.gridTitle}>My Timetable</Text>
              <Text style={styles.gridSubtitle}>Weekly schedule</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Class Schedule (Ongoing & Upcoming) */}
        <Animated.View entering={FadeInUp.delay(150).duration(500)} style={styles.upcomingContainer}>
          <View style={styles.scheduleSectionHeader}>
            <Text style={styles.sectionTitleLabel}>Class Schedule</Text>
            <View style={styles.liveClockBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.liveClockText}>
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>

          {/* 1. ONGOING CLASS CARD */}
          {scheduleState.ongoing && (
            <TouchableOpacity 
              style={[styles.upcomingCard, styles.ongoingCardBorder]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Attendance', {
                classDetails: {
                  id: scheduleState.ongoing.id,
                  className: scheduleState.ongoing.section,
                  subject: scheduleState.ongoing.subject,
                  time: scheduleState.ongoing.timeRange,
                  timetable_id: scheduleState.ongoing.timetable_id
                }
              })}
            >
              <View style={styles.upcomingHeader}>
                <View style={styles.ongoingBadge}>
                  <View style={styles.ongoingDot} />
                  <Text style={styles.ongoingBadgeText}>ONGOING NOW</Text>
                </View>
                <View style={styles.timeRemainingBadge}>
                  <Icon name="timer" size={14} color="#059669" style={{ marginRight: 4 }} />
                  <Text style={styles.timeRemainingText}>{scheduleState.ongoing.timeStatus}</Text>
                </View>
              </View>

              <Text style={styles.upcomingSubject}>{scheduleState.ongoing.subject}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaChip}>
                  <Icon name="groups" size={15} color={Colors.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.metaChipText}>{scheduleState.ongoing.section}</Text>
                </View>
                <View style={styles.metaChip}>
                  <Icon name="access-time" size={15} color="#475569" style={{ marginRight: 4 }} />
                  <Text style={styles.metaChipText}>{scheduleState.ongoing.timeRange}</Text>
                </View>
              </View>

              <View style={styles.cardBottomActionRow}>
                <View style={styles.roomWrap}>
                  <Icon name="door-front" size={18} color="#64748B" style={{ marginRight: 4 }} />
                  <Text style={styles.roomText}>{scheduleState.ongoing.room} • IT Block</Text>
                </View>
                <View style={styles.takeAttendanceInlineBtn}>
                  <Text style={styles.takeAttendanceInlineText}>Mark Attendance</Text>
                  <Icon name="chevron-right" size={16} color="#ffffff" />
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* 2. UPCOMING CLASS CARD */}
          {scheduleState.upcoming && (
            <TouchableOpacity 
              style={[styles.upcomingCard, scheduleState.ongoing && { marginTop: 14 }]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Attendance', {
                classDetails: {
                  id: scheduleState.upcoming.id,
                  className: scheduleState.upcoming.section,
                  subject: scheduleState.upcoming.subject,
                  time: scheduleState.upcoming.timeRange,
                  timetable_id: scheduleState.upcoming.timetable_id
                }
              })}
            >
              <View style={styles.upcomingHeader}>
                <View style={styles.upcomingBadge}>
                  <Icon name="schedule" size={15} color={Colors.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.upcomingBadgeText}>UPCOMING</Text>
                </View>
                <View style={styles.countdownBadge}>
                  <Text style={styles.countdownBadgeText}>{scheduleState.upcoming.timeStatus}</Text>
                </View>
              </View>

              <Text style={styles.upcomingSubject}>{scheduleState.upcoming.subject}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaChip}>
                  <Icon name="groups" size={15} color={Colors.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.metaChipText}>{scheduleState.upcoming.section}</Text>
                </View>
                <View style={styles.metaChip}>
                  <Icon name="access-time" size={15} color="#475569" style={{ marginRight: 4 }} />
                  <Text style={styles.metaChipText}>{scheduleState.upcoming.timeRange}</Text>
                </View>
              </View>

              <View style={styles.upcomingFooter}>
                <View style={styles.footerItem}>
                  <Icon name="door-front" size={18} color="#64748B" />
                  <Text style={styles.footerItemText}>{scheduleState.upcoming.room}</Text>
                </View>
                <View style={styles.footerDivider} />
                <View style={styles.footerItem}>
                  <Icon name="domain" size={18} color="#64748B" />
                  <Text style={styles.footerItemText}>IT Block, 2nd Floor</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* 3. ALL CLASSES COMPLETED TODAY */}
          {!scheduleState.ongoing && !scheduleState.upcoming && scheduleState.allCompletedToday && (
            <View style={styles.statusCard}>
              <View style={styles.statusCardHeader}>
                <View style={[styles.statusIconBox, { backgroundColor: '#DCFCE7' }]}>
                  <Icon name="check-circle" size={26} color="#16A34A" />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.statusCardTitle}>Today's Sessions Complete</Text>
                  <Text style={styles.statusCardSubtitle}>
                    All {scheduleState.todayClassCount} scheduled classes for today have concluded.
                  </Text>
                </View>
              </View>
              {scheduleState.nextSession && (
                <View style={styles.nextSessionBanner}>
                  <Icon name="event" size={18} color={Colors.primary} style={{ marginRight: 8 }} />
                  <Text style={styles.nextSessionText}>
                    Next Session: <Text style={{ fontWeight: '800', color: '#0F172A' }}>{scheduleState.nextSession.isTomorrow ? 'Tomorrow' : scheduleState.nextSession.dayName}</Text> • Period {scheduleState.nextSession.period} ({scheduleState.nextSession.timeRange}) • {scheduleState.nextSession.subject}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* 4. NO CLASSES TODAY / WEEKEND */}
          {!scheduleState.ongoing && !scheduleState.upcoming && !scheduleState.allCompletedToday && (
            <View style={styles.statusCard}>
              <View style={styles.statusCardHeader}>
                <View style={[styles.statusIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <Icon name={scheduleState.isWeekend ? 'weekend' : 'event-available'} size={26} color="#D97706" />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.statusCardTitle}>
                    {scheduleState.isWeekend ? 'Weekend Break' : 'No Classes Scheduled Today'}
                  </Text>
                  <Text style={styles.statusCardSubtitle}>
                    {scheduleState.isWeekend ? 'No sessions scheduled on weekends.' : 'No timetable periods assigned for today.'}
                  </Text>
                </View>
              </View>
              {scheduleState.nextSession && (
                <View style={styles.nextSessionBanner}>
                  <Icon name="event" size={18} color={Colors.primary} style={{ marginRight: 8 }} />
                  <Text style={styles.nextSessionText}>
                    Upcoming: <Text style={{ fontWeight: '800', color: '#0F172A' }}>{scheduleState.nextSession.dayName}</Text> • Period {scheduleState.nextSession.period} ({scheduleState.nextSession.timeRange}) • {scheduleState.nextSession.subject}
                  </Text>
                </View>
              )}
            </View>
          )}
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
                  navigation.navigate('FacultyTimetable');
                }}
              >
                <Icon name="calendar-month" size={24} color="#64748B" />
                <Text style={styles.sidebarMenuText}>My Timetable</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.sidebarMenuItem} 
                onPress={() => {
                  setIsSidebarOpen(false);
                  navigation.navigate('Notify');
                }}
              >
                <Icon name="campaign" size={24} color="#64748B" />
                <Text style={styles.sidebarMenuText}>Notify Parents</Text>
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
  greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 14, color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.5 },
  dateBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  dateText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  name: { fontSize: 26, fontWeight: '900', color: '#0F172A', marginTop: 6, marginBottom: 16, letterSpacing: -0.5 },
  departmentBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 93, 56, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start' },
  subtitle: { fontSize: 13, color: Colors.primary, fontWeight: '700' },
  
  gridContainer: { paddingHorizontal: 20, marginTop: 10 },
  fullWidthCard: { backgroundColor: '#ffffff', borderColor: '#F1F5F9', padding: 20, borderRadius: 24, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2, marginBottom: 14 },
  rowGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  gridBox: { flex: 1, backgroundColor: '#ffffff', borderColor: '#F1F5F9', padding: 18, borderRadius: 24, marginHorizontal: 6, borderWidth: 1, alignItems: 'flex-start', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
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
  scheduleSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  liveClockBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  pulseDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#10B981', marginRight: 6 },
  liveClockText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  upcomingCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 4 },
  ongoingCardBorder: { borderColor: '#10B981', borderWidth: 1.5, shadowColor: '#10B981', shadowOpacity: 0.12 },
  upcomingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  upcomingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 93, 56, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  upcomingBadgeText: { color: Colors.primary, fontSize: 13, fontWeight: '700' },
  ongoingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  ongoingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 6 },
  ongoingBadgeText: { color: '#059669', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  timeRemainingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#A7F3D0' },
  timeRemainingText: { color: '#047857', fontSize: 12, fontWeight: '700' },
  countdownBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  countdownBadgeText: { color: '#475569', fontSize: 12, fontWeight: '700' },
  upcomingSubject: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 14, lineHeight: 28 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' },
  metaChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', marginRight: 8, marginBottom: 4 },
  metaChipText: { fontSize: 12.5, fontWeight: '700', color: '#334155' },
  cardBottomActionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  roomWrap: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  roomText: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  takeAttendanceInlineBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 3 },
  takeAttendanceInlineText: { color: '#ffffff', fontWeight: '700', fontSize: 13, marginRight: 2 },
  statusCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 22, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  statusCardHeader: { flexDirection: 'row', alignItems: 'center' },
  statusIconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  statusCardTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  statusCardSubtitle: { fontSize: 13, color: '#64748B', lineHeight: 18 },
  nextSessionBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 14, marginTop: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  nextSessionText: { fontSize: 12.5, color: '#475569', flex: 1, lineHeight: 17 },
  attendanceBadge: { backgroundColor: Colors.success, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  attendanceBadgeText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
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
