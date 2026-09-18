import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, NativeModules, PermissionsAndroid, Platform, Alert, TextInput, StatusBar, Modal, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated, { FadeInRight, FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';
import { API_BASE_URL } from '../constants/Config';
import BreatheLoader from '../components/BreatheLoader';
import { SKCT_STUDENTS_G, PERIOD_SCHEDULE } from '../constants/DummyData';
import { saveAttendanceLocally, getSavedAttendanceForSession, unlockAttendanceSession } from '../services/AttendanceService';

export default function Attendance() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { classDetails } = route.params || { classDetails: { subject: 'Unknown', className: 'Unknown' } };
  
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [absentInput, setAbsentInput] = useState('');
  const [fastMarkModalVisible, setFastMarkModalVisible] = useState(false);

  const handleUnlockSession = () => {
    Alert.alert(
      'Unlock Session',
      'Are you sure you want to unlock this attendance session to make changes?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlock',
          style: 'destructive',
          onPress: async () => {
            const todayIso = new Date().toISOString().split('T')[0];
            const targetTimetableId = classDetails.timetable_id || classDetails.timetableId || classDetails.id;
            await unlockAttendanceSession(
              todayIso,
              classDetails.className,
              classDetails.subject,
              targetTimetableId
            );
            setIsLocked(false);
            Alert.alert('Session Unlocked', 'You can now edit and re-submit attendance for this session.');
          }
        }
      ]
    );
  };

  React.useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const loadStudentsAndSavedState = async () => {
      const todayIso = new Date().toISOString().split('T')[0];
      const targetTimetableId = classDetails.timetable_id || classDetails.timetableId || classDetails.id;

      // Check if attendance was already marked locally for this session
      const savedSession = await getSavedAttendanceForSession(
        todayIso,
        classDetails.className,
        classDetails.subject,
        targetTimetableId
      );

      if (savedSession && (savedSession.isLocked || savedSession.smsSent)) {
        setIsLocked(true);
      } else {
        setIsLocked(false);
      }

      const savedStatusMap = new Map<string, string>();
      if (savedSession && Array.isArray(savedSession.records)) {
        savedSession.records.forEach(r => {
          if (r.id) savedStatusMap.set(String(r.id), r.status);
        });
      }

      const applySavedStatus = (list: any[]) => {
        const updated = list.map((s: any) => {
          const status = savedStatusMap.get(String(s.id));
          return {
            ...s,
            isAbsent: status === 'Absent',
            isOnDuty: status === 'OD',
          };
        });
        return sortStudents(updated);
      };

      try {
        const res = await fetch(`${API_BASE_URL}/students?section=${encodeURIComponent(classDetails.className)}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data) && data.length > 0) {
            const mapped = data.map((s: any) => ({
              id: s.roll_no || s.rollNo,
              db_id: s.id,
              name: s.name,
              phone: s.parent_phone || s.parentPhone || s.phone,
              real_parent_phone: s.original_parent_phone || s.parent_phone || s.parentPhone || s.phone,
              isAbsent: false,
              isOnDuty: false
            }));
            setStudents(applySavedStatus(mapped));
            setLoading(false);
            return;
          }
        }
      } catch (e) {}

      if (isMounted) {
        const fallbackList = SKCT_STUDENTS_G.map(s => ({
          ...s,
          real_parent_phone: s.phone
        }));
        setStudents(applySavedStatus(fallbackList));
        setLoading(false);
      }
    };

    loadStudentsAndSavedState();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [classDetails.className, classDetails.subject, classDetails.timetable_id]);

  const sortStudents = (list: any[]) => {
    return [...list].sort((a, b) => {
      const aIsMarked = a.isAbsent || a.isOnDuty;
      const bIsMarked = b.isAbsent || b.isOnDuty;
      if (aIsMarked && !bIsMarked) return -1;
      if (!aIsMarked && bIsMarked) return 1;
      return String(a.id).localeCompare(String(b.id));
    });
  };

  const markStatus = (id: string, status: 'present' | 'absent' | 'onduty') => {
    if (isLocked) return;
    setStudents(prev => {
      const updated = prev.map(s => s.id === id ? { 
        ...s, 
        isAbsent: status === 'absent', 
        isOnDuty: status === 'onduty' 
      } : s);
      return sortStudents(updated);
    });
  };

  const handleFastMark = () => {
    if (isLocked || absentInput.trim().length === 0) return;
    setFastMarkModalVisible(true);
  };

  const applyFastMark = (status: 'present' | 'absent' | 'onduty') => {
    if (isLocked) return;
    const identifiers = absentInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
    setStudents(prev => {
      const updated = prev.map(student => {
        const isMarkedByInput = identifiers.some(id => String(student.id).endsWith(id));
        if (isMarkedByInput) {
          return { ...student, isAbsent: status === 'absent', isOnDuty: status === 'onduty' };
        }
        return student;
      });
      return sortStudents(updated);
    });
    setAbsentInput(''); // Clear it out after marking
    setFastMarkModalVisible(false);
  };

  const handleSubmit = async (sendSms: boolean = false) => {
    if (isLocked) {
      Alert.alert('Session Locked', 'Attendance for this session was already submitted with SMS alerts and cannot be edited.');
      return;
    }

    const absentStudents = students.filter(s => s.isAbsent);
    const targetTimetableId = classDetails.timetable_id || classDetails.timetableId || classDetails.id || 1;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const isoDate = now.toISOString().split('T')[0];
    const sessionId = `session-${Date.now()}`;

    // Check SMS Mode (Testing Mode vs Live Mode)
    let isTestMode = true;
    let testPhone = '9442211279';
    try {
      const storedMode = await AsyncStorage.getItem('smsTestMode');
      if (storedMode !== null) {
        isTestMode = JSON.parse(storedMode);
      }
      const storedPhone = await AsyncStorage.getItem('smsTestPhone');
      if (storedPhone) {
        testPhone = storedPhone;
      }
    } catch (e) {
      isTestMode = true;
    }

    // =========================================================================
    // STEP 1: GUARANTEED IMMEDIATE LOCAL STORAGE (MUST HAPPEN FIRST)
    // =========================================================================
    const fullAttendanceRecord = {
      sessionId,
      date: dateStr,
      isoDate: isoDate,
      time: classDetails.time || 'Period Session',
      period: classDetails.time ? (classDetails.time.includes('(') ? classDetails.time.split('(')[0].trim() : classDetails.time) : 'Period',
      className: classDetails.className || 'III IT G',
      subject: classDetails.subject || 'Class',
      timetable_id: targetTimetableId,
      totalStudents: students.length,
      presentCount: students.filter(s => !s.isAbsent && !s.isOnDuty).length,
      absentCount: absentStudents.length,
      odCount: students.filter(s => s.isOnDuty).length,
      records: students.map(s => ({
        id: s.id,
        db_id: s.db_id,
        name: s.name,
        status: (s.isAbsent ? 'Absent' : s.isOnDuty ? 'OD' : 'Present') as 'Present' | 'Absent' | 'OD',
        phone: s.real_parent_phone || s.phone,
        real_parent_phone: s.real_parent_phone || s.phone,
      })),
      absentees: absentStudents.map(s => ({
        id: s.id,
        name: s.name,
        phone: isTestMode ? testPhone : (s.real_parent_phone || s.phone || testPhone),
        real_parent_phone: s.real_parent_phone || s.phone || testPhone,
        called: false,
        smsSent: sendSms,
      })),
      syncedToBackend: false,
      isLocked: sendSms || isLocked,
      smsSent: sendSms || isLocked,
      createdAt: now.toISOString(),
    };

    try {
      // Save locally via AttendanceService immediately
      await saveAttendanceLocally(fullAttendanceRecord);
      console.log('Attendance successfully stored locally in AsyncStorage');
    } catch (cacheErr) {
      console.error('Critical: Error saving attendance locally:', cacheErr);
    }

    // =========================================================================
    // STEP 2: SAVE TO REMOTE DATABASE / SYNC QUEUE
    // =========================================================================
    try {
      const recordsPayload = students.map((s, idx) => ({
        student_id: s.db_id || (idx + 1),
        roll_no: s.id,
        name: s.name,
        status: s.isAbsent ? 'Absent' : s.isOnDuty ? 'OD' : 'Present'
      }));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const periodVal = classDetails.period ? `Period ${classDetails.period}` : (classDetails.time ? (classDetails.time.includes('(') ? classDetails.time.split('(')[0].trim() : classDetails.time) : 'Period 1');
      const timeVal = classDetails.time || '08:15 AM - 09:15 AM';
      const subjectVal = classDetails.subject || 'Applied Cryptography';
      const dayOrderVal = classDetails.day_order || classDetails.day || 4;

      const res = await fetch(`${API_BASE_URL}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timetable_id: targetTimetableId,
          date: isoDate,
          day_order: dayOrderVal,
          period: periodVal,
          time: timeVal,
          subject_name: subjectVal,
          subject: subjectVal,
          section: classDetails.className || 'III IT G',
          records: recordsPayload
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const resData = await res.json();
        console.log('Attendance API response:', resData);
      }
    } catch (err) {
      console.log('Remote attendance API offline (safely stored locally):', err);
    }

    // =========================================================================
    // STEP 3: OPTIONAL SMS DISPATCH FOR ABSENT STUDENTS
    // =========================================================================
    if (sendSms && absentStudents.length > 0 && Platform.OS === 'android') {
      const failedSmsList: { phone: string; message: string }[] = [];
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.SEND_SMS,
          {
            title: 'SMS Permission Required',
            message: 'ClassTrack needs to send an SMS alert to parents of absent students.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        const DirectSms = NativeModules.DirectSms;

        for (const student of absentStudents) {
          const destPhone = isTestMode ? testPhone : (student.real_parent_phone || student.phone);
          if (destPhone) {
            let periodInfo = '';
            if (classDetails.time && classDetails.time.includes('(')) {
              periodInfo = classDetails.time;
            } else if (classDetails.time) {
              periodInfo = classDetails.time;
            } else if (classDetails.period && PERIOD_SCHEDULE[Number(classDetails.period)]) {
              const sched = PERIOD_SCHEDULE[Number(classDetails.period)];
              periodInfo = `Period ${classDetails.period} (${sched.timeRange})`;
            } else if (classDetails.period) {
              periodInfo = `Period ${classDetails.period}`;
            } else {
              periodInfo = 'Period Session';
            }
            const message = `Dear Parent, your ward ${student.name} (${student.id}) is marked ABSENT for ${classDetails.subject} [${periodInfo}] today.\nஅன்பான பெற்றோரே, உங்கள் குழந்தை ${student.name} (${student.id}) இன்று ${classDetails.subject} [${periodInfo}] வகுப்பிற்கு வரவில்லை.\nSKCT - Contact Class Teacher.`;
            let sentDirectly = false;
            if (granted === PermissionsAndroid.RESULTS.GRANTED && DirectSms && DirectSms.sendDirectSms) {
              try {
                await DirectSms.sendDirectSms(destPhone, message);
                sentDirectly = true;
              } catch (e) {
                console.log('Direct background SMS failed for:', destPhone, e);
              }
            }
            if (!sentDirectly) {
              failedSmsList.push({ phone: destPhone, message });
            }
          }
        }

        // If direct SMS was blocked, open native SMS app for the first absentee
        if (failedSmsList.length > 0) {
          const target = failedSmsList[0];
          const smsUrl = `sms:${target.phone}?body=${encodeURIComponent(target.message)}`;
          Linking.canOpenURL(smsUrl).then(supported => {
            if (supported) {
              Linking.openURL(smsUrl).catch(() => {});
            }
          }).catch(() => {});
        }
      } catch (err) {
        console.warn('SMS dispatch error:', err);
      }
    }

    navigation.navigate('Success', { absentStudents, classDetails });
  };

  const renderStudent = ({ item, index }: { item: any, index: number }) => (
    <View style={{ opacity: isLocked ? 0.75 : 1 }}>
      <View style={styles.studentCard}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.name}</Text>
          <Text style={styles.studentId}>{item.id}</Text>
        </View>
        <View style={styles.toggleGroup}>
          <TouchableOpacity 
            style={[styles.toggleBtn, (!item.isAbsent && !item.isOnDuty) ? styles.toggleBtnActivePresent : styles.toggleBtnInactive]}
            onPress={() => markStatus(item.id, 'present')}
            disabled={isLocked}
            activeOpacity={isLocked ? 1 : 0.7}
          >
            <Text style={[styles.toggleText, (!item.isAbsent && !item.isOnDuty) ? styles.toggleTextActive : styles.toggleTextInactive]}>Present</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, item.isAbsent ? styles.toggleBtnActiveAbsent : styles.toggleBtnInactive]}
            onPress={() => markStatus(item.id, 'absent')}
            disabled={isLocked}
            activeOpacity={isLocked ? 1 : 0.7}
          >
            <Text style={[styles.toggleText, item.isAbsent ? styles.toggleTextActive : styles.toggleTextInactive]}>Absent</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, item.isOnDuty ? styles.toggleBtnActiveOD : styles.toggleBtnInactive]}
            onPress={() => markStatus(item.id, 'onduty')}
            disabled={isLocked}
            activeOpacity={isLocked ? 1 : 0.7}
          >
            <Text style={[styles.toggleText, item.isOnDuty ? styles.toggleTextActive : styles.toggleTextInactive]}>OD</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <BreatheLoader message="Loading student list..." />
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
          <Text style={styles.title}>{classDetails.className}</Text>
          <View style={{ width: 28 }} />
        </View>
        <Text style={styles.subtitle}>{classDetails.subject}</Text>
      </View>

      <View style={styles.listContainer}>
        {isLocked && (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.lockedBanner}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="lock" size={20} color="#92400E" style={{ marginRight: 8 }} />
              <Text style={styles.lockedBannerText}>
                Attendance Locked (SMS Sent).
              </Text>
            </View>
            <TouchableOpacity style={styles.unlockBannerBtn} onPress={handleUnlockSession}>
              <Icon name="lock-open" size={16} color="#D97706" style={{ marginRight: 4 }} />
              <Text style={styles.unlockBannerText}>Unlock</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {!isLocked && (
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.fastInputContainer}>
            <Text style={styles.fastInputLabel}>Fast Absent Marking (Enter Last Digits)</Text>
            <View style={styles.fastInputRow}>
              <TextInput
                style={styles.fastInput}
                placeholder="e.g. 001, 005"
                placeholderTextColor="#94A3B8"
                value={absentInput}
                onChangeText={setAbsentInput}
                keyboardType="number-pad"
              />
              <TouchableOpacity style={styles.fastMarkBtn} onPress={handleFastMark}>
                <Text style={styles.fastMarkBtnText}>Mark</Text>
                <Icon name="keyboard-arrow-down" size={16} color="#ffffff" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>{students.length}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Absent</Text>
            <Text style={[styles.statValue, { color: Colors.error }]}>{students.filter(s => s.isAbsent).length}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>On Duty</Text>
            <Text style={[styles.statValue, { color: Colors.primary }]}>{students.filter(s => s.isOnDuty).length}</Text>
          </View>
        </Animated.View>

        <Animated.FlatList
          data={students}
          keyExtractor={(item: any) => item.id}
          renderItem={renderStudent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          itemLayoutAnimation={Layout.springify()}
        />
      </View>

      <View style={styles.footer}>
        {isLocked ? (
          <View style={{ flex: 1, flexDirection: 'row', gap: 10 }}>
            <View style={[styles.lockedFooterBtn, { flex: 1 }]}>
              <Icon name="lock" size={18} color="#475569" style={{ marginRight: 6 }} />
              <Text style={styles.lockedFooterText}>Locked</Text>
            </View>
            <TouchableOpacity style={styles.unlockFooterBtn} onPress={handleUnlockSession}>
              <Icon name="lock-open" size={18} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.unlockFooterText}>Unlock Session</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity style={styles.submitOnlyBtn} onPress={() => handleSubmit(false)}>
              <Icon name="check-circle-outline" size={20} color={Colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.submitOnlyText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitSmsBtn} onPress={() => handleSubmit(true)}>
              <Icon name="sms" size={20} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.submitSmsText}>Submit & Send SMS</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* CUSTOM FAST MARK MODAL */}
      <Modal transparent visible={fastMarkModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Apply Fast Marking</Text>
            <Text style={styles.modalSubtitle}>Select attendance status for entered students.</Text>
            
            <View style={styles.modalOptionsContainer}>
              <TouchableOpacity style={[styles.modalOptionBtn, { backgroundColor: Colors.success }]} onPress={() => applyFastMark('present')}>
                <Icon name="check-circle" size={24} color="#fff" />
                <Text style={styles.modalOptionText}>Present</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalOptionBtn, { backgroundColor: Colors.error }]} onPress={() => applyFastMark('absent')}>
                <Icon name="cancel" size={24} color="#fff" />
                <Text style={styles.modalOptionText}>Absent</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalOptionBtn, { backgroundColor: Colors.primary }]} onPress={() => applyFastMark('onduty')}>
                <Icon name="business-center" size={24} color="#fff" />
                <Text style={styles.modalOptionText}>On Duty (OD)</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setFastMarkModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface, // Clean white header
    
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
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
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  fastInputContainer: {
    marginBottom: 20,
  },
  fastInputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  fastInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fastInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: Colors.text,
    marginRight: 10,
  },
  fastMarkBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  fastMarkBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  listContainer: {
    flex: 1,
    backgroundColor: Colors.background, // Off-white for the list area
    padding: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  studentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  studentInfo: {
    marginBottom: 12,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  studentId: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  toggleGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 2,
  },
  toggleBtnInactive: {
    backgroundColor: Colors.background,
    borderColor: Colors.border,
  },
  toggleBtnActivePresent: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  toggleBtnActiveAbsent: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  toggleBtnActiveOD: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  toggleTextInactive: {
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  lockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  lockedBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  unlockBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#D97706',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  unlockBannerText: {
    color: '#D97706',
    fontSize: 13,
    fontWeight: '800',
  },
  footer: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  lockedFooterBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedFooterText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '800',
  },
  unlockFooterBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockFooterText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  submitOnlyBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitOnlyText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  submitSmsBtn: {
    flex: 1.3,
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  submitSmsText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 8, textAlign: 'center' },
  modalSubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  modalOptionsContainer: { width: '100%', marginBottom: 16 },
  modalOptionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, marginBottom: 12 },
  modalOptionText: { color: '#ffffff', fontWeight: '700', fontSize: 16, marginLeft: 8 },
  modalCancelBtn: { width: '100%', paddingVertical: 14, backgroundColor: '#F1F5F9', borderRadius: 12, alignItems: 'center' },
  modalCancelText: { color: '#64748B', fontWeight: '700', fontSize: 15 }
});
