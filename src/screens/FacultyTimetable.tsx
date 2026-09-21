import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { API_BASE_URL, fetchWithTimeout } from '../constants/Config';
import BreatheLoader from '../components/BreatheLoader';
import {
  getWorkingCycleTabs,
  getTodayDayOrder,
  getLocalDateStr,
  TabDayInfo,
} from '../constants/AcademicCalendar';
import { getTeacherFullTimetableFallback } from '../constants/DummyData';

interface TimetableItem {
  id: number;
  day: number;
  period: number;
  section: string;
  Subject?: {
    id: number;
    code: string;
    acronym: string;
    title: string;
  };
  Teacher?: {
    id: number;
    name: string;
    email: string;
    department: string;
  };
}

const PERIOD_TIMING_MAP: { [key: number]: { startTimeStr: string; endTimeStr: string; startMinutes: number; endMinutes: number } } = {
  1: { startTimeStr: '08:15 AM', endTimeStr: '09:15 AM', startMinutes: 8 * 60 + 15, endMinutes: 9 * 60 + 15 },
  2: { startTimeStr: '09:15 AM', endTimeStr: '10:15 AM', startMinutes: 9 * 60 + 15, endMinutes: 10 * 60 + 15 },
  3: { startTimeStr: '10:45 AM', endTimeStr: '11:45 AM', startMinutes: 10 * 60 + 45, endMinutes: 11 * 60 + 45 },
  4: { startTimeStr: '11:45 AM', endTimeStr: '12:45 PM', startMinutes: 11 * 60 + 45, endMinutes: 12 * 60 + 45 },
  5: { startTimeStr: '01:45 PM', endTimeStr: '02:45 PM', startMinutes: 13 * 60 + 45, endMinutes: 14 * 60 + 45 },
  6: { startTimeStr: '02:45 PM', endTimeStr: '03:45 PM', startMinutes: 14 * 60 + 45, endMinutes: 15 * 60 + 45 },
  7: { startTimeStr: '03:45 PM', endTimeStr: '04:45 PM', startMinutes: 15 * 60 + 45, endMinutes: 16 * 60 + 45 },
  8: { startTimeStr: '04:45 PM', endTimeStr: '05:30 PM', startMinutes: 16 * 60 + 45, endMinutes: 17 * 60 + 30 },
};

const DAYS = [
  { day: 1, label: 'Day 1', full: 'Day Order 1' },
  { day: 2, label: 'Day 2', full: 'Day Order 2' },
  { day: 3, label: 'Day 3', full: 'Day Order 3' },
  { day: 4, label: 'Day 4', full: 'Day Order 4' },
  { day: 5, label: 'Day 5', full: 'Day Order 5' },
];

