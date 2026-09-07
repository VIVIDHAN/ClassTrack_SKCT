import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { API_BASE_URL } from '../constants/Config';
import {
  getWorkingCycleTabs,
  getTodayDayOrder,
  getLocalDateStr,
  TabDayInfo,
} from '../constants/AcademicCalendar';

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

const PERIOD_TIMINGS: { [key: number]: string } = {
  1: '08:15 AM - 09:15 AM',
  2: '09:15 AM - 10:15 AM',
  3: '10:45 AM - 11:45 AM',
  4: '11:45 AM - 12:45 PM',
  5: '01:45 PM - 02:45 PM',
  6: '02:45 PM - 03:45 PM',
  7: '03:45 PM - 04:45 PM',
  8: '04:45 PM - 05:30 PM',
};

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

  // Derive weekly tabs synchronized with current date from academic calendar
  const weekDays: TabDayInfo[] = React.useMemo(() => getWorkingCycleTabs(new Date()), []);
  const todayTab = weekDays.find(w => w.isToday) || weekDays[0];

  // Default to route.params.selectedDay if provided, else ALWAYS today's active day order (e.g. Day 4 for 7 Sep)
  const [selectedDay, setSelectedDay] = useState<number>(initialSelectedDay || todayTab.day);
  const [todayDayOrder, setTodayDayOrder] = useState<number>(todayTab.day);
  const [teacher, setTeacher] = useState<any>(null);
  const [timetableByDay, setTimetableByDay] = useState<{ [day: number]: TimetableItem[] }>({
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Synchronize route.params.selectedDay or ensure today's tab is selected on initial entry
  useEffect(() => {
    if (route.params?.selectedDay) {
      setSelectedDay(route.params.selectedDay);
    } else {
      setSelectedDay(todayTab.day);
    }
  }, [route.params?.selectedDay, todayTab.day]);

  // Load teacher from storage
  useEffect(() => {
    const init = async () => {
      try {
        const stored = await AsyncStorage.getItem('loggedInTeacher');
        if (stored) {
          setTeacher(JSON.parse(stored));
        } else {
          setTeacher({ id: 3, name: 'Ms. B Narmatha', department: 'Information Technology' });
        }
      } catch (e) {
        setTeacher({ id: 3, name: 'Ms. B Narmatha', department: 'Information Technology' });
      }

      // Check backend for day-order (only adopt if matching today's academic date and day order)
      try {
        const dayRes = await fetch(`${API_BASE_URL}/day-order`);
        const dayData = await dayRes.json();
        const todayStr = getLocalDateStr(new Date());
        if (dayData && dayData.day_order && dayData.date === todayStr && dayData.day_order === todayTab.day) {
          setTodayDayOrder(dayData.day_order);
        }
      } catch (e) {}
    };
    init();
  }, [todayTab]);

  // Fetch timetable for all 5 days for this teacher
  const fetchTimetable = useCallback(async (teacherId: number) => {
    setLoading(true);
    const dayResults: { [day: number]: TimetableItem[] } = { 1: [], 2: [], 3: [], 4: [], 5: [] };

    try {
      const promises = [1, 2, 3, 4, 5].map(async d => {
        try {
          const res = await fetch(`${API_BASE_URL}/timetable?teacher_id=${teacherId}&day=${d}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              dayResults[d] = data;
            }
          }
        } catch (e) {
          console.log(`Failed to fetch day ${d}:`, e);
        }
      });

      await Promise.all(promises);

      // Fallback if network failed and no results found
      const totalCount = Object.values(dayResults).reduce((sum, arr) => sum + arr.length, 0);
      if (totalCount === 0 && teacherId === 3) {
        // Fallback for Narmatha
        dayResults[1] = [
          { id: 4, day: 1, period: 4, section: 'III IT G', Subject: { id: 3, code: '23IT502', acronym: 'AC', title: 'Applied Cryptography' } },
          { id: 5, day: 1, period: 5, section: 'III IT G', Subject: { id: 3, code: '23IT502', acronym: 'AC', title: 'Applied Cryptography' } },
        ];
        dayResults[2] = [
          { id: 8, day: 2, period: 3, section: 'III IT G', Subject: { id: 3, code: '23IT502', acronym: 'AC', title: 'Applied Cryptography' } },
          { id: 9, day: 2, period: 4, section: 'III IT G', Subject: { id: 3, code: '23IT502', acronym: 'AC', title: 'Applied Cryptography' } },
        ];
        dayResults[4] = [
          { id: 16, day: 4, period: 1, section: 'III IT G', Subject: { id: 3, code: '23IT502', acronym: 'AC', title: 'Applied Cryptography' } },
        ];
        dayResults[5] = [
          { id: 21, day: 5, period: 1, section: 'III IT G', Subject: { id: 3, code: '23IT502', acronym: 'AC', title: 'Applied Cryptography' } },
        ];
      }

      setTimetableByDay(dayResults);
    } catch (e) {
      console.log('Error loading timetable:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (teacher?.id) {
      fetchTimetable(teacher.id);
    }
  }, [teacher, fetchTimetable]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh & sync selected tab to current date/day order
    const freshTabs = getWorkingCycleTabs(new Date());
    const currentToday = freshTabs.find(w => w.isToday) || freshTabs[0];
    setTodayDayOrder(currentToday.day);
    if (!route.params?.selectedDay) {
      setSelectedDay(currentToday.day);
    }

    if (teacher?.id) {
      fetchTimetable(teacher.id);
    } else {
      setRefreshing(false);
    }
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

    let dotColor = '#2563EB';
    let badgeBorder = '#2563EB';
    let badgeBg = '#EFF6FF';
    let badgeTextColor = '#2563EB';

    if (status === 'Ongoing') {
      dotColor = '#2563EB';
      badgeBorder = '#2563EB';
      badgeBg = '#EFF6FF';
      badgeTextColor = '#2563EB';
    } else if (status === 'Upcoming') {
      if (upcomingCount === 0) {
        dotColor = '#9333EA';
        badgeBorder = '#A855F7';
        badgeBg = '#FAF5FF';
        badgeTextColor = '#9333EA';
      } else {
        dotColor = '#EA580C';
        badgeBorder = '#F97316';
        badgeBg = '#FFF7ED';
        badgeTextColor = '#EA580C';
      }
      upcomingCount++;
    } else {
      dotColor = '#94A3B8';
      badgeBorder = '#CBD5E1';
      badgeBg = '#F8FAFC';
      badgeTextColor = '#64748B';
    }

    const subjectTitle = item.Subject?.title || 'Applied Cryptography';
    const roomLabel = `Room 30${item.period || 1}, Block A`;

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

  const totalWeeklyPeriods = Object.values(timetableByDay).reduce((sum, arr) => sum + arr.length, 0);
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
        <View style={styles.facultyProfileRow}>
          <View style={styles.facultyAvatar}>
            <Icon name="person" size={26} color="#FFF" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.facultyName}>{teacher?.name || 'Faculty Member'}</Text>
            <Text style={styles.facultyDept}>{teacher?.department || 'Information Technology'}</Text>
          </View>
          <View style={styles.periodBadge}>
            <Text style={styles.periodBadgeNum}>{totalWeeklyPeriods}</Text>
            <Text style={styles.periodBadgeLabel}>Periods/Wk</Text>
          </View>
        </View>

        {/* Date, Day, Day Order & Period Count Info Box */}
        <View style={styles.calendarInfoBox}>
          {/* Line 1: Date and Day */}
          <View style={styles.calendarLine1}>
            <Icon name="event" size={15} color={Colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.dateDayText}>{formattedDateAndDay}</Text>
          </View>

          {/* Line 2: Day Order & Period Count */}
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
              {/* Line 1: Day & Date e.g. "Thu, 3 Sep" */}
              <Text 
                style={[styles.dayTabLabel, isSelected && styles.dayTabLabelActive]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {d.shortDay}, {d.dateStr}
              </Text>

              {/* Line 2: Day Order e.g. "Day 4 • Today" */}
              <Text style={[styles.dayTabSub, isSelected && styles.dayTabSubActive]}>
                Day {d.day}{d.isToday ? ' • Today' : ''}
              </Text>

              {/* Line 3: Period count circle */}
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching your timetable from database...</Text>
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
                    {/* Left Column: Time */}
                    <View style={styles.timeColumn}>
                      <Text style={styles.startTimeText}>{item.startTimeStr}</Text>
                      <Text style={styles.endTimeText}>{item.endTimeStr}</Text>
                    </View>

                    {/* Middle: Vertical Timeline Axis & Colored Dot Node */}
                    <View style={styles.timelineAxisWrap}>
                      {!isLast && <View style={styles.verticalTimelineLine} />}
                      <View style={[styles.timelineDotNode, { backgroundColor: item.dotColor }]} />
                    </View>

                    {/* Center Column: Subject & Room */}
                    <View style={styles.contentColumn}>
                      <Text style={styles.subjectTitleText} numberOfLines={2}>
                        {item.subjectTitle}
                      </Text>
                      <Text style={styles.roomLabelText}>{item.roomLabel}</Text>
                    </View>

                    {/* Right Column: Status Pill */}
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Inter',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  facultyCard: {
    backgroundColor: '#0F172A',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 14,
    padding: 16,
    borderRadius: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  facultyProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  facultyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  facultyName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  facultyDept: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  periodBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  periodBadgeNum: {
    fontSize: 16,
    fontWeight: '800',
    color: '#38BDF8',
  },
  periodBadgeLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 1,
  },
  calendarInfoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 12,
  },
  calendarLine1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dateDayText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  calendarLine2: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  dayOrderBadge: {
    backgroundColor: 'rgba(255, 93, 56, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  dayOrderBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF7A59',
  },
  dotSeparator: {
    marginHorizontal: 8,
    color: '#64748B',
    fontWeight: '800',
    fontSize: 12,
  },
  periodCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  periodCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34D399',
  },
  daySelectorContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    justifyContent: 'space-between',
  },
  dayTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  dayTabActive: {
    backgroundColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  dayTabLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  dayTabLabelActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  dayTabSub: {
    fontSize: 11,
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
    marginTop: 6,
    backgroundColor: '#EEF2FF',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayDotActive: {
    backgroundColor: '#FFFFFF',
  },
  dayDotText: {
    fontSize: 11,
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
    marginTop: 13,
  },
  dayDotEmptyActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  scrollList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  dayHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  dayHeaderCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  emptyCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
    paddingHorizontal: 16,
  },
  timelineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginTop: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    position: 'relative',
  },
  timeColumn: {
    width: 72,
    alignItems: 'flex-start',
  },
  startTimeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  endTimeText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 3,
  },
  timelineAxisWrap: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    marginRight: 6,
  },
  verticalTimelineLine: {
    position: 'absolute',
    top: '50%',
    bottom: '-50%',
    width: 2,
    backgroundColor: '#E2E8F0',
    zIndex: 1,
  },
  timelineDotNode: {
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 2,
  },
  contentColumn: {
    flex: 1,
    paddingRight: 10,
  },
  subjectTitleText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 20,
  },
  roomLabelText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 4,
  },
  statusPillBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  subjectMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaBadgeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  markAttendanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  markAttendanceBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
    flex: 1,
  },
});
