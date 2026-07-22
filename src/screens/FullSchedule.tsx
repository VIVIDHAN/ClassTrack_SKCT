import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function FullSchedule() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { classes, facultyDept } = route.params || { classes: [], facultyDept: 'IT' };
  
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getClassStatus = (period: number) => {
    const timeSlots = [
      { start: '08:45', end: '09:40' },
      { start: '09:40', end: '10:35' },
      { start: '10:50', end: '11:45' },
      { start: '11:45', end: '12:40' },
      { start: '13:30', end: '14:25' },
      { start: '14:25', end: '15:20' },
      { start: '15:20', end: '16:15' }
    ];
    if (period < 1 || period > 7) return 'upcoming';
    
    const slot = timeSlots[period - 1];
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    
    const [startH, startM] = slot.start.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    
    const [endH, endM] = slot.end.split(':').map(Number);
    const endMinutes = endH * 60 + endM;
    
    if (currentMinutes < startMinutes) return 'upcoming';
    if (currentMinutes > endMinutes) return 'past';
    return 'ongoing';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back-ios" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Full Schedule</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {classes.length === 0 ? (
          <View style={styles.centerContainer}>
            <Icon name="event-available" size={64} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Classes</Text>
            <Text style={styles.emptySubtitle}>You don't have any classes scheduled today.</Text>
          </View>
        ) : (
          classes.map((cls: any, index: number) => {
            const timeSlots = ['08:45 AM - 09:40 AM', '09:40 AM - 10:35 AM', '10:50 AM - 11:45 AM', '11:45 AM - 12:40 PM', '01:30 PM - 02:25 PM', '02:25 PM - 03:20 PM', '03:20 PM - 04:15 PM'];
            const timeString = timeSlots[cls.period - 1] || `Period ${cls.period}`;
            const status = getClassStatus(cls.period);
            const isOngoing = status === 'ongoing';
            const isPast = status === 'past';
            
            return (
              <Animated.View 
                key={cls.id} 
                entering={FadeInUp.delay(index * 100).duration(400)}
                layout={Layout.springify()}
              >
                <TouchableOpacity 
                  activeOpacity={0.8}
                  onPress={() => {
                    if (isOngoing) {
                      navigation.navigate('StudentDirectoryList', { 
                        classDetails: { subject: cls.Subject ? cls.Subject.title : 'Subject', className: cls.section } 
                      });
                    } else {
                      Alert.alert("Time Restricted", "Attendance marking is strictly time-based. You can only mark attendance during the active ongoing class period.");
                    }
                  }}
                  style={[styles.classCard, isPast && { opacity: 0.7, borderColor: '#CBD5E1' }]}
                >
                  <View style={styles.classTopRow}>
                    <View style={styles.timeBadge}>
                      <Icon name="access-time" size={14} color={isPast ? "#94A3B8" : "#F97316"} style={{marginRight: 6}} />
                      <Text style={[styles.timeText, isPast && { color: '#94A3B8' }]}>{timeString}</Text>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      {isOngoing && <View style={styles.ongoingBadge}><Text style={styles.ongoingText}>ONGOING</Text></View>}
                      {isPast && <View style={[styles.ongoingBadge, { backgroundColor: '#94A3B8' }]}><Text style={styles.ongoingText}>COMPLETED</Text></View>}
                      <View style={styles.sectionBadge}><Text style={styles.sectionText}>{cls.section}</Text></View>
                    </View>
                  </View>

                  <Text style={styles.classTitle}>{cls.Subject ? cls.Subject.title : 'Subject Title'}</Text>
                  
                  <View style={styles.classBottomRow}>
                    <View style={styles.classDetailsBox}>
                      <View style={styles.detailItem}>
                        <Icon name="badge" size={18} color="#94A3B8" />
                        <View style={{marginLeft: 12}}>
                          <Text style={styles.detailValue}>{cls.Subject ? cls.Subject.code : '-'}</Text>
                          <Text style={styles.detailLabel}>Course Code</Text>
                        </View>
                      </View>
                      <View style={styles.detailDivider} />
                      <View style={styles.detailItem}>
                        <Icon name="business" size={18} color="#94A3B8" />
                        <View style={{marginLeft: 12}}>
                          <Text style={styles.detailValue}>{facultyDept} Block</Text>
                          <Text style={styles.detailLabel}>Location</Text>
                        </View>
                      </View>
                    </View>
                    <View style={[styles.arrowButton, !isOngoing && { backgroundColor: '#F1F5F9' }]}>
                      <Icon name="arrow-forward" size={24} color={isOngoing ? "#F97316" : "#94A3B8"} />
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 100,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  classCard: { backgroundColor: '#ffffff', borderRadius: 28, padding: 24, borderWidth: 1.5, borderColor: '#F97316', shadowColor: '#F97316', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 6, marginBottom: 16 },
  classTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  timeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5ED', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  timeText: { color: '#F97316', fontSize: 13, fontWeight: '800' },
  ongoingBadge: { backgroundColor: '#F97316', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8 },
  ongoingText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
  sectionBadge: { backgroundColor: '#3B82F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  sectionText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
  
  classTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 24, lineHeight: 28 },
  classBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  classDetailsBox: { flex: 1, flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 20, marginRight: 16 },
  detailItem: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  detailValue: { fontSize: 13, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  detailLabel: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  detailDivider: { width: 1, height: 24, backgroundColor: '#E2E8F0', marginHorizontal: 12 },
  arrowButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFF5ED', justifyContent: 'center', alignItems: 'center' },
});
