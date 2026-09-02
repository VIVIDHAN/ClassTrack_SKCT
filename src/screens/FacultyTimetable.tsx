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
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import { API_BASE_URL } from '../constants/Config';

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
  1: '08:45 AM - 09:35 AM',
  2: '09:35 AM - 10:25 AM',
  3: '10:45 AM - 11:35 AM',
  4: '11:35 AM - 12:25 PM',
  5: '01:25 PM - 02:15 PM',
  6: '02:15 PM - 03:05 PM',
  7: '03:05 PM - 03:55 PM',
  8: '03:55 PM - 04:45 PM',
};

const DAYS = [
  { day: 1, label: 'Mon', full: 'Monday' },
  { day: 2, label: 'Tue', full: 'Tuesday' },
  { day: 3, label: 'Wed', full: 'Wednesday' },
  { day: 4, label: 'Thu', full: 'Thursday' },
  { day: 5, label: 'Fri', full: 'Friday' },
];

export default function FacultyTimetable() {
  const navigation = useNavigation<any>();

  // Detect today's day (1 = Monday ... 5 = Friday)
  const currentDayIndex = new Date().getDay(); // 0 = Sun, 1 = Mon ...
  const defaultDay = currentDayIndex >= 1 && currentDayIndex <= 5 ? currentDayIndex : 1;

  const [selectedDay, setSelectedDay] = useState(defaultDay);
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

  // Load teacher from storage
  useEffect(() => {
    const getTeacher = async () => {
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
    };
    getTeacher();
  }, []);

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

  const onRefresh = () => {
    setRefreshing(true);
    if (teacher?.id) {
      fetchTimetable(teacher.id);
    }
  };

  const currentDayClasses = timetableByDay[selectedDay] || [];
  const totalWeeklyPeriods = Object.values(timetableByDay).reduce((sum, arr) => sum + arr.length, 0);

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

      {/* FACULTY PROFILE CARD */}
      <Animated.View entering={FadeInUp.duration(400)} style={styles.facultyCard}>
        <View style={styles.facultyAvatar}>
          <Icon name="person" size={28} color="#FFF" />
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.facultyName}>{teacher?.name || 'Faculty Member'}</Text>
          <Text style={styles.facultyDept}>{teacher?.department || 'Information Technology'}</Text>
        </View>
        <View style={styles.periodBadge}>
          <Text style={styles.periodBadgeNum}>{totalWeeklyPeriods}</Text>
          <Text style={styles.periodBadgeLabel}>Periods/Wk</Text>
        </View>
      </Animated.View>

      {/* DAY SELECTOR TABS */}
      <View style={styles.daySelectorContainer}>
        {DAYS.map(d => {
          const isSelected = selectedDay === d.day;
          const classCount = (timetableByDay[d.day] || []).length;
          return (
            <TouchableOpacity
              key={d.day}
              style={[styles.dayTab, isSelected && styles.dayTabActive]}
              onPress={() => setSelectedDay(d.day)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayTabLabel, isSelected && styles.dayTabLabelActive]}>
                {d.label}
              </Text>
              <Text style={[styles.dayTabSub, isSelected && styles.dayTabSubActive]}>
                Day {d.day}
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

          {currentDayClasses.length === 0 ? (
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
            currentDayClasses
              .sort((a, b) => a.period - b.period)
              .map((item, index) => {
                const timeSlot = PERIOD_TIMINGS[item.period] || 'Time Slot TBD';
                const subjectTitle = item.Subject?.title || 'Applied Cryptography';
                const subjectCode = item.Subject?.code || '23IT502';
                const subjectAcronym = item.Subject?.acronym || 'AC';

                return (
                  <Animated.View
                    key={item.id}
                    entering={FadeInRight.delay(index * 100).duration(400)}
                    style={styles.periodCard}
                  >
                    {/* PERIOD NUMBER BADGE */}
                    <View style={styles.periodBadgeColumn}>
                      <View style={styles.periodPill}>
                        <Text style={styles.periodPillNum}>P{item.period}</Text>
                      </View>
                      <View style={styles.periodLine} />
                    </View>

                    {/* DETAILS */}
                    <View style={styles.periodContent}>
                      <View style={styles.periodTopRow}>
                        <View style={styles.timeTag}>
                          <Icon name="schedule" size={13} color="#6366F1" style={{ marginRight: 4 }} />
                          <Text style={styles.timeTagText}>{timeSlot}</Text>
                        </View>
                        <View style={styles.sectionBadge}>
                          <Text style={styles.sectionBadgeText}>{item.section}</Text>
                        </View>
                      </View>

                      <Text style={styles.subjectTitle}>{subjectTitle}</Text>

                      <View style={styles.subjectMetaRow}>
                        <View style={styles.metaBadge}>
                          <Icon name="menu-book" size={12} color="#64748B" style={{ marginRight: 3 }} />
                          <Text style={styles.metaBadgeText}>{subjectCode} ({subjectAcronym})</Text>
                        </View>
                        <View style={styles.metaBadge}>
                          <Icon name="meeting-room" size={12} color="#64748B" style={{ marginRight: 3 }} />
                          <Text style={styles.metaBadgeText}>Room 204 • IT Block</Text>
                        </View>
                      </View>

                      {/* MARK ATTENDANCE ACTION BUTTON */}
                      <TouchableOpacity
                        style={styles.markAttendanceBtn}
                        onPress={() => {
                          navigation.navigate('Attendance', {
                            classDetails: {
                              subject: subjectTitle,
                              className: item.section,
                              time: timeSlot,
                              period: item.period,
                              timetableId: item.id,
                            },
                          });
                        }}
                      >
                        <Icon name="check-circle" size={16} color="#FFF" style={{ marginRight: 6 }} />
                        <Text style={styles.markAttendanceBtnText}>Mark Attendance</Text>
                        <Icon name="chevron-right" size={18} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                );
              })
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 14,
    padding: 16,
    borderRadius: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  facultyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  facultyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  facultyDept: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  periodBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  periodBadgeNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#38BDF8',
  },
  periodBadgeLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 1,
  },
  daySelectorContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dayTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  dayTabActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  dayTabLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  dayTabLabelActive: {
    color: '#FFF',
  },
  dayTabSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  dayTabSubActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  dayDot: {
    marginTop: 4,
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  dayDotActive: {
    backgroundColor: '#FFF',
  },
  dayDotText: {
    fontSize: 10,
    fontWeight: '700',
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
    marginTop: 6,
  },
  dayDotEmptyActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
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
  periodCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  periodBadgeColumn: {
    width: 62,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    paddingTop: 16,
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
  },
  periodPill: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
  },
  periodPillNum: {
    fontSize: 15,
    fontWeight: '800',
    color: '#4F46E5',
  },
  periodLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#E2E8F0',
    marginTop: 8,
    marginBottom: 16,
  },
  periodContent: {
    flex: 1,
    padding: 16,
  },
  periodTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
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
