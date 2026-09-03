import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
  TextInput,
  Modal,
  Alert,
  NativeModules,
  PermissionsAndroid,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInUp, FadeInRight, Layout } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';
import { API_BASE_URL } from '../constants/Config';
import BreatheLoader from '../components/BreatheLoader';

export interface AbsenteeRecord {
  id: string;
  name: string;
  phone: string;
  real_parent_phone: string;
  className: string;
  subject: string;
  period: string;
  time: string;
  date: string;
  called: boolean;
  smsSent: boolean;
  session_id?: string;
}

export default function Notify() {
  const navigation = useNavigation<any>();
  const [absentees, setAbsentees] = useState<AbsenteeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSessionFilter, setSelectedSessionFilter] = useState('all');

  // Backend-driven SMS mode (determined by backend .env SMS_TEST_MODE)
  const [testMode, setTestMode] = useState<boolean>(true);
  const [testPhone, setTestPhone] = useState<string>('9442211279');

  // Custom SMS template configuration
  const defaultTemplate =
    'Dear Parent, your ward {name} ({id}) is absent for {period} ({time}), Date: {date}.';
  const [customTemplate, setCustomTemplate] = useState(defaultTemplate);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [tempTemplateInput, setTempTemplateInput] = useState(defaultTemplate);

  // Single-student custom SMS modal
  const [activeStudentForSms, setActiveStudentForSms] = useState<AbsenteeRecord | null>(null);
  const [singleSmsText, setSingleSmsText] = useState('');
  const [singleSmsModalVisible, setSingleSmsModalVisible] = useState(false);

  // Batch sending state
  const [batchSending, setBatchSending] = useState(false);

  // 1. Fetch SMS mode automatically from backend API (driven by server .env SMS_TEST_MODE)
  const syncSmsModeFromBackend = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${API_BASE_URL}/sms-mode`, { signal: controller.signal });
      clearTimeout(timer);
      const data = await res.json();
      if (typeof data.test_mode === 'boolean') {
        setTestMode(data.test_mode);
        if (data.test_phone) setTestPhone(data.test_phone);
        await AsyncStorage.setItem('smsTestMode', JSON.stringify(data.test_mode));
      }
    } catch (err) {
      // Offline fallback: check cached mode
      const stored = await AsyncStorage.getItem('smsTestMode');
      if (stored !== null) {
        setTestMode(JSON.parse(stored));
      }
    }
  }, []);

  useEffect(() => {
    syncSmsModeFromBackend();
    AsyncStorage.getItem('customAbsenteeTemplate').then(stored => {
      if (stored) {
        setCustomTemplate(stored);
        setTempTemplateInput(stored);
      }
    });
  }, [syncSmsModeFromBackend]);

  // Helper to compile template for a student
  const generateMessageForStudent = useCallback(
    (student: AbsenteeRecord, templateToUse: string = customTemplate) => {
      return templateToUse
        .replace(/{name}/g, student.name)
        .replace(/{id}/g, student.id)
        .replace(/{period}/g, student.period || 'Period')
        .replace(/{time}/g, student.time || '')
        .replace(/{date}/g, student.date || 'Today')
        .replace(/{subject}/g, student.subject || 'Class')
        .replace(/{class}/g, student.className || '');
    },
    [customTemplate]
  );

  // Helper to get active destination phone (driven by backend test_mode)
  const getTargetPhone = useCallback(
    (student: AbsenteeRecord) => {
      if (testMode) {
        return testPhone;
      }
      return student.real_parent_phone || student.phone || testPhone;
    },
    [testMode, testPhone]
  );

  // 2. Load absentees: Loads ONLY real attendance marked in the app
  const loadAbsentees = useCallback(async () => {
    try {
      await syncSmsModeFromBackend();

      const stored = await AsyncStorage.getItem('markedAbsentees');
      const dedupMap = new Map<string, AbsenteeRecord>();

      if (stored) {
        const parsedSessions = JSON.parse(stored);
        if (Array.isArray(parsedSessions)) {
          parsedSessions.forEach((session: any) => {
            // Filter out old dummy sessions if any
            if (session.sessionId === 'session-101' || session.sessionId === 'session-102') {
              return;
            }
            if (Array.isArray(session.absentees)) {
              session.absentees.forEach((s: any) => {
                const parentPhone = s.real_parent_phone || s.phone || '';
                const key = `${s.id}_${session.period || 'period'}_${session.subject || 'subject'}`;
                dedupMap.set(key, {
                  id: s.id,
                  name: s.name,
                  phone: parentPhone,
                  real_parent_phone: parentPhone,
                  className: session.className || 'III IT G',
                  subject: session.subject || 'Class',
                  period: session.period || 'Period',
                  time: session.time || '',
                  date: session.date || 'Today',
                  called: !!s.called,
                  smsSent: !!s.smsSent,
                  session_id: session.sessionId || 'session',
                });
              });
            }
          });
        }
      }

      // Check remote server if available and merge non-duplicate records
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(`${API_BASE_URL}/absentees`, { signal: controller.signal });
        clearTimeout(timeout);
        const serverData = await res.json();
        if (Array.isArray(serverData)) {
          serverData.forEach((record: any) => {
            const student = record.Student;
            const timetable = record.Timetable;
            if (student) {
              const realPhone = student.original_parent_phone || student.parent_phone || '';
              const periodLabel = `Period ${timetable?.period || 1}`;
              const subjectTitle = timetable?.Subject?.title || 'Class';
              const key = `${student.roll_no}_${periodLabel}_${subjectTitle}`;

              if (!dedupMap.has(key)) {
                dedupMap.set(key, {
                  id: student.roll_no,
                  name: student.name,
                  phone: realPhone,
                  real_parent_phone: realPhone,
                  className: student.section || 'III IT G',
                  subject: subjectTitle,
                  period: periodLabel,
                  time: '',
                  date: record.date || 'Today',
                  called: false,
                  smsSent: false,
                  session_id: `server-${record.id}`,
                });
              }
            }
          });
        }
      } catch (err) {
        // Silent
      }

      setAbsentees(Array.from(dedupMap.values()));
    } catch (e) {
      console.log('Error loading absentees:', e);
      setAbsentees([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [syncSmsModeFromBackend]);

  useFocusEffect(
    useCallback(() => {
      loadAbsentees();
    }, [loadAbsentees])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAbsentees();
  };

  // 3. Save current absentee list state
  const persistAbsenteesState = async (updatedList: AbsenteeRecord[]) => {
    setAbsentees(updatedList);
    try {
      const sessionMap = new Map<string, any>();
      updatedList.forEach(item => {
        const sessId = item.session_id || 'default';
        if (!sessionMap.has(sessId)) {
          sessionMap.set(sessId, {
            sessionId: sessId,
            date: item.date,
            time: item.time,
            period: item.period,
            className: item.className,
            subject: item.subject,
            absentees: [],
          });
        }
        const sessionObj = sessionMap.get(sessId);
        const existingIdx = sessionObj.absentees.findIndex((a: any) => a.id === item.id);
        const studentObj = {
          id: item.id,
          name: item.name,
          phone: item.real_parent_phone || item.phone,
          real_parent_phone: item.real_parent_phone || item.phone,
          called: item.called,
          smsSent: item.smsSent,
        };
        if (existingIdx >= 0) {
          sessionObj.absentees[existingIdx] = studentObj;
        } else {
          sessionObj.absentees.push(studentObj);
        }
      });
      await AsyncStorage.setItem('markedAbsentees', JSON.stringify(Array.from(sessionMap.values())));
    } catch (e) {
      console.log('Error persisting absentees:', e);
    }
  };

  // 4. Phone Call Action
  const handleCallParent = (student: AbsenteeRecord) => {
    const destPhone = getTargetPhone(student);
    const cleanPhone = destPhone.replace(/[^0-9+]/g, '');
    const url = `tel:${cleanPhone}`;

    Linking.canOpenURL(url)
      .then(supported => {
        if (!supported) {
          Alert.alert('Unable to Call', `Dialer is not supported for ${cleanPhone}`);
        } else {
          const updated = absentees.map(s =>
            s.id === student.id && s.period === student.period ? { ...s, called: true } : s
          );
          persistAbsenteesState(updated);
          Linking.openURL(url);
        }
      })
      .catch(err => console.log('Dialer error:', err));
  };

  // 5. Open Custom SMS Modal for single student
  const handleOpenSmsModal = (student: AbsenteeRecord) => {
    setActiveStudentForSms(student);
    setSingleSmsText(generateMessageForStudent(student));
    setSingleSmsModalVisible(true);
  };

  // 6. Send Single SMS
  const handleSendSingleSms = async () => {
    if (!activeStudentForSms) return;
    const destPhone = getTargetPhone(activeStudentForSms);
    const message = singleSmsText;

    let directSent = false;
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.SEND_SMS);
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          const DirectSms = NativeModules.DirectSms;
          if (DirectSms && DirectSms.sendDirectSms) {
            DirectSms.sendDirectSms(destPhone, message);
            directSent = true;
          }
        }
      } catch (err) {
        console.log('Direct SMS error:', err);
      }
    }

    if (!directSent) {
      const smsUrl = `sms:${destPhone}?body=${encodeURIComponent(message)}`;
      Linking.openURL(smsUrl).catch(() => {
        Alert.alert('SMS Error', 'Could not open SMS composer on this device.');
      });
    }

    const updated = absentees.map(s =>
      s.id === activeStudentForSms.id && s.period === activeStudentForSms.period
        ? { ...s, smsSent: true }
        : s
    );
    persistAbsenteesState(updated);

    setSingleSmsModalVisible(false);
    Alert.alert('SMS Sent', `Absentee alert dispatched for ${activeStudentForSms.name}.`);
  };

  // 7. Batch Send SMS to All Absentees
  const handleNotifyAll = async () => {
    const pendingList = filteredAbsentees.filter(s => !s.smsSent);
    const targetList = pendingList.length > 0 ? pendingList : filteredAbsentees;

    if (targetList.length === 0) {
      Alert.alert('No Absentees', 'There are no absent students in the current list.');
      return;
    }

    Alert.alert(
      'Confirm Broadcast',
      `Send absentee alert SMS to parents of ${targetList.length} student(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send SMS All',
          style: 'default',
          onPress: async () => {
            setBatchSending(true);

            if (Platform.OS === 'android') {
              try {
                const granted = await PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.SEND_SMS
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                  const DirectSms = NativeModules.DirectSms;
                  targetList.forEach(student => {
                    const destPhone = getTargetPhone(student);
                    const msg = generateMessageForStudent(student);
                    DirectSms.sendDirectSms(destPhone, msg);
                  });
                }
              } catch (e) {
                console.log('Batch SMS error:', e);
              }
            }

            const updated = absentees.map(s => {
              const matched = targetList.some(t => t.id === s.id && t.period === s.period);
              return matched ? { ...s, smsSent: true } : s;
            });
            await persistAbsenteesState(updated);
            setBatchSending(false);

            Alert.alert(
              'Broadcast Complete',
              `SMS alerts sent for ${targetList.length} absent student(s).`
            );
          },
        },
      ]
    );
  };

  // 8. Save Global Custom Template
  const handleSaveTemplate = async () => {
    setCustomTemplate(tempTemplateInput);
    await AsyncStorage.setItem('customAbsenteeTemplate', tempTemplateInput);
    setTemplateModalVisible(false);
    Alert.alert('Template Saved', 'Your custom message template has been updated.');
  };

  // 9. Clear Logs
  const handleClearSessions = () => {
    Alert.alert(
      'Clear Logs',
      'Are you sure you want to clear the marked absentee list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('markedAbsentees');
            setAbsentees([]);
          },
        },
      ]
    );
  };

  // Distinct sessions for filter chips
  const distinctSessions = Array.from(
    new Set(absentees.map(a => `${a.period} • ${a.subject}`))
  );

  // Filtered absentees based on search query and session
  const filteredAbsentees = absentees.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.phone.includes(searchQuery);
    const sessionKey = `${item.period} • ${item.subject}`;
    const matchesSession =
      selectedSessionFilter === 'all' || sessionKey === selectedSessionFilter;
    return matchesSearch && matchesSession;
  });

  const totalAbsenteesCount = absentees.length;
  const totalCallsPlaced = absentees.filter(a => a.called).length;
  const totalSmsSent = absentees.filter(a => a.smsSent).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <BreatheLoader message="Syncing attendance absentees..." />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* App Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={28} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Notify Parents</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {absentees.length > 0 && (
              <TouchableOpacity onPress={handleClearSessions} style={styles.iconActionBtn}>
                <Icon name="delete-outline" size={22} color="#64748B" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => setTemplateModalVisible(true)}
              style={styles.templateBtn}
            >
              <Icon name="edit-note" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.subtitle}>Parent Contact & Absentee Alert Center</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Quick Stats Banner */}
        {totalAbsenteesCount > 0 && (
          <Animated.View entering={FadeInUp.delay(50).duration(400)} style={styles.statsCard}>
            <View style={styles.statCol}>
              <Text style={styles.statNumber}>{totalAbsenteesCount}</Text>
              <Text style={styles.statLabel}>Marked Absent</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={[styles.statNumber, { color: '#16A34A' }]}>{totalCallsPlaced}</Text>
              <Text style={styles.statLabel}>Calls Placed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={[styles.statNumber, { color: Colors.primary }]}>{totalSmsSent}</Text>
              <Text style={styles.statLabel}>SMS Sent</Text>
            </View>
          </Animated.View>
        )}

        {/* Message Template Preview Banner */}
        <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.templateBanner}>
          <View style={styles.templateBannerHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="textsms" size={18} color="#D97706" style={{ marginRight: 6 }} />
              <Text style={styles.templateBannerTitle}>SMS Message Format</Text>
            </View>
            <TouchableOpacity onPress={() => setTemplateModalVisible(true)}>
              <Text style={styles.editTemplateText}>Edit Template</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.templatePreviewText} numberOfLines={2}>
            {customTemplate}
          </Text>
        </Animated.View>

        {/* Session Filter Chips */}
        {distinctSessions.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipContainer}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedSessionFilter === 'all' && styles.filterChipActive,
              ]}
              onPress={() => setSelectedSessionFilter('all')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedSessionFilter === 'all' && styles.filterChipTextActive,
                ]}
              >
                All Sessions ({absentees.length})
              </Text>
            </TouchableOpacity>
            {distinctSessions.map(session => (
              <TouchableOpacity
                key={session}
                style={[
                  styles.filterChip,
                  selectedSessionFilter === session && styles.filterChipActive,
                ]}
                onPress={() => setSelectedSessionFilter(session)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedSessionFilter === session && styles.filterChipTextActive,
                  ]}
                >
                  {session}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Search Box */}
        {absentees.length > 0 && (
          <View style={styles.searchBox}>
            <Icon name="search" size={22} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by student name, roll no, or phone..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Absentees List */}
        <View style={styles.listWrap}>
          {filteredAbsentees.map((item, index) => (
            <Animated.View
              key={`${item.id}-${item.period}-${index}`}
              entering={FadeInRight.delay(index * 50).duration(350)}
              layout={Layout.springify()}
              style={styles.absenteeCard}
            >
              <View style={styles.cardTopRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarLetter}>{item.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.studentNameText}>{item.name}</Text>
                  <View style={styles.rollBadgeRow}>
                    <Text style={styles.rollNoText}>{item.id}</Text>
                    <View style={styles.dotSeparator} />
                    <Text style={styles.classSectionText}>{item.className}</Text>
                  </View>
                </View>
                <View style={styles.absentPill}>
                  <Text style={styles.absentPillText}>Absent</Text>
                </View>
              </View>

              {/* Period & Subject Info */}
              <View style={styles.sessionInfoBox}>
                <View style={styles.sessionLine}>
                  <Icon name="schedule" size={14} color="#64748B" style={{ marginRight: 5 }} />
                  <Text style={styles.sessionLineText}>
                    {item.period} {item.time ? `(${item.time})` : ''} • {item.date}
                  </Text>
                </View>
                <View style={[styles.sessionLine, { marginTop: 4 }]}>
                  <Icon
                    name="menu-book"
                    size={14}
                    color={Colors.primary}
                    style={{ marginRight: 5 }}
                  />
                  <Text style={styles.subjectText}>{item.subject}</Text>
                </View>
              </View>

              {/* Parent Contact Info */}
              <View style={styles.contactRow}>
                <Icon name="phone" size={15} color="#64748B" style={{ marginRight: 6 }} />
                <Text style={styles.phoneLabel}>Parent Contact:</Text>
                <Text style={styles.phoneValue}>{item.real_parent_phone || item.phone}</Text>
              </View>

              {/* Status Badges & Action Buttons */}
              <View style={styles.actionFooterRow}>
                <View style={styles.statusBadgesWrap}>
                  {item.called && (
                    <View style={styles.calledBadge}>
                      <Icon name="check" size={12} color="#16A34A" />
                      <Text style={styles.calledBadgeText}>Called</Text>
                    </View>
                  )}
                  {item.smsSent && (
                    <View style={styles.smsBadge}>
                      <Icon name="done-all" size={12} color="#2563EB" />
                      <Text style={styles.smsBadgeText}>SMS Sent</Text>
                    </View>
                  )}
                </View>

                <View style={styles.buttonActionRow}>
                  {/* Call Button */}
                  <TouchableOpacity
                    style={[styles.callBtn, item.called && styles.callBtnCalled]}
                    onPress={() => handleCallParent(item)}
                    activeOpacity={0.8}
                  >
                    <Icon name="call" size={16} color="#ffffff" style={{ marginRight: 4 }} />
                    <Text style={styles.callBtnText}>
                      {item.called ? 'Call Again' : 'Call Parent'}
                    </Text>
                  </TouchableOpacity>

                  {/* Send Custom SMS Button */}
                  <TouchableOpacity
                    style={[styles.smsBtn, item.smsSent && styles.smsBtnSent]}
                    onPress={() => handleOpenSmsModal(item)}
                    activeOpacity={0.8}
                  >
                    <Icon name="send" size={15} color="#ffffff" style={{ marginRight: 4 }} />
                    <Text style={styles.smsBtnText}>{item.smsSent ? 'Resend' : 'Send SMS'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          ))}

          {/* EMPTY STATE: When no attendance has been marked yet */}
          {filteredAbsentees.length === 0 && (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconCircle}>
                <Icon name="event-available" size={48} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No Absentees Recorded</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? 'No students matched your search query.'
                  : "You haven't marked attendance for any class today. Once you submit attendance, any absent students will appear here."}
              </Text>
              <TouchableOpacity
                style={styles.markAttendanceBtn}
                onPress={() => navigation.navigate('ClassesList', { mode: 'attendance' })}
                activeOpacity={0.85}
              >
                <Icon name="fact-check" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.markAttendanceBtnText}>Mark Attendance Now</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Bottom Action: Notify All */}
      {filteredAbsentees.length > 0 && (
        <View style={styles.floatingFooter}>
          <TouchableOpacity
            style={styles.notifyAllButton}
            onPress={handleNotifyAll}
            disabled={batchSending}
            activeOpacity={0.85}
          >
            <Icon name="campaign" size={24} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.notifyAllText}>
              {batchSending
                ? 'Dispatching Broadcast...'
                : `Notify All (${filteredAbsentees.length}) via SMS`}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* MODAL 1: Edit Global SMS Template */}
      <Modal visible={templateModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Edit Custom SMS Template</Text>
              <TouchableOpacity onPress={() => setTemplateModalVisible(false)}>
                <Icon name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>
              Available placeholders:{'\n'}
              <Text style={{ fontWeight: '700', color: Colors.primary }}>
                {'{name}'}, {'{id}'}, {'{period}'}, {'{time}'}, {'{date}'}, {'{subject}'}
              </Text>
            </Text>

            <TextInput
              style={styles.templateTextInput}
              multiline
              numberOfLines={4}
              value={tempTemplateInput}
              onChangeText={setTempTemplateInput}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => setTempTemplateInput(defaultTemplate)}
              >
                <Text style={styles.resetBtnText}>Reset Default</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveTemplateBtn} onPress={handleSaveTemplate}>
                <Text style={styles.saveTemplateText}>Save Template</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: Send Single Custom SMS */}
      <Modal visible={singleSmsModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Send Absent Alert</Text>
              <TouchableOpacity onPress={() => setSingleSmsModalVisible(false)}>
                <Icon name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {activeStudentForSms && (
              <View style={styles.targetStudentBanner}>
                <Icon name="person" size={22} color={Colors.primary} style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.targetStudentText}>
                    {activeStudentForSms.name} ({activeStudentForSms.id})
                  </Text>
                  <Text style={styles.targetPhoneText}>
                    To Parent: {activeStudentForSms.real_parent_phone || activeStudentForSms.phone}
                  </Text>
                </View>
              </View>
            )}

            <Text style={styles.smsInputLabel}>Message Preview:</Text>
            <TextInput
              style={styles.singleSmsInput}
              multiline
              numberOfLines={4}
              value={singleSmsText}
              onChangeText={setSingleSmsText}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setSingleSmsModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sendDirectBtn} onPress={handleSendSingleSms}>
                <Icon name="send" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.sendDirectText}>Send SMS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  iconActionBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  templateBtn: {
    padding: 6,
    backgroundColor: 'rgba(255, 93, 56, 0.1)',
    borderRadius: 10,
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
  scrollContent: {
    padding: 18,
    paddingBottom: 110,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 14,
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.error,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
  },
  templateBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 14,
  },
  templateBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  templateBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  editTemplateText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  templatePreviewText: {
    fontSize: 12.5,
    color: '#78350F',
    lineHeight: 18,
  },
  filterChipContainer: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  filterChip: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    padding: 0,
  },
  listWrap: {
    gap: 14,
  },
  absenteeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.error,
  },
  studentNameText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  rollBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  rollNoText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
    marginHorizontal: 6,
  },
  classSectionText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
  absentPill: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  absentPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.error,
  },
  sessionInfoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 10,
  },
  sessionLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionLineText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  subjectText: {
    fontSize: 12.5,
    color: Colors.primary,
    fontWeight: '700',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 10,
  },
  phoneLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
    marginRight: 6,
  },
  phoneValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  actionFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statusBadgesWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  calledBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
    marginLeft: 3,
  },
  smsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  smsBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
    marginLeft: 3,
  },
  buttonActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  callBtnCalled: {
    backgroundColor: '#059669',
  },
  callBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '700',
  },
  smsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  smsBtnSent: {
    backgroundColor: '#4338CA',
  },
  smsBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '700',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 93, 56, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
  markAttendanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  markAttendanceBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  floatingFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  notifyAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  notifyAllText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  templateTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    color: '#0F172A',
    textAlignVertical: 'top',
    height: 100,
    marginBottom: 16,
  },
  modalBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  resetBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  saveTemplateBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  saveTemplateText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  targetStudentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  targetStudentText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  targetPhoneText: {
    fontSize: 12.5,
    marginTop: 2,
    color: '#64748B',
    fontWeight: '600',
  },
  smsInputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  singleSmsInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    color: '#0F172A',
    textAlignVertical: 'top',
    height: 110,
    marginBottom: 16,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  sendDirectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  sendDirectText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
