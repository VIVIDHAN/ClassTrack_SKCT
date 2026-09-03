import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../constants/Colors';
import { API_BASE_URL } from '../constants/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BreatheLoader from '../components/BreatheLoader';
import { TODAY_CLASSES, DIRECTORY_CLASSES, getTeacherDirectoryFallback } from '../constants/DummyData';

export default function ClassesList() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { mode = 'attendance' } = route.params || {};
  
  const [classes, setClasses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const loadData = async () => {
      let currentTeacher = { id: 3, name: 'Ms. B Narmatha' };
      try {
        const stored = await AsyncStorage.getItem('loggedInTeacher');
        if (stored) {
          currentTeacher = JSON.parse(stored);
        }
        const teacherId = currentTeacher.id || 3;

        if (mode === 'directory') {
          // Directory Mode: Fetch all timetable entries for this teacher across all days
          const res = await fetch(`${API_BASE_URL}/timetable?teacher_id=${teacherId}`, { signal: controller.signal });
          clearTimeout(timeoutId);
          const data = await res.json();

          if (!isMounted) return;

          let uniqueClasses = new Map();
          if (Array.isArray(data)) {
            data.forEach((item: any) => {
              if (item && item.Subject && item.section) {
                let key = `${item.section}-${item.Subject.title}`;
                if (!uniqueClasses.has(key)) {
                  uniqueClasses.set(key, {
                    id: String(item.id),
                    time: null,
                    className: item.section,
                    subject: item.Subject.title,
                    timetable_id: item.id
                  });
                }
              }
            });
          }

          if (uniqueClasses.size > 0) {
            setClasses(Array.from(uniqueClasses.values()));
          } else {
            setClasses(getTeacherDirectoryFallback(teacherId, currentTeacher.name));
          }
          setLoading(false);
        } else {
          // Attendance Mode: Fetch this teacher's classes for current day
          const jsDay = new Date().getDay();
          const currentDay = (jsDay >= 1 && jsDay <= 5) ? jsDay : 1;

          const res = await fetch(`${API_BASE_URL}/timetable?teacher_id=${teacherId}&day=${currentDay}`, { signal: controller.signal });
          clearTimeout(timeoutId);
          const data = await res.json();

          if (!isMounted) return;

          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map((item: any) => ({
              id: String(item.id),
              time: `Period ${item.period}`,
              className: item.section,
              subject: item.Subject ? item.Subject.title : 'Course',
              timetable_id: item.id
            }));
            setClasses(mapped);
          } else {
            // Teacher specific fallback
            if (teacherId === 3 || currentTeacher.name?.toLowerCase().includes('narmatha')) {
              setClasses([
                { id: '4', time: 'Period 4 (11:45 - 12:45)', className: 'III IT G', subject: 'Applied Cryptography', timetable_id: 4 },
                { id: '5', time: 'Period 5 (01:45 - 02:45)', className: 'III IT G', subject: 'Applied Cryptography', timetable_id: 5 },
              ]);
            } else if (teacherId === 4 || currentTeacher.name?.toLowerCase().includes('saranya')) {
              setClasses([
                { id: '3', time: 'Period 3 (10:45 - 11:45)', className: 'III IT G', subject: 'Distributed Computing', timetable_id: 3 },
              ]);
            } else if (teacherId === 2 || currentTeacher.name?.toLowerCase().includes('guranna')) {
              setClasses([
                { id: '1', time: 'Period 1 (08:15 - 09:15)', className: 'III IT G', subject: 'Software Testing', timetable_id: 1 },
                { id: '2', time: 'Period 2 (09:15 - 10:15)', className: 'III IT G', subject: 'Software Testing', timetable_id: 2 },
              ]);
            } else {
              setClasses(TODAY_CLASSES);
            }
          }
          setLoading(false);
        }
      } catch (e) {
        if (!isMounted) return;
        const teacherId = currentTeacher?.id || 3;
        setClasses(mode === 'directory' ? getTeacherDirectoryFallback(teacherId, currentTeacher?.name) : TODAY_CLASSES);
        setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [mode]);

  const renderClassItem = ({ item, index }: { item: any, index: number }) => (
    <View>
      <TouchableOpacity 
        style={styles.classCard}
        onPress={() => {
          if (mode === 'directory') {
            navigation.navigate('StudentDirectoryList', { classDetails: item });
          } else {
            navigation.navigate('Attendance', { classDetails: item });
          }
        }}
        activeOpacity={0.75}
      >
        <View style={styles.cardLeft}>
          {item.time ? (
            <View style={styles.timeRow}>
              <Icon name="access-time" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.classTime}>{item.time}</Text>
            </View>
          ) : (
            <View style={{ marginBottom: 4 }} />
          )}
          <Text style={styles.className}>{item.className}</Text>
          <Text style={styles.subjectName}>{item.subject}</Text>
        </View>
        <View style={styles.cardRight}>
          <View style={styles.takeAttendanceBtn}>
            <Text style={styles.takeAttendanceText}>{mode === 'directory' ? 'View' : 'Mark'}</Text>
            <Icon name="chevron-right" size={18} color="#ffffff" />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <BreatheLoader message="Loading live schedule..." />
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
          <Text style={styles.title}>{mode === 'directory' ? 'Student Directory' : 'Mark Attendance'}</Text>
          <View style={{ width: 28 }} /> {/* Balancer */}
        </View>
        <Text style={styles.subtitle}>{mode === 'directory' ? 'Mapped Classes' : 'Today\'s Schedule'}</Text>
      </View>

        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
          {classes.map((item, index) => (
            <React.Fragment key={item.id}>
              {renderClassItem({ item, index })}
            </React.Fragment>
          ))}
          {classes.length === 0 ? (
             <Text style={{ textAlign: 'center', color: '#94A3B8', marginTop: 40 }}>
               {mode === 'directory' ? 'No classes assigned in timetable.' : 'No classes scheduled for today.'}
             </Text>
          ) : null}
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    
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
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  classCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  cardLeft: { flex: 1 },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  classTime: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  className: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  subjectName: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  cardRight: { marginLeft: 16 },
  takeAttendanceBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 14, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  takeAttendanceText: { color: '#ffffff', fontWeight: '700', fontSize: 14, marginRight: 4 },
});
