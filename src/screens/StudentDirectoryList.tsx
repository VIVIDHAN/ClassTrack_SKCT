import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, TextInput, NativeModules, PermissionsAndroid, Alert, ScrollView, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInRight, Layout } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../constants/Colors';
import { API_BASE_URL } from '../constants/Config';
import BreatheLoader from '../components/BreatheLoader';

const { DirectSms } = NativeModules;

export default function StudentDirectoryList() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { classDetails } = route.params || { classDetails: { subject: 'Unknown', className: 'Unknown' } };
  
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [absentRollNumbers, setAbsentRollNumbers] = useState('');
  const [markedAbsent, setMarkedAbsent] = useState<{[key: string]: boolean}>({});
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/students?section=${classDetails.className}`)
      .then(res => res.json())
      .then(data => {
        const mapped = data.map((s: any) => ({
          id: s.roll_no || s.rollNo,
          db_id: s.id,
          name: s.name,
          phone: s.test_parent_phone_number || s.parent_phone || s.parentPhone || '9876543210',
        }));
        setStudents(mapped);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [classDetails.className]);

  const requestSmsPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.SEND_SMS,
          {
            title: 'SMS Permission',
            message: 'ClassTrack needs access to send SMS in the background for absentee notifications.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS would need different logic, but assuming Android based on MainApplication checks
  };

  const handleNotifyParents = async () => {
    if (!absentRollNumbers.trim()) {
      Alert.alert("Input Required", "Please enter the roll numbers of the absent students (e.g. 201, 202).");
      return;
    }
    
    const hasPermission = await requestSmsPermission();
    if (!hasPermission) {
      Alert.alert("Permission Denied", "Cannot send background SMS without permission.");
      return;
    }

    setIsSending(true);
    
    const rollArray = absentRollNumbers.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
    
    // Find matching students (matching last digits or full roll number)
    const absentees = students.filter(s => {
      const rollMatch = s.id.toLowerCase();
      return rollArray.some(roll => rollMatch.endsWith(roll)); 
    });
    
    if (absentees.length === 0) {
      Alert.alert("Not Found", "No students matched the entered roll numbers.");
      setIsSending(false);
      return;
    }
    
    // Mark them in UI
    const newMarked: any = { ...markedAbsent };
    absentees.forEach(s => newMarked[s.id] = true);
    setMarkedAbsent(newMarked);
    
    let successCount = 0;
    
    // Send SMS in background using the native module
    for (const s of absentees) {
      const message = `Dear Parent, your ward ${s.name} is absent today from ${classDetails.className}.`;
      try {
        if (DirectSms && DirectSms.sendDirectSms) {
          DirectSms.sendDirectSms(s.phone, message);
          successCount++;
        } else {
          console.error("DirectSms module not found!");
        }
      } catch (err) {
        console.error("Error sending SMS", err);
      }
    }
    
    // Save log to backend
    try {
      const profileStr = await AsyncStorage.getItem('teacherProfile');
      if (profileStr) {
        const profile = JSON.parse(profileStr);
        await fetch(`${API_BASE_URL}/attendance/notify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            teacher_id: profile.id,
            section: classDetails.className,
            absent_count: absentees.length,
            absent_roll_numbers: absentees.map(s => s.id).join(', ')
          })
        });
      }
    } catch (err) {
      console.error("Failed to log attendance to backend", err);
    }
    
    setIsSending(false);
    Alert.alert("Success", `Background SMS sent to ${successCount} absent students!`);
    setAbsentRollNumbers('');
  };

  const renderStudent = ({ item, index }: { item: any, index: number }) => {
    const isAbsent = markedAbsent[item.id];
    
    return (
      <View>
        <View style={styles.studentCard}>
          <View style={styles.studentAvatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{item.name}</Text>
            <Text style={styles.studentId}>{item.id}</Text>
          </View>
          
          {isAbsent ? (
            <View style={[styles.attendanceBadge, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
              <Text style={[styles.attendanceText, { color: Colors.error }]}>Absent (SMS Sent)</Text>
            </View>
          ) : (
            <View style={[styles.attendanceBadge, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]}>
              <Text style={[styles.attendanceText, { color: Colors.success }]}>Present</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <BreatheLoader message="Loading student directory..." />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Icon name="arrow-back" size={28} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>{classDetails.className}</Text>
            <View style={{ width: 28 }} />
          </View>
          <Text style={styles.subtitle}>Attendance Roster</Text>
        </View>

        <View style={styles.bulkSmsContainer}>
          <Text style={styles.bulkSmsLabel}>Mark Absent & Send SMS</Text>
          <Text style={styles.bulkSmsDesc}>Enter last few digits of roll numbers separated by commas (e.g. 201, 202)</Text>
          <View style={styles.bulkInputWrapper}>
            <TextInput
              style={styles.bulkInput}
              placeholder="e.g. 201, 202, 205"
              placeholderTextColor={Colors.textSecondary}
              value={absentRollNumbers}
              onChangeText={setAbsentRollNumbers}
              keyboardType="numbers-and-punctuation"
            />
          </View>
          <TouchableOpacity 
            style={[styles.notifyBtn, isSending && { opacity: 0.7 }]}
            onPress={handleNotifyParents}
            disabled={isSending}
          >
            <Icon name="sms" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.notifyBtnText}>{isSending ? 'Sending...' : 'Notify Parents'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          <Animated.FlatList
            data={students}
          keyExtractor={(item: any) => item.id}
          renderItem={renderStudent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          itemLayoutAnimation={Layout.springify()}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>No students found.</Text>
          )}
        />
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    
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
  bulkSmsContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  bulkSmsLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  bulkSmsDesc: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  bulkInputWrapper: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginBottom: 16,
  },
  bulkInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0F172A',
  },
  notifyBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  notifyBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  listContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
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
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  studentId: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: Colors.textSecondary,
    fontSize: 16,
  },
  attendanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  attendanceText: {
    fontSize: 14,
    fontWeight: '800',
  }
});
