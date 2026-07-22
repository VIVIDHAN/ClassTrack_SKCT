import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';
import { API_BASE_URL } from '../constants/Config';

// Time mappings based on the college timetable image
const getPeriodTime = (period: number) => {
  switch(period) {
    case 1: return { label: '8:15 AM - 9:15 AM', start: 8.25, end: 9.25 };
    case 2: return { label: '9:15 AM - 10:15 AM', start: 9.25, end: 10.25 };
    case 3: return { label: '10:45 AM - 11:45 AM', start: 10.75, end: 11.75 };
    case 4: return { label: '11:45 AM - 12:45 PM', start: 11.75, end: 12.75 };
    case 5: return { label: '1:45 PM - 2:45 PM', start: 13.75, end: 14.75 };
    default: return { label: 'Unknown', start: 0, end: 24 };
  }
};

const getClassStatus = (startHr: number, endHr: number) => {
  const now = new Date();
  const currentHr = now.getHours() + (now.getMinutes() / 60);
  
  if (currentHr > endHr) return 'completed';
  if (currentHr >= startHr && currentHr <= endHr) return 'current';
  return 'upcoming';
};

export default function Dashboard() {
  const navigation = useNavigation<any>();
  const [classes, setClasses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [teacher, setTeacher] = React.useState<any>(null);
  const [todayDay, setTodayDay] = React.useState(1);

  useFocusEffect(
    React.useCallback(() => {
      const loadDashboard = async () => {
        try {
          const profileStr = await AsyncStorage.getItem('teacherProfile');
          if (!profileStr) {
            navigation.replace('Login');
            return;
          }
          const profile = JSON.parse(profileStr);
          setTeacher(profile);

          // Calculate day (1=Mon, 5=Fri). If weekend (0, 6), default to 1 for testing.
          let day = new Date().getDay();
          if (day === 0 || day === 6) day = 1; 
          setTodayDay(day);

          const res = await fetch(`${API_BASE_URL}/timetable?day=${day}&teacher_id=${profile.id}`);
          const data = await res.json();

          const mapped = data.map((item: any) => {
            const timeInfo = getPeriodTime(item.period);
            return {
              id: String(item.id),
              period: item.period,
              timeLabel: timeInfo.label,
              status: getClassStatus(timeInfo.start, timeInfo.end),
              className: item.section,
              subject: item.Subject.title,
              timetable_id: item.id
            };
          });
          
          setClasses(mapped);
        } catch (err) {
          console.error('Error loading dashboard:', err);
        } finally {
          setLoading(false);
        }
      };

      loadDashboard();
    }, [])
  );

  const renderClassItem = ({ item, index }: { item: any, index: number }) => {
    const isCurrent = item.status === 'current';
    const isCompleted = item.status === 'completed';

    return (
      <Animated.View entering={FadeInRight.delay(index * 100).duration(400)}>
        <TouchableOpacity 
          style={[
            styles.classCard,
            isCurrent && styles.currentClassCard,
            isCompleted && styles.completedClassCard
          ]}
          activeOpacity={0.7}
        >
          <View style={styles.cardLeft}>
            <View style={styles.timeRow}>
              <Icon name="schedule" size={16} color={isCurrent ? Colors.primary : Colors.textSecondary} style={{ marginRight: 6 }} />
              <Text style={[styles.classTime, isCurrent && { color: Colors.primary }]}>
                {item.timeLabel} {isCurrent && '(Ongoing)'}
              </Text>
            </View>
            <Text style={[styles.className, isCompleted && { color: Colors.textSecondary }]}>{item.className}</Text>
            <Text style={styles.subjectName}>{item.subject}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading || !teacher) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Colors.textSecondary }}>Loading your schedule...</Text>
      </SafeAreaView>
    );
  }

  const upcomingClasses = classes.filter(c => c.status !== 'completed').length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.profileIconContainer} onPress={() => navigation.navigate('Profile')}>
          <Icon name="person" size={26} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.collegeName}>Sri Krishna College of Technology</Text>
        <TouchableOpacity style={styles.notificationBtn} onPress={() => navigation.navigate('Notifications')}>
          <Icon name="notifications-none" size={26} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.welcomeContainer}>
        <View style={styles.facultyCard}>
          <View style={styles.facultyCardContent}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>Prof. {teacher.name.split(' ')[0]}</Text>
            <View style={styles.departmentBadge}>
              <Icon name="domain" size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.subtitle}>{teacher.department} Department</Text>
            </View>
          </View>
          <View style={styles.facultyIconWrapper}>
            <Icon name="badge" size={80} color="rgba(255, 255, 255, 0.15)" />
          </View>
        </View>
      </Animated.View>

      <View style={styles.statsOverview}>
        <View style={styles.statBox}>
          <Text style={styles.statBoxLabel}>Total Today</Text>
          <Text style={styles.statBoxValue}>{classes.length}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statBoxLabel}>Upcoming</Text>
          <Text style={[styles.statBoxValue, { color: Colors.primary }]}>{upcomingClasses}</Text>
        </View>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Day {todayDay} Schedule</Text>
        {classes.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20, color: Colors.textSecondary }}>
            No classes scheduled for today.
          </Text>
        ) : (
          <FlatList
            data={classes}
            keyExtractor={(item) => item.id}
            renderItem={renderClassItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  welcomeContainer: {
    padding: 24,
    paddingTop: 24,
    backgroundColor: Colors.background,
  },
  facultyCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  facultyCardContent: {
    flex: 1,
    zIndex: 2,
  },
  facultyIconWrapper: {
    position: 'absolute',
    right: -15,
    bottom: -15,
    zIndex: 1,
    transform: [{ rotate: '-15deg' }],
  },
  profileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  collegeName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 4,
    marginBottom: 16,
  },
  departmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  subtitle: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
  },
  statsOverview: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 4,
  },
  statBoxLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  statBoxValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  listContainer: {
    flex: 1,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 20,
  },
  classCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    borderLeftColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currentClassCard: {
    borderLeftColor: Colors.primary,
    backgroundColor: '#F0F9FF', // slight blue tint
    borderColor: '#E0F2FE',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  completedClassCard: {
    opacity: 0.6,
  },
  cardLeft: {
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  classTime: {
    color: Colors.textSecondary,
    fontWeight: '700',
    fontSize: 13,
  },
  className: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  subjectName: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  }
});