export default function FacultyTimetable() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const initialSelectedDay = route.params?.selectedDay;

  const weekDays: TabDayInfo[] = React.useMemo(() => getWorkingCycleTabs(new Date()), []);
  const todayTab = weekDays.find(w => w.isToday) || weekDays[0];

  const buildDayMapFromList = (list: any[]): { [day: number]: TimetableItem[] } => {
    const map: { [day: number]: TimetableItem[] } = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    if (Array.isArray(list)) {
      list.forEach((item: any) => {
        const d = Number(item.day);
        if (d >= 1 && d <= 5) {
          map[d].push({
            id: item.id,
            day: d,
            period: Number(item.period),
            section: item.section || 'III IT G',
            Subject: item.Subject || { id: 1, code: '23IT502', acronym: 'AC', title: item.subject || 'Applied Cryptography' },
            Teacher: item.Teacher,
          });
        }
      });
    }
    return map;
  };

  const [selectedDay, setSelectedDay] = useState<number>(initialSelectedDay || todayTab.day);
  const [todayDayOrder, setTodayDayOrder] = useState<number>(todayTab.day);
  const [teacher, setTeacher] = useState<any>(null);

  const [timetableByDay, setTimetableByDay] = useState<{ [day: number]: TimetableItem[] }>({ 1: [], 2: [], 3: [], 4: [], 5: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (route.params?.selectedDay) {
      setSelectedDay(route.params.selectedDay);
    } else {
      setSelectedDay(todayTab.day);
    }
  }, [route.params?.selectedDay, todayTab.day]);

  const fetchTimetable = useCallback(async (teacherId: number, teacherName: string = '') => {
    const numId = Number(teacherId) || 3;
    const fallbackData = getTeacherFullTimetableFallback(numId, teacherName);
    const fallbackMap = buildDayMapFromList(fallbackData);

    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/timetable?teacher_id=${numId}`, {}, 3500);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const liveMap = buildDayMapFromList(data);
          [1, 2, 3, 4, 5].forEach(d => {
            if (!liveMap[d] || liveMap[d].length === 0) {
              liveMap[d] = fallbackMap[d] || [];
            }
          });
          setTimetableByDay(liveMap);
          return;
        }
      }
      setTimetableByDay(fallbackMap);
    } catch (e) {
      setTimetableByDay(fallbackMap);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      let currentTeacher = { id: 3, name: 'Ms. B Narmatha', department: 'Information Technology' };
      try {
        const stored = await AsyncStorage.getItem('loggedInTeacher');
        if (stored) {
          currentTeacher = JSON.parse(stored);
        }
      } catch (e) {}

      setTeacher(currentTeacher);
      fetchTimetable(currentTeacher.id, currentTeacher.name);

      try {
        const dayRes = await fetchWithTimeout(`${API_BASE_URL}/day-order`, {}, 2500);
        if (dayRes.ok) {
          const dayData = await dayRes.json();
          const todayStr = getLocalDateStr(new Date());
          if (dayData && dayData.day_order && dayData.date === todayStr && dayData.day_order === todayTab.day) {
            setTodayDayOrder(dayData.day_order);
          }
        }
      } catch (e) {}
    };
    init();
  }, [todayTab, fetchTimetable]);

  const onRefresh = async () => {
    setRefreshing(true);
    const freshTabs = getWorkingCycleTabs(new Date());
    const currentToday = freshTabs.find(w => w.isToday) || freshTabs[0];
    setTodayDayOrder(currentToday.day);
    if (!route.params?.selectedDay) {
      setSelectedDay(currentToday.day);
    }

    const tId = teacher?.id || 3;
    const tName = teacher?.name || 'Ms. B Narmatha';
    fetchTimetable(tId, tName);
  };

  const currentDayClasses = timetableByDay[selectedDay] || [];
  const sortedClasses = (currentDayClasses || []).slice().sort((a, b) => a.period - b.period);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let upcomingCount = 0;

  const timelineItems = sortedClasses.map((item) => {
    const timing = PERIOD_TIMING_MAP[item.period] || {
      startTimeStr: '10:30 AM',
      endTimeStr: '11:30 AM',
      startMinutes: 10 * 60 + 30,
      endMinutes: 11 * 60 + 30
    };

    const todayStr = getLocalDateStr(new Date());
    const selectedTab = weekDays.find(w => w.day === selectedDay);
    const selectedDateStr = selectedTab?.isoDate || '2026-09-07';

    let status: 'Ongoing' | 'Upcoming' | 'Completed' = 'Upcoming';
    if (selectedDateStr < todayStr) {
      status = 'Completed';
    } else if (selectedDateStr > todayStr) {
      status = 'Upcoming';
    } else {
      if (currentMinutes >= timing.startMinutes && currentMinutes < timing.endMinutes) {
        status = 'Ongoing';
      } else if (currentMinutes >= timing.endMinutes) {
        status = 'Completed';
      } else {
        status = 'Upcoming';
      }
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
      if (upcomingCount === 0) {
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
      upcomingCount++;
    } else {
      dotColor = '#94A3B8';
      badgeBorder = '#CBD5E1';
      badgeBg = '#F8FAFC';
      badgeTextColor = '#64748B';
    }

    const subjectTitle = item.Subject?.title || (item as any).subject || 'Distributed Computing';
    const roomLabel = `${item.section || 'III IT G'} • C6 16`;

    return {
      ...item,
      startTimeStr: timing.startTimeStr,
      endTimeStr: timing.endTimeStr,
      subjectTitle,
      roomLabel,
      status,
      dotColor,
      badgeBorder,
      badgeBg,
      badgeTextColor
    };
  });

  const selectedTabInfo = weekDays.find(w => w.day === selectedDay);
  const formattedDateAndDay = selectedTabInfo 
    ? `${selectedTabInfo.fullDateStr}, 2026`
    : new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>My Timetable</Text>
          <Text style={styles.headerSubtitle}>Weekly Schedule</Text>
        </View>
        <TouchableOpacity style={styles.refreshIconBtn} onPress={onRefresh}>
          <Icon name="sync" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* FACULTY PROFILE & CALENDAR INFO CARD */}
      <Animated.View entering={FadeInUp.duration(400)} style={styles.facultyCard}>
        <View style={styles.greetingHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Faculty Profile</Text>
            <Text style={styles.facultyName}>{teacher?.name || 'Faculty Member'}</Text>
          </View>
          <View style={styles.departmentBadge}>
            <Icon name="business" size={14} color={Colors.primary} style={{ marginRight: 5 }} />
            <Text style={styles.facultyDept}>{teacher?.department || 'Information Technology'}</Text>
          </View>
        </View>

        {/* Date, Day, Day Order & Period Count Info Box */}
        <View style={styles.calendarInfoBox}>
          <View style={styles.calendarLine1}>
            <Icon name="event" size={15} color={Colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.dateDayText}>{formattedDateAndDay}</Text>
          </View>

          <View style={styles.calendarLine2}>
            <View style={styles.dayOrderBadge}>
              <Text style={styles.dayOrderBadgeText}>Day Order {selectedDay}</Text>
            </View>
            <Text style={styles.dotSeparator}>•</Text>
            <View style={styles.periodCountBadge}>
              <Icon name="schedule" size={13} color="#047857" style={{ marginRight: 4 }} />
              <Text style={styles.periodCountText}>
                {currentDayClasses.length} {currentDayClasses.length === 1 ? 'Period' : 'Periods'} Scheduled
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* DAY SELECTOR SEGMENTED TABS */}
      <View style={styles.daySelectorContainer}>
        {weekDays.map(d => {
          const isSelected = selectedDay === d.day;
          const classCount = (timetableByDay[d.day] || []).length;
          return (
            <TouchableOpacity
              key={d.day}
              style={[styles.dayTab, isSelected && styles.dayTabActive]}
              onPress={() => setSelectedDay(d.day)}
              activeOpacity={0.7}
            >
              <Text 
                style={[styles.dayTabLabel, isSelected && styles.dayTabLabelActive]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {d.shortDay}, {d.dateStr}
              </Text>

              <Text style={[styles.dayTabSub, isSelected && styles.dayTabSubActive]}>
                Day {d.day}{d.isToday ? ' • Today' : ''}
              </Text>

              {classCount > 0 ? (
                <View style={[styles.dayDot, isSelected && styles.dayDotActive]}>
                  <Text style={[styles.dayDotText, isSelected && styles.dayDotTextActive]}>
                    {classCount}
                  </Text>
                </View>
              ) : (
                <View style={[styles.dayDotEmpty, isSelected && styles.dayDotEmptyActive]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* TIMETABLE CONTENT */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 300, paddingVertical: 40 }}>
          <BreatheLoader message="Fetching your timetable..." />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollList}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.dayHeaderRow}>
            <Text style={styles.dayHeaderTitle}>
              {DAYS.find(d => d.day === selectedDay)?.full}
            </Text>
            <Text style={styles.dayHeaderCount}>
              {currentDayClasses.length} {currentDayClasses.length === 1 ? 'Period' : 'Periods'} Scheduled
            </Text>
          </View>

          {timelineItems.length === 0 ? (
            <Animated.View entering={FadeInUp.duration(400)} style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Icon name="event-busy" size={38} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No Classes Scheduled</Text>
              <Text style={styles.emptySubtitle}>
                You have no assigned lecture or lab periods on Day {selectedDay} ({DAYS.find(d => d.day === selectedDay)?.full}).
              </Text>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInUp.duration(400)} style={styles.timelineCard}>
              {timelineItems.map((item, index) => {
                const isLast = index === timelineItems.length - 1;
                return (
                  <TouchableOpacity
                    key={item.id || index}
                    style={[styles.timelineRow, isLast && { paddingBottom: 4 }]}
                    activeOpacity={0.85}
                    onPress={() => {
                      navigation.navigate('Attendance', {
                        classDetails: {
                          subject: item.subjectTitle,
                          className: item.section,
                          time: `${item.startTimeStr} - ${item.endTimeStr}`,
                          period: item.period,
                          timetableId: item.id,
                        },
                      });
                    }}
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
                        {item.subjectTitle}
                      </Text>
                      <Text style={styles.roomLabelText}>{item.roomLabel}</Text>
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
              })}
            </Animated.View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  facultyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 12,
  },
  greetingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  facultyName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
    letterSpacing: -0.4,
  },
  departmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  facultyDept: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '700',
  },
  calendarInfoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  calendarLine1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dateDayText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  calendarLine2: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  dayOrderBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dayOrderBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  dotSeparator: {
    marginHorizontal: 8,
    color: '#94A3B8',
    fontWeight: '800',
    fontSize: 13,
  },
  periodCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  periodCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  daySelectorContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: 'space-between',
  },
  dayTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  dayTabActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  dayTabLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    textAlign: 'center',
  },
  dayTabLabelActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  dayTabSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '600',
    textAlign: 'center',
  },
  dayTabSubActive: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '700',
  },
  dayDot: {
    marginTop: 5,
    backgroundColor: Colors.primarySoft,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayDotActive: {
    backgroundColor: '#FFFFFF',
  },
  dayDotText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  dayDotTextActive: {
    color: Colors.primary,
  },
  dayDotEmpty: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    marginTop: 11,
  },
  dayDotEmptyActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  scrollList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 2,
  },
  dayHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  dayHeaderCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 2,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    position: 'relative',
  },
  timeColumn: {
    width: 68,
    alignItems: 'flex-start',
  },
  startTimeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  endTimeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
  },
  timelineAxisWrap: {
    width: 24,
    alignItems: 'center',
    position: 'relative',
  },
  verticalTimelineLine: {
    position: 'absolute',
    top: 10,
    bottom: -18,
    width: 2,
    backgroundColor: '#E2E8F0',
  },
  timelineDotNode: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 2,
  },
  contentColumn: {
    flex: 1,
    paddingLeft: 8,
    paddingRight: 8,
  },
  subjectTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  roomLabelText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  statusPillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'center',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
});
