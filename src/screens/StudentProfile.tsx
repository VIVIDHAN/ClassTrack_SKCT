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

  const mockAttendance = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < student.id.length; i++) {
      hash += student.id.charCodeAt(i);
    }
    return 70 + (hash % 30);
  }, [student.id]);

  const studentPhone = '9876543210';
  const parentPhone = student.phone || '9442211279'; 

  const makeCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={26} color={Colors.text} />
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
              <Text style={styles.statLabel}>Attendance Percentage</Text>
              <Text style={[styles.statValue, { color: mockAttendance >= 75 ? Colors.success : Colors.error }]}>
                {mockAttendance}%
              </Text>
              <Text style={styles.statStatus}>
                {mockAttendance >= 75 ? 'Good Standing' : 'Critical Defaulter'}
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.actionSection}>
          <Text style={styles.sectionTitle}>Contact Directory</Text>
          
          <TouchableOpacity 
            style={styles.actionCard} 
            activeOpacity={0.8}
            onPress={() => makeCall(studentPhone)}
          >
            <View style={[styles.iconWrap, { backgroundColor: Colors.primarySoft }]}>
              <Icon name="person" size={24} color={Colors.primary} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Call Student</Text>
              <Text style={styles.actionSubtitle}>{studentPhone}</Text>
            </View>
            <View style={[styles.callBtn, { backgroundColor: Colors.primary }]}>
              <Icon name="call" size={22} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard} 
            activeOpacity={0.8}
            onPress={() => makeCall(parentPhone)}
          >
            <View style={[styles.iconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Icon name="family-restroom" size={24} color="#D97706" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Call Parent</Text>
              <Text style={styles.actionSubtitle}>{parentPhone}</Text>
            </View>
            <View style={[styles.callBtn, { backgroundColor: Colors.success }]}>
              <Icon name="call" size={22} color="#FFFFFF" />
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
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
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
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 24,
  },
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.2)',
  },
  avatarTextLarge: {
    fontSize: 38,
    fontWeight: '900',
    color: Colors.primary,
  },
  studentName: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  studentId: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '700',
    marginBottom: 20,
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
    borderColor: '#E2E8F0',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 30,
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
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 14,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  }
});
