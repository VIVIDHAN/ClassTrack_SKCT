import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, NativeModules, PermissionsAndroid, Platform, Alert, TextInput, StatusBar, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated, { FadeInRight, FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../constants/Colors';
import { API_BASE_URL } from '../constants/Config';
import BreatheLoader from '../components/BreatheLoader';
import { SKCT_STUDENTS_G } from '../constants/DummyData';

export default function Attendance() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { classDetails } = route.params || { classDetails: { subject: 'Unknown', className: 'Unknown' } };
  
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [absentInput, setAbsentInput] = useState('');
  const [fastMarkModalVisible, setFastMarkModalVisible] = useState(false);

  React.useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    fetch(`${API_BASE_URL}/students?section=${encodeURIComponent(classDetails.className)}`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        clearTimeout(timeoutId);
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((s: any) => ({
            id: s.roll_no || s.rollNo,
            db_id: s.id,
            name: s.name,
            phone: s.parent_phone || s.parentPhone || s.phone,
            isAbsent: false,
            isOnDuty: false
          }));
          setStudents(mapped);
        } else {
          setStudents(SKCT_STUDENTS_G);
        }
        setLoading(false);
      })
      .catch(() => {
        setStudents(SKCT_STUDENTS_G);
        setLoading(false);
      });

    return () => clearTimeout(timeoutId);
  }, [classDetails.className]);

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
    if (absentInput.trim().length === 0) return;
    setFastMarkModalVisible(true);
  };

  const applyFastMark = (status: 'present' | 'absent' | 'onduty') => {
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

  const handleSubmit = async () => {
    const absentStudents = students.filter(s => s.isAbsent);
    
    let smsWasSent = false;
    if (absentStudents.length > 0 && Platform.OS === 'android') {
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
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          const DirectSms = NativeModules.DirectSms;
          absentStudents.forEach(student => {
            if (student.phone) {
              const message = `Dear Parent, your ward ${student.name} (${student.id}) is marked ABSENT for ${classDetails.subject} today.`;
              DirectSms.sendDirectSms(student.phone, message);
            }
          });
          smsWasSent = true;
        } else {
          Alert.alert('Permission Denied', 'SMS alerts were not sent.');
        }
      } catch (err) {
        console.warn(err);
      }
    }

    // Save to history via live API
    try {
      await fetch(`${API_BASE_URL}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timetable_id: classDetails.timetable_id,
          date: new Date().toISOString().split('T')[0],
          records: students.map(s => ({
            student_id: s.db_id,
            status: s.isAbsent ? 'Absent' : s.isOnDuty ? 'OD' : 'Present'
          }))
        })
      });
    } catch(err) {
      console.error(err);
    }

    navigation.navigate('Success', { absentStudents, classDetails });
  };

  const renderStudent = ({ item, index }: { item: any, index: number }) => (
    <View>
      <View style={styles.studentCard}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.name}</Text>
          <Text style={styles.studentId}>{item.id}</Text>
        </View>
        <View style={styles.toggleGroup}>
          <TouchableOpacity 
            style={[styles.toggleBtn, (!item.isAbsent && !item.isOnDuty) ? styles.toggleBtnActivePresent : styles.toggleBtnInactive]}
            onPress={() => markStatus(item.id, 'present')}
          >
            <Text style={[styles.toggleText, (!item.isAbsent && !item.isOnDuty) ? styles.toggleTextActive : styles.toggleTextInactive]}>Present</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, item.isAbsent ? styles.toggleBtnActiveAbsent : styles.toggleBtnInactive]}
            onPress={() => markStatus(item.id, 'absent')}
          >
            <Text style={[styles.toggleText, item.isAbsent ? styles.toggleTextActive : styles.toggleTextInactive]}>Absent</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, item.isOnDuty ? styles.toggleBtnActiveOD : styles.toggleBtnInactive]}
            onPress={() => markStatus(item.id, 'onduty')}
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
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit & Send SMS</Text>
        </TouchableOpacity>
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
  footer: {
    backgroundColor: Colors.surface,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 16,
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
