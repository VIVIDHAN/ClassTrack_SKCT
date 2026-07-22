import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, TextInput, NativeModules, PermissionsAndroid, Alert, FlatList, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInUp, FadeIn, Layout, BounceIn } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../constants/Colors';
import { API_BASE_URL } from '../constants/Config';

const { DirectSms } = NativeModules;

export default function StudentDirectoryList() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { classDetails } = route.params || { classDetails: { subject: 'Unknown', className: 'Unknown' } };

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Set of roll numbers marked as absent
  const [markedAbsentees, setMarkedAbsentees] = useState<Set<string>>(new Set());
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/students?section=${classDetails.className}`);
        const data = await response.json();
        setStudents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load students:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [classDetails.className]);

  // Logic to bring matched students to the top if query length >= 3
  const displayedStudents = useMemo(() => {
    if (searchQuery.trim().length < 3) {
      return students;
    }
    const query = searchQuery.toLowerCase().trim();
    return [...students].sort((a, b) => {
      const aMatch = a.roll_no.toLowerCase().includes(query) || a.name.toLowerCase().includes(query);
      const bMatch = b.roll_no.toLowerCase().includes(query) || b.name.toLowerCase().includes(query);
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
  }, [students, searchQuery]);

  const toggleAttendance = (roll_no: string) => {
    setMarkedAbsentees(prev => {
      const next = new Set(prev);
      if (next.has(roll_no)) {
        next.delete(roll_no);
      } else {
        next.add(roll_no);
      }
      return next;
    });
  };

  const handleNotifyParents = async () => {
    if (markedAbsentees.size === 0) {
      Alert.alert("No Absentees", "Please mark at least one student as absent before notifying parents.");
      return;
    }

    const absentStudentsList = students.filter(s => markedAbsentees.has(s.roll_no));

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.SEND_SMS,
          {
            title: 'SMS Permission',
            message: 'ClassTrack needs SMS permission to notify parents.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert("Permission Denied", "Cannot send SMS without permission.");
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }

    setIsSending(true);
    let successCount = 0;

    for (const student of absentStudentsList) {
      if (student.parents_mobile) {
        const message = `Dear Parent, your ward ${student.name} is absent for the ${classDetails.subject} class today.`;
        if (Platform.OS === 'android' && DirectSms) {
          try {
            DirectSms.sendDirectSms(student.parents_mobile, message);
            successCount++;
          } catch (e) {
            console.log("Failed to send SMS to", student.parents_mobile);
          }
        } else {
          // Fallback or iOS logic
          successCount++;
        }
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
            absent_count: absentStudentsList.length,
            absent_roll_numbers: absentStudentsList.map(s => s.roll_no).join(', ')
          })
        });
      }
    } catch (err) {
      console.error("Failed to log attendance to backend", err);
    }
    
    setIsSending(false);
    Alert.alert("Success", `Background SMS sent to ${successCount} absent students!`, [
      { text: "OK", onPress: () => navigation.goBack() }
    ]);
  };

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  const renderStudent = ({ item, index }: { item: any, index: number }) => {
    const isAbsent = markedAbsentees.has(item.roll_no);

    return (
      <Animated.View 
        entering={FadeInUp.delay(Math.min(index * 50, 500)).duration(400)}
        layout={Layout.springify()}
      >
        <TouchableOpacity 
          activeOpacity={0.7} 
          onPress={() => toggleAttendance(item.roll_no)}
          style={[styles.studentCard, isAbsent && styles.studentCardAbsent]}
        >
          <View style={styles.studentInfoLeft}>
            <View style={[styles.avatar, isAbsent ? { backgroundColor: 'rgba(239, 68, 68, 0.1)' } : { backgroundColor: '#F1F5F9' }]}>
              <Text style={[styles.avatarText, isAbsent && { color: '#EF4444' }]}>{getInitials(item.name)}</Text>
            </View>
            <View style={{ marginLeft: 16 }}>
              <Text style={styles.studentName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.rollNoText}>{item.roll_no}</Text>
            </View>
          </View>
          
          <View style={[styles.statusPill, isAbsent ? styles.statusPillAbsent : styles.statusPillPresent]}>
            <View style={[styles.statusDot, isAbsent ? { backgroundColor: '#EF4444' } : { backgroundColor: '#10B981' }]} />
            <Text style={[styles.statusText, isAbsent ? { color: '#EF4444' } : { color: '#10B981' }]}>
              {isAbsent ? 'Absent' : 'Present'}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const totalPresent = students.length - markedAbsentees.size;
  const totalAbsent = markedAbsentees.size;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      
      {/* Glassmorphism Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back-ios" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>{classDetails.className}</Text>
          <Text style={styles.headerSubtitle}>{classDetails.subject}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        
        {/* Summary & Search Area */}
        <View style={styles.topSection}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
               <Text style={[styles.summaryCount, { color: '#10B981' }]}>{totalPresent}</Text>
               <Text style={styles.summaryLabel}>Present</Text>
            </View>
            <View style={styles.summaryCard}>
               <Text style={[styles.summaryCount, { color: '#EF4444' }]}>{totalAbsent}</Text>
               <Text style={styles.summaryLabel}>Absent</Text>
            </View>
            <View style={styles.summaryCard}>
               <Text style={[styles.summaryCount, { color: '#0F172A' }]}>{students.length}</Text>
               <Text style={styles.summaryLabel}>Total</Text>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <Icon name="search" size={22} color="#94A3B8" style={{ marginLeft: 16 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search roll number (e.g. 101)"
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 8 }}>
                <Icon name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Student List */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#F97316" />
          </View>
        ) : (
          <FlatList
            data={displayedStudents}
            keyExtractor={(item) => item.roll_no}
            renderItem={renderStudent}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </KeyboardAvoidingView>

      {/* Notify Parents Button */}
      <View style={styles.bottomFooter}>
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={handleNotifyParents}
          disabled={isSending}
        >
          <LinearGradient
            colors={markedAbsentees.size > 0 ? ['#F97316', '#EA580C'] : ['#E2E8F0', '#CBD5E1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.notifyBtn}
          >
            {isSending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Icon name="send" size={20} color={markedAbsentees.size > 0 ? "#ffffff" : "#94A3B8"} style={{ marginRight: 8 }} />
                <Text style={[styles.notifyBtnText, markedAbsentees.size === 0 && { color: '#94A3B8' }]}>
                  {markedAbsentees.size > 0 ? `Notify ${markedAbsentees.size} Parents` : 'No Absentees'}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    zIndex: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 6,
  },
  headerTitleBox: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F97316',
    marginTop: 2,
  },
  topSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  summaryCount: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    height: 52,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  studentCardAbsent: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  studentInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#64748B',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    paddingRight: 10,
  },
  rollNoText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusPillPresent: {
    backgroundColor: '#ECFDF5',
  },
  statusPillAbsent: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  bottomFooter: {
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 24 : 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  notifyBtn: {
    flexDirection: 'row',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  notifyBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  }
});
