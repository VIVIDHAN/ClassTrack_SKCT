import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../constants/Colors';
import { API_BASE_URL } from '../constants/Config';
import BreatheLoader from '../components/BreatheLoader';

export default function ClassesList() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { mode = 'attendance' } = route.params || {};
  
  const [classes, setClasses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (mode === 'directory') {
      const days = [1, 2, 3, 4, 5];
      Promise.all(days.map(d => fetch(`${API_BASE_URL}/timetable?day=${d}&section=III IT G`).then(r => r.json())))
        .then(results => {
          let uniqueClasses = new Map();
          results.forEach((res) => {
            if (Array.isArray(res)) {
              res.forEach(item => {
                let key = item.section + '-' + item.Subject.title;
                if (!uniqueClasses.has(key)) {
                  uniqueClasses.set(key, {
                    id: String(item.id),
                    time: null,
                    className: item.section,
                    subject: item.Subject.title,
                    timetable_id: item.id
                  });
                }
              });
            }
          });
          setClasses(Array.from(uniqueClasses.values()));
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else {
      fetch(`${API_BASE_URL}/timetable?day=1&section=III IT G`)
        .then(res => res.json())
        .then(data => {
          const mapped = data.map((item: any) => ({
            id: String(item.id),
            time: `Period ${item.period}`,
            className: item.section,
            subject: item.Subject.title,
            timetable_id: item.id
          }));
          setClasses(mapped);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
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
             <Text style={{ textAlign: 'center', color: '#94A3B8', marginTop: 40 }}>No classes scheduled for today.</Text>
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
