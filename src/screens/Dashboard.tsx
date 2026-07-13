import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../constants/Colors';
import { DUMMY_USER, TODAY_CLASSES } from '../constants/DummyData';

export default function Dashboard() {
  const navigation = useNavigation<any>();

  const renderClassItem = ({ item, index }: { item: any, index: number }) => (
    <Animated.View entering={FadeInRight.delay(index * 100).duration(400)}>
      <TouchableOpacity 
        style={styles.classCard}
        onPress={() => navigation.navigate('Attendance', { classDetails: item })}
        activeOpacity={0.7}
      >
        <View style={styles.cardLeft}>
          <View style={styles.timeRow}>
            <Icon name="schedule" size={16} color={Colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={styles.classTime}>{item.time}</Text>
          </View>
          <Text style={styles.className}>{item.className}</Text>
          <Text style={styles.subjectName}>{item.subject}</Text>
        </View>
        <View style={styles.cardRight}>
          <View style={styles.takeAttendanceBtn}>
            <Text style={styles.takeAttendanceText}>Mark</Text>
            <Icon name="chevron-right" size={18} color="#ffffff" />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

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
            <Text style={styles.name}>Prof. {DUMMY_USER.name}</Text>
            <View style={styles.departmentBadge}>
              <Icon name="domain" size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.subtitle}>{DUMMY_USER.department}</Text>
            </View>
          </View>
          <View style={styles.facultyIconWrapper}>
            <Icon name="badge" size={80} color="rgba(255, 255, 255, 0.15)" />
          </View>
        </View>
      </Animated.View>

      <View style={styles.statsOverview}>
        <View style={styles.statBox}>
          <Text style={styles.statBoxLabel}>Classes Today</Text>
          <Text style={styles.statBoxValue}>{TODAY_CLASSES.length}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statBoxLabel}>Pending</Text>
          <Text style={[styles.statBoxValue, { color: Colors.primary }]}>{TODAY_CLASSES.length}</Text>
        </View>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Schedule</Text>
        <FlatList
          data={TODAY_CLASSES}
          keyExtractor={(item) => item.id}
          renderItem={renderClassItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
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
    backgroundColor: '#0F172A', // Deep slate for professional look
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
  profileIconText: {
    fontSize: 22,
  },
  collegeName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0,
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
    borderLeftColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
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
  },
  cardRight: {
    marginLeft: 16,
  },
  takeAttendanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  takeAttendanceText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
    marginRight: 4,
  }
});
