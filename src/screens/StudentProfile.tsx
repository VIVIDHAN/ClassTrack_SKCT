import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, Linking, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../constants/Colors';

export default function StudentProfile() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { student, classDetails } = route.params || { student: { name: 'Unknown', id: 'N/A' }, classDetails: { className: 'Unknown' } };

  // Generate a mock attendance percentage between 70 and 100 based on their ID string length and char codes
  const mockAttendance = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < student.id.length; i++) {
      hash += student.id.charCodeAt(i);
    }
    return 70 + (hash % 30);
  }, [student.id]);

  const studentPhone = '9876543210'; // Mocked
  const parentPhone = student.phone || '9442211279'; 

  const makeCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={28} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Student Profile</Text>
          <View style={{ width: 28 }} />
        </View>
        <Text style={styles.subtitle}>{classDetails.className}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInUp.delay(100).duration(500)} style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarTextLarge}>{student.name.charAt(0)}</Text>
          </View>
          <Text style={styles.studentName}>{student.name}</Text>
          <Text style={styles.studentId}>{student.id}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Attendance</Text>
              <Text style={[styles.statValue, { color: mockAttendance >= 75 ? Colors.success : Colors.error }]}>
                {mockAttendance}%
              </Text>
              <Text style={styles.statStatus}>
                {mockAttendance >= 75 ? 'Good Standing' : 'Critical'}
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.actionSection}>
          <Text style={styles.sectionTitle}>Contact Directory</Text>
          
          <TouchableOpacity 
            style={styles.actionCard} 
            activeOpacity={0.7}
            onPress={() => makeCall(studentPhone)}
          >
            <View style={[styles.iconWrap, { backgroundColor: '#E0F2FE' }]}>
              <Icon name="person" size={24} color="#0284C7" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Call Student</Text>
              <Text style={styles.actionSubtitle}>{studentPhone}</Text>
            </View>
            <View style={styles.callBtn}>
              <Icon name="call" size={24} color="#ffffff" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard} 
            activeOpacity={0.7}
            onPress={() => makeCall(parentPhone)}
          >
            <View style={[styles.iconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Icon name="family-restroom" size={24} color="#D97706" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Call Parent</Text>
              <Text style={styles.actionSubtitle}>{parentPhone}</Text>
            </View>
            <View style={styles.callBtn}>
              <Icon name="call" size={24} color="#ffffff" />
            </View>
          </TouchableOpacity>
        </Animated.View>
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
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 93, 56, 0.1)',
    marginBottom: 32,
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 93, 56, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarTextLarge: {
    fontSize: 40,
    fontWeight: '900',
    color: Colors.primary,
  },
  studentName: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  studentId: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '700',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 4,
  },
  statStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  actionSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  callBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  }
});
