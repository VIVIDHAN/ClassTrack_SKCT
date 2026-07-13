import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, NativeModules, PermissionsAndroid, Platform, Alert, TextInput, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated, { FadeInRight, FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../constants/Colors';
import { API_BASE_URL } from '../constants/Config';

export default function Attendance() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { classDetails } = route.params || { classDetails: { subject: 'Unknown', className: 'Unknown' } };
  
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [absentInput, setAbsentInput] = useState('');

  React.useEffect(() => {
    fetch(`${API_BASE_URL}/students?section=${classDetails.className}`)
      .then(res => res.json())
      .then(data => {
        const mapped = data.map((s: any) => ({
          id: s.rollNo,
          name: s.name,
          phone: s.parentPhone,
          isAbsent: false,
          isOnDuty: false
        }));
        setStudents(mapped);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [classDetails.className]);

  const markStatus = (id: string, status: 'present' | 'absent' | 'onduty') => {
    setStudents(prev => 
      prev.map(s => s.id === id ? { 
        ...s, 
        isAbsent: status === 'absent', 
        isOnDuty: status === 'onduty' 
      } : s)
    );
  };

  const handleFastMark = () => {
    if (absentInput.trim().length === 0) return;
    const identifiers = absentInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    setStudents(prev => prev.map(student => {
      const isMarkedByInput = identifiers.some(id => student.id.endsWith(id));
      if (isMarkedByInput) {
        return { ...student, isAbsent: true, isOnDuty: false };
      }
      return student;
    }));
    setAbsentInput(''); // Clear it out after marking
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
            rollNo: s.id,
            status: s.isAbsent ? 'Absent' : s.isOnDuty ? 'On Duty' : 'Present'
          }))
        })
      });
    } catch(err) {
      console.error(err);
    }

    navigation.navigate('Success');
  };

  const renderStudent = ({ item, index }: { item: any, index: number }) => (
    <Animated.View entering={FadeInRight.delay(index * 50).duration(300)}>
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
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>{classDetails.className}</Text>
          <Text style={styles.subtitle}>{classDetails.subject}</Text>
        </View>
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

        {loading ? (
          <Text style={{ textAlign: 'center', marginTop: 20, color: Colors.textSecondary }}>Loading live students...</Text>
        ) : (
          <Animated.FlatList
            data={students}
            keyExtractor={(item: any) => item.id}
            renderItem={renderStudent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            itemLayoutAnimation={Layout.springify()}
          />
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit & Send SMS</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface, // Clean white header
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: Colors.background,
    borderRadius: 10,
    marginRight: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 4,
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
    backgroundColor: Colors.error,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
  }
});
