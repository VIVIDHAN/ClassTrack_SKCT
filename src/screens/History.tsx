import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  Share,
  TouchableOpacity,
  Alert,
  Linking,
  RefreshControl,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInUp, FadeInRight, Layout } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';
import { API_BASE_URL } from '../constants/Config';
import BreatheLoader from '../components/BreatheLoader';
import { ATTENDANCE_HISTORY } from '../constants/DummyData';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface AbsenteeItem {
  id: string;
  name: string;
  phone: string;
  real_parent_phone?: string;
  called?: boolean;
  smsSent?: boolean;
}

export interface HistorySession {
  id: string;
  date: string;
  time?: string;
  period?: string;
  className: string;
  subject: string;
  absentCount: number;
  smsSent: boolean;
  absentees: AbsenteeItem[];
}

export default function History() {
  const navigation = useNavigation<any>();
  const [history, setHistory] = useState<HistorySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Load history records from both local AsyncStorage and remote API
  const loadHistory = useCallback(async () => {
    try {
      let combined: HistorySession[] = [];

      // 1. Read locally cached attendance submissions from markedAbsentees
      const stored = await AsyncStorage.getItem('markedAbsentees');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          parsed.forEach((session: any) => {
            if (session.sessionId === 'session-101' || session.sessionId === 'session-102') {
              return;
            }
            const absList: AbsenteeItem[] = Array.isArray(session.absentees)
              ? session.absentees.map((a: any) => ({
                  id: a.id,
                  name: a.name,
                  phone: a.real_parent_phone || a.phone || '',
                  real_parent_phone: a.real_parent_phone || a.phone || '',
                  called: !!a.called,
                  smsSent: !!a.smsSent,
                }))
              : [];

            combined.push({
              id: session.sessionId || `sess-${Date.now()}`,
              date: session.date || 'Today',
              time: session.time || '',
              period: session.period || 'Period',
              className: session.className || 'III IT G',
              subject: session.subject || 'Class',
              absentCount: absList.length,
              smsSent: true,
              absentees: absList,
            });
          });
        }
      }

      // 2. Fetch from backend server if reachable
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(`${API_BASE_URL}/history`, { signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          data.forEach((item: any) => {
            const dateStr = new Date(item.date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const timetable = item.Timetable;
            const periodStr = timetable?.period ? `Period ${timetable.period}` : 'Period';

            const serverAbsentees: AbsenteeItem[] = Array.isArray(item.absentees)
              ? item.absentees.map((a: any) => ({
                  id: a.id,
                  name: a.name,
                  phone: a.phone || '',
                  real_parent_phone: a.real_parent_phone || a.phone || '',
                }))
              : [];

            const exists = combined.some(
              c => c.date === dateStr && c.subject === (timetable?.Subject?.title || 'Course')
            );
            if (!exists) {
              combined.push({
                id: String(item.id),
                date: dateStr,
                time: '',
                period: periodStr,
                className: timetable?.section || 'III IT G',
                subject: timetable?.Subject?.title || 'Class',
                absentCount: item.absentCount || serverAbsentees.length,
                smsSent: true,
                absentees: serverAbsentees,
              });
            }
          });
        }
      } catch (err) {
        // Backend unavailable
      }

      // If still empty, use fallback history
      if (combined.length === 0) {
        combined = ATTENDANCE_HISTORY.map(item => ({
          id: item.id,
          date: item.date,
          time: item.time || '',
          period: item.period || 'Period',
          className: item.className,
          subject: item.subject,
          absentCount: item.absentCount,
          smsSent: item.smsSent,
          absentees: item.absentees || [],
        }));
      }

      setHistory(combined);
    } catch (e) {
      console.log('Error loading history:', e);
      setHistory(ATTENDANCE_HISTORY);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadHistory();
    }, [loadHistory])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const toggleCardExpansion = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCardId(prev => (prev === id ? null : id));
  };

  const handleClearHistory = () => {
    Alert.alert('Clear History', 'Are you sure you want to delete all attendance logs?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          setHistory([]);
          await AsyncStorage.removeItem('markedAbsentees');
          fetch(`${API_BASE_URL}/history`, { method: 'DELETE' }).catch(() => {});
        },
      },
    ]);
  };

  const handleShare = async (item: HistorySession) => {
    try {
      let absenteesText = '';
      if (item.absentees && item.absentees.length > 0) {
        absenteesText =
          '\n\n*Absentees List:*\n' +
          item.absentees.map((a, i) => `${i + 1}. ${a.name} (${a.id})`).join('\n');
      } else {
        absenteesText = '\n\n*All students present (100% Attendance)*';
      }

      await Share.share({
        message: `*ClassTrack Attendance Report*\n\n📅 Date: ${item.date}\n⏰ Period: ${item.period || 'Period'}\n🏫 Class: ${item.className}\n📚 Subject: ${item.subject}\n🔴 Total Absentees: ${item.absentCount}${absenteesText}\n\n— Generated via ClassTrack`,
      });
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const handleCall = (phone: string) => {
    if (!phone) {
      Alert.alert('No Phone', 'Parent phone number is not available.');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      Alert.alert('Error', 'Unable to launch phone dialer.');
    });
  };

  const handleSms = (student: AbsenteeItem, session: HistorySession) => {
    const phone = student.real_parent_phone || student.phone;
    if (!phone) {
      Alert.alert('No Phone', 'Parent phone number is not available.');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const msg = `Dear Parent, your ward ${student.name} (${student.id}) was marked absent for ${session.period || 'class'} on ${session.date}.`;
    const url = `sms:${cleanPhone}?body=${encodeURIComponent(msg)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open SMS composer.');
    });
  };

  const renderHistoryItem = ({ item, index }: { item: HistorySession; index: number }) => {
    const isExpanded = expandedCardId === item.id;
    const absList = item.absentees || [];

    return (
      <Animated.View
        entering={FadeInUp.delay(index * 40).duration(350)}
        layout={Layout.springify()}
        style={styles.historyCard}
      >
        {/* Top Header Row */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => toggleCardExpansion(item.id)}
          style={styles.cardClickableHeader}
        >
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.datePeriodRow}>
                <Text style={styles.date}>{item.date}</Text>
                {item.period ? (
                  <View style={styles.periodPill}>
                    <Text style={styles.periodPillText}>{item.period}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.subject}>{item.subject}</Text>
              <Text style={styles.className}>{item.className}</Text>
            </View>

            <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
              <View
                style={[
                  styles.badge,
                  item.absentCount > 0 ? styles.badgeAbsent : styles.badgePerfect,
                ]}
              >
                <Icon
                  name={item.absentCount > 0 ? 'person-off' : 'verified'}
                  size={14}
                  color={item.absentCount > 0 ? Colors.error : '#16A34A'}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.badgeText,
                    item.absentCount > 0 ? styles.badgeTextAbsent : styles.badgeTextPerfect,
                  ]}
                >
                  {item.absentCount > 0 ? `${item.absentCount} Absent` : '100% Present'}
                </Text>
              </View>

              <View style={styles.expandActionRow}>
                <Text style={styles.expandActionText}>
                  {isExpanded ? 'Hide Absentees' : 'View Absentees'}
                </Text>
                <Icon
                  name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={20}
                  color={Colors.primary}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* EXPANDABLE ABSENTEES LIST */}
        {isExpanded && (
          <View style={styles.absenteesExpandBox}>
            <View style={styles.expandTitleRow}>
              <Icon name="people-outline" size={18} color="#0F172A" style={{ marginRight: 6 }} />
              <Text style={styles.expandSectionTitle}>
                {absList.length > 0 ? `Absent Students (${absList.length})` : 'Attendance Summary'}
              </Text>
            </View>

            {absList.length > 0 ? (
              <View style={styles.absenteesListContainer}>
                {absList.map((student, sIdx) => (
                  <Animated.View
                    key={`${student.id}-${sIdx}`}
                    entering={FadeInRight.delay(sIdx * 30).duration(250)}
                    style={styles.absenteeRow}
                  >
                    <View style={styles.avatarMini}>
                      <Text style={styles.avatarMiniText}>{student.name.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.studentName}>{student.name}</Text>
                      <View style={styles.studentSubRow}>
                        <Text style={styles.studentId}>{student.id}</Text>
                        <View style={styles.dot} />
                        <Icon name="phone" size={11} color="#64748B" style={{ marginRight: 2 }} />
                        <Text style={styles.parentPhoneText}>
                          {student.real_parent_phone || student.phone || 'No Phone'}
                        </Text>
                      </View>
                    </View>

                    {/* Action buttons for parent */}
                    <View style={styles.rowActions}>
                      <TouchableOpacity
                        style={styles.miniCallBtn}
                        onPress={() => handleCall(student.real_parent_phone || student.phone)}
                        activeOpacity={0.7}
                      >
                        <Icon name="call" size={15} color="#16A34A" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.miniSmsBtn}
                        onPress={() => handleSms(student, item)}
                        activeOpacity={0.7}
                      >
                        <Icon name="textsms" size={15} color={Colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                ))}
              </View>
            ) : (
              <View style={styles.perfectAttendanceBox}>
                <Icon name="sentiment-very-satisfied" size={24} color="#16A34A" />
                <Text style={styles.perfectAttendanceText}>
                  All students were present for this session!
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Footer info & Share */}
        <View style={styles.cardFooter}>
          {item.smsSent ? (
            <View style={styles.smsSuccessBox}>
              <Icon name="check-circle" size={15} color={Colors.success} />
              <Text style={styles.smsSuccessText}>SMS Dispatched</Text>
            </View>
          ) : (
            <View />
          )}

          <TouchableOpacity style={styles.shareBtn} onPress={() => handleShare(item)}>
            <Icon name="share" size={18} color={Colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.shareBtnText}>Share Report</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <BreatheLoader message="Loading attendance logs..." />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={28} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Attendance Logs</Text>
          <TouchableOpacity onPress={handleClearHistory} style={styles.iconBtn}>
            <Icon name="delete-outline" size={26} color={Colors.error} />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Session History & Absentee Records</Text>
      </View>

      <FlatList
        data={history}
        keyExtractor={item => item.id}
        renderItem={renderHistoryItem}
        contentContainerStyle={[
          styles.listContainer,
          history.length === 0 && styles.listContainerEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon
              name="history"
              size={52}
              color={Colors.textSecondary}
              style={{ opacity: 0.5, marginBottom: 14 }}
            />
            <Text style={styles.emptyTitle}>No Attendance Records Yet</Text>
            <Text style={styles.emptySubtitle}>
              Submit attendance for any period to view history logs and absent students here.
            </Text>
            <TouchableOpacity
              style={styles.markBtn}
              onPress={() => navigation.navigate('ClassesList', { mode: 'attendance' })}
            >
              <Text style={styles.markBtnText}>Mark Attendance</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
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
  iconBtn: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  listContainer: {
    padding: 18,
    paddingBottom: 40,
    gap: 14,
  },
  listContainerEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  historyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardClickableHeader: {
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  datePeriodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  date: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 8,
  },
  periodPill: {
    backgroundColor: 'rgba(255, 93, 56, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  periodPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  subject: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  className: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 6,
  },
  badgeAbsent: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  badgePerfect: {
    backgroundColor: '#DCFCE7',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  badgeTextAbsent: {
    color: Colors.error,
  },
  badgeTextPerfect: {
    color: '#15803D',
  },
  expandActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginRight: 2,
  },
  absenteesExpandBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  expandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  expandSectionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  absenteesListContainer: {
    gap: 8,
  },
  absenteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarMini: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMiniText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.error,
  },
  studentName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  studentSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  studentId: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#94A3B8',
    marginHorizontal: 5,
  },
  parentPhoneText: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '600',
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniCallBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniSmsBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 93, 56, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  perfectAttendanceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  perfectAttendanceText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  smsSuccessBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smsSuccessText: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '700',
    marginLeft: 5,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 93, 56, 0.08)',
  },
  shareBtnText: {
    fontSize: 12.5,
    color: Colors.primary,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  markBtn: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 14,
    backgroundColor: Colors.primary,
  },
  markBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
