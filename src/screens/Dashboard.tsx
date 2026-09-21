import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
  ScrollView,
  Dimensions,
  Pressable,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInUp, FadeInRight, SlideInLeft, SlideOutLeft, Easing } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../constants/Colors';
import { API_BASE_URL, fetchWithTimeout } from '../constants/Config';
import { PERIOD_SCHEDULE, getTeacherFullTimetableFallback } from '../constants/DummyData';
import { getTodayDayOrder } from '../constants/AcademicCalendar';
import BreatheLoader from '../components/BreatheLoader';
import { PillButton } from '../components/PillButton';
import { PillChip } from '../components/PillChip';

const { width, height } = Dimensions.get('window');

export default function Dashboard() {
  const navigation = useNavigation<any>();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [facultyName, setFacultyName] = useState('Ms. B Narmatha');
  const [facultyDept, setFacultyDept] = useState('Information Technology');
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayDayOrder, setTodayDayOrder] = useState<number>(getTodayDayOrder());
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  // Auto-refresh clock every 15 seconds to update ongoing/upcoming states accurately
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const formattedDateAndDay = currentTime.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
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
        setScheduleLoading(true);
        try {
          const stored = await AsyncStorage.getItem('loggedInTeacher');
          if (stored) {
            currentTeacher = JSON.parse(stored);
            setFacultyName(currentTeacher.name);
            setFacultyDept(currentTeacher.department || 'Information Technology');
          }
          const teacherId = currentTeacher.id || 3;

          const expectedDayOrder = getTodayDayOrder();
          setTodayDayOrder(expectedDayOrder);
          try {
            const dayRes = await fetchWithTimeout(`${API_BASE_URL}/day-order`, {}, 2500);
            if (dayRes.ok) {
              const dayData = await dayRes.json();
              if (dayData && dayData.day_order && dayData.day_order === expectedDayOrder) {
                setTodayDayOrder(dayData.day_order);
              }
            }
          } catch (e) {}

          try {
            const res = await fetchWithTimeout(`${API_BASE_URL}/timetable?teacher_id=${teacherId}`, {}, 3500);
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data) && data.length > 0) {
                setAllClasses(data);
                return;
              }
            }
            setAllClasses(getTeacherFullTimetableFallback(teacherId, currentTeacher.name));
          } catch (err) {
            console.log('Failed to fetch faculty timetable:', err);
            setAllClasses(getTeacherFullTimetableFallback(teacherId, currentTeacher.name));
          }
        } catch (err) {
          console.log('Failed to fetch faculty timetable outer:', err);
          setAllClasses(getTeacherFullTimetableFallback(currentTeacher?.id || 3, currentTeacher?.name));
        } finally {
          setScheduleLoading(false);
        }
      };

      loadTeacherDashboard();
    }, [])
  );

  // Evaluate ongoing and upcoming classes according to active DB Day Order
  const scheduleState = useMemo(() => {
    const jsDay = currentTime.getDay();
    const isWeekend = jsDay === 0 || jsDay === 6;
    const currentDay = isWeekend ? 1 : todayDayOrder;
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

    const todayRaw = !isWeekend ? allClasses.filter((c: any) => c.day === currentDay) : [];

    const enrichedToday = todayRaw
      .map((item: any) => {
        const sched = PERIOD_SCHEDULE[item.period] || {
          period: item.period,
          label: `Period ${item.period}`,
          startMinutes: item.period * 60,
          endMinutes: (item.period + 1) * 60,
          startTimeStr: '',
          endTimeStr: '',
          timeRange: `Period ${item.period}`,
        };
        return {
          id: String(item.id),
          period: item.period,
          className: item.section || item.className || 'III IT G',
          section: item.section || item.className || 'III IT G',
          subject: item.Subject ? item.Subject.title : item.subject || 'IT Course',
          room: 'C6 16',
          timeRange: sched.timeRange,
          startTimeStr: sched.startTimeStr,
          endTimeStr: sched.endTimeStr,
          startMinutes: sched.startMinutes,
          endMinutes: sched.endMinutes,
          timetable_id: item.id,
        };
      })
      .sort((a: any, b: any) => a.startMinutes - b.startMinutes);

    let ongoing: any = null;
    for (const c of enrichedToday) {
      if (currentMinutes >= c.startMinutes && currentMinutes < c.endMinutes) {
        const minsLeft = c.endMinutes - currentMinutes;
        ongoing = { ...c, timeStatus: `Ends in ${minsLeft}m`, minsLeft };
        break;
      }
    }

    let upcoming: any = null;
    for (const c of enrichedToday) {
      if (currentMinutes < c.startMinutes) {
        const minsUntil = c.startMinutes - currentMinutes;
        upcoming = {
          ...c,
          timeStatus: minsUntil <= 60 ? `Starts in ${minsUntil}m` : `Starts at ${c.startTimeStr}`,
          minsUntil,
        };
        break;
      }
    }

    const allCompletedToday = enrichedToday.length > 0 && !ongoing && !upcoming;
    const noClassesToday = !isWeekend && enrichedToday.length === 0;

    let timelineItems: any[] = [];
    if (enrichedToday.length > 0) {
      let upcomingIndex = 0;
      timelineItems = enrichedToday.map((item: any) => {
        let status: 'Ongoing' | 'Upcoming' | 'Completed' = 'Upcoming';
        if (currentMinutes >= item.startMinutes && currentMinutes < item.endMinutes) {
          status = 'Ongoing';
        } else if (currentMinutes >= item.endMinutes) {
          status = 'Completed';
        }

        let dotColor = Colors.primary;
        let badgeBorder = Colors.primary;
        let badgeBg = '#FFF7ED';
        let badgeTextColor = Colors.primary;

        if (status === 'Ongoing') {
          dotColor = Colors.primary;
          badgeBorder = Colors.primary;
          badgeBg = '#FFF7ED';
          badgeTextColor = Colors.primary;
        } else if (status === 'Upcoming') {
          if (upcomingIndex === 0) {
            dotColor = '#F59E0B';
            badgeBorder = '#F59E0B';
            badgeBg = '#FEF3C7';
            badgeTextColor = '#D97706';
          } else {
            dotColor = Colors.primaryLight;
            badgeBorder = Colors.primaryLight;
            badgeBg = '#FFF7ED';
            badgeTextColor = Colors.primaryDark;
          }
          upcomingIndex++;
        } else {
          dotColor = '#94A3B8';
          badgeBorder = '#CBD5E1';
          badgeBg = '#F8FAFC';
          badgeTextColor = '#64748B';
        }

        return {
          ...item,
          status,
          dotColor,
          badgeBorder,
          badgeBg,
          badgeTextColor,
          roomLabel: item.room ? `${item.room}, Block A` : 'Room 301, Block A',
        };
      });
    }

    return {
      ongoing,
      upcoming,
      isWeekend,
      allCompletedToday,
      noClassesToday,
      timelineItems,
      todayClassCount: enrichedToday.length,
    };
  }, [allClasses, currentTime, todayDayOrder]);

  return (
    <SafeAreaView style={styles.container}>
      {/* AppBar Header */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.appBarBtn} onPress={() => setIsSidebarOpen(true)}>
          <Icon name="menu" size={26} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerLogoContainer}>
          <Image source={require('../assets/logo.png')} style={styles.headerLogo} resizeMode="contain" />
        </View>

        <TouchableOpacity style={styles.appBarBtn} onPress={() => navigation.navigate('Notifications')}>
          <Icon name="notifications-none" size={26} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Welcome Banner */}
        <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.welcomeContainer}>
          <View style={styles.facultyCard}>
            <View style={styles.facultyCardContent}>
              <View style={styles.greetingHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.greeting}>Good Morning,</Text>
                  <Text style={styles.name}>{facultyName}</Text>
                </View>
                <View style={styles.departmentBadge}>
                  <Icon name="business" size={14} color={Colors.primary} style={{ marginRight: 5 }} />
                  <Text style={styles.subtitle}>{facultyDept}</Text>
                </View>
              </View>

              <View style={styles.calendarInfoBox}>
                <View style={styles.calendarLine1}>
                  <Icon name="event" size={15} color={Colors.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.dateDayText}>{formattedDateAndDay}</Text>
                </View>

                <View style={styles.calendarLine2}>
                  <View style={styles.dayOrderBadge}>
                    <Text style={styles.dayOrderBadgeText}>Day Order {todayDayOrder}</Text>
                  </View>
                  <Text style={styles.dotSeparator}>•</Text>
                  <View style={styles.periodCountBadge}>
                    <Icon name="schedule" size={13} color="#047857" style={{ marginRight: 4 }} />
                    <Text style={styles.periodCountText}>
                      {scheduleState.todayClassCount} {scheduleState.todayClassCount === 1 ? 'Period' : 'Periods'} Today
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Quick Action 2x2 Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.rowGrid}>
            <TouchableOpacity
              style={styles.gridBox}
              onPress={() => navigation.navigate('AttendanceReport')}
              activeOpacity={0.85}
            >
              <View style={[styles.gridIconWrap, { backgroundColor: '#FFF7ED' }]}>
                <Icon name="pie-chart" size={26} color={Colors.primary} />
              </View>
              <Text style={styles.gridTitle}>Reports</Text>
              <Text style={styles.gridSubtitle}>Analytics & Pie Chart</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridBox}
              onPress={() => navigation.navigate('ClassesList', { mode: 'directory' })}
              activeOpacity={0.85}
            >
              <View style={[styles.gridIconWrap, { backgroundColor: '#ECFDF5' }]}>
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
              activeOpacity={0.85}
            >
              <View style={[styles.gridIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Icon name="notifications" size={26} color="#F59E0B" />
              </View>
              <Text style={styles.gridTitle}>Notify</Text>
              <Text style={styles.gridSubtitle}>Call & SMS absentees</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridBox}
              onPress={() => navigation.navigate('FacultyTimetable', { selectedDay: todayDayOrder })}
              activeOpacity={0.85}
            >
              <View style={[styles.gridIconWrap, { backgroundColor: '#FFF7ED' }]}>
                <Icon name="calendar-month" size={26} color={Colors.primaryDark} />
              </View>
              <Text style={styles.gridTitle}>My Timetable</Text>
              <Text style={styles.gridSubtitle}>Weekly schedule</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Schedule Timeline Section */}
        <Animated.View entering={FadeInUp.delay(150).duration(500)} style={styles.scheduleSectionContainer}>
          <View style={styles.scheduleHeaderRow}>
            <Text style={styles.scheduleTitleText}>Today's Schedule</Text>
            <TouchableOpacity
              style={styles.viewTimetableBtn}
              onPress={() => navigation.navigate('FacultyTimetable', { selectedDay: todayDayOrder })}
              activeOpacity={0.7}
            >
              <Text style={styles.viewTimetableText}>View Timetable</Text>
              <Icon name="chevron-right" size={18} color={Colors.primary} style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>

          <View style={styles.timelineCard}>
            {scheduleLoading ? (
              <View style={{ paddingVertical: 24, alignItems: 'center', justifyContent: 'center' }}>
                <BreatheLoader message="Fetching your schedule..." />
              </View>
            ) : scheduleState.timelineItems.length === 0 ? (
              <View style={{ paddingVertical: 24, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="event-available" size={32} color="#94A3B8" style={{ marginBottom: 6 }} />
                <Text style={{ fontSize: 14, color: '#64748B', fontWeight: '500' }}>No classes scheduled for today</Text>
              </View>
            ) : (
              scheduleState.timelineItems.map((item: any, index: number) => {
                const isLast = index === scheduleState.timelineItems.length - 1;
                return (
                  <TouchableOpacity
                    key={`${item.id}-${index}`}
                    style={[styles.timelineRow, isLast && { paddingBottom: 4 }]}
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('FacultyTimetable', { selectedDay: todayDayOrder || 4 })}
                  >
                    <View style={styles.timeColumn}>
                      <Text style={styles.startTimeText}>{item.startTimeStr}</Text>
                      <Text style={styles.endTimeText}>{item.endTimeStr}</Text>
                    </View>

                    <View style={styles.timelineAxisWrap}>
                      {!isLast && <View style={styles.verticalTimelineLine} />}
                      <View style={[styles.timelineDotNode, { backgroundColor: item.dotColor }]} />
                    </View>

                    <View style={styles.contentColumn}>
                      <Text style={styles.subjectTitleText} numberOfLines={2}>
                        {item.subject}
                      </Text>
                      <Text style={styles.roomLabelText}>
                        {`${item.className || 'III IT G'} • ${item.room || 'C6 16'}`}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusPillBadge,
                        {
                          borderColor: item.badgeBorder,
                          backgroundColor: item.badgeBg,
                        },
                      ]}
                    >
                      <Text style={[styles.statusPillText, { color: item.badgeTextColor }]}>
                        {item.status}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </Animated.View>

        {/* Mark Attendance Primary Card */}
        <View style={[styles.gridContainer, { marginTop: 16 }]}>
          <TouchableOpacity
            style={styles.fullWidthCard}
            onPress={() => navigation.navigate('ClassesList', { mode: 'attendance' })}
            activeOpacity={0.85}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.gridIconWrap, { backgroundColor: '#FFF7ED', marginBottom: 0, marginRight: 14 }]}>
                <Icon name="fact-check" size={28} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.gridTitle}>Mark Attendance</Text>
                <Text style={styles.gridSubtitle}>Select a class to mark attendance</Text>
              </View>
              <View style={styles.ctaArrowBox}>
                <Icon name="chevron-right" size={20} color="#FFFFFF" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Daily Wisdom Quote */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.wisdomContainer}>
          <View style={styles.wisdomCard}>
            <Icon name="format-quote" size={36} color="rgba(255, 107, 0, 0.15)" style={styles.quoteIcon} />
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
                <Image source={require('../assets/logo.png')} style={{ width: 160, height: 50 }} resizeMode="contain" />
              </View>
              <TouchableOpacity onPress={() => setIsSidebarOpen(false)}>
                <Icon name="close" size={26} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <View style={styles.sidebarMenu}>
              <TouchableOpacity
                style={styles.sidebarMenuItem}
                onPress={() => setIsSidebarOpen(false)}
              >
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
                <Icon name="pie-chart" size={24} color="#64748B" />
                <Text style={styles.sidebarMenuText}>Reports & Pie Chart</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sidebarMenuItem}
                onPress={() => {
                  setIsSidebarOpen(false);
                  navigation.navigate('FacultyTimetable', { selectedDay: todayDayOrder });
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
                <Icon name="notifications" size={24} color="#64748B" />
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

      {/* LOGOUT CONFIRMATION MODAL */}
      <Modal transparent visible={logoutModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconBox}>
              <Icon name="logout" size={30} color={Colors.error} />
            </View>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalSubtitle}>Are you sure you want to log out of your session?</Text>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <PillButton
                title="Cancel"
                onPress={() => setLogoutModalVisible(false)}
                variant="light"
                size="md"
                style={{ flex: 1 }}
              />
              <PillButton
                title="Log Out"
                onPress={handleLogout}
                variant="danger"
                size="md"
                style={{ flex: 1 }}
                icon={<Icon name="logout" size={18} color="#FFFFFF" />}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  appBarBtn: { padding: 8, borderRadius: 12, backgroundColor: '#F8FAFC' },
  headerLogoContainer: { flex: 1, alignItems: 'center' },
  headerLogo: { width: 165, height: 48 },

  welcomeContainer: { paddingHorizontal: 16, marginTop: 14, marginBottom: 14 },
  facultyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  facultyCardContent: { flex: 1 },
  greetingHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 },
  greeting: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  name: { fontSize: 20, fontWeight: '900', color: '#0F172A', marginTop: 2, letterSpacing: -0.3 },
  departmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  subtitle: { fontSize: 11, fontWeight: '700', color: Colors.primary },

  calendarInfoBox: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  calendarLine1: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  dateDayText: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  calendarLine2: { flexDirection: 'row', alignItems: 'center' },
  dayOrderBadge: { backgroundColor: '#FFF7ED', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  dayOrderBadgeText: { fontSize: 11, fontWeight: '800', color: Colors.primary },
  dotSeparator: { marginHorizontal: 8, color: '#94A3B8', fontSize: 14 },
  periodCountBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  periodCountText: { fontSize: 11, fontWeight: '700', color: '#047857' },

  gridContainer: { paddingHorizontal: 16 },
  rowGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  gridBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  gridIconWrap: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  gridTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  gridSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  fullWidthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  ctaArrowBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scheduleSectionContainer: { paddingHorizontal: 16, marginTop: 18 },
  scheduleHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  scheduleTitleText: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  viewTimetableBtn: { flexDirection: 'row', alignItems: 'center' },
  viewTimetableText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  timelineRow: { flexDirection: 'row', paddingBottom: 20 },
  timeColumn: { width: 68, alignItems: 'flex-start' },
  startTimeText: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  endTimeText: { fontSize: 11, fontWeight: '600', color: '#94A3B8', marginTop: 2 },

  timelineAxisWrap: { width: 24, alignItems: 'center', position: 'relative' },
  verticalTimelineLine: { position: 'absolute', top: 12, bottom: -20, width: 2, backgroundColor: '#E2E8F0' },
  timelineDotNode: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },

  contentColumn: { flex: 1, paddingLeft: 8, paddingRight: 8 },
  subjectTitleText: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  roomLabelText: { fontSize: 12, color: '#64748B', fontWeight: '500', marginTop: 2 },

  statusPillBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, alignSelf: 'flex-start' },
  statusPillText: { fontSize: 10, fontWeight: '800' },

  wisdomContainer: { paddingHorizontal: 16, marginTop: 18 },
  wisdomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    position: 'relative',
  },
  quoteIcon: { position: 'absolute', top: 12, right: 16 },
  wisdomTitle: { fontSize: 14, fontWeight: '800', color: Colors.primary, marginBottom: 6 },
  wisdomText: { fontSize: 13, color: '#334155', fontStyle: 'italic', lineHeight: 20 },
  wisdomAuthor: { fontSize: 12, fontWeight: '700', color: '#64748B', marginTop: 6, textAlign: 'right' },

  /* SIDEBAR STYLES */
  sidebarOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(15, 23, 42, 0.5)' },
  sidebarContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: width * 0.78,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    elevation: 10,
  },
  sidebarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  sidebarMenu: { flex: 1 },
  sidebarMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  sidebarMenuText: { fontSize: 15, fontWeight: '700', color: '#334155', marginLeft: 16 },
  sidebarDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },

  /* MODAL STYLES */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, elevation: 8 },
  modalIconBox: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 20 },
  modalBtnRow: { flexDirection: 'row', marginTop: 10 },
  modalCancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', marginRight: 8 },
  modalCancelText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  modalLogoutBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.error, alignItems: 'center', marginLeft: 8 },
  modalLogoutText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});
