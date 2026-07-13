import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../constants/Colors';
import { ATTENDANCE_HISTORY } from '../constants/DummyData';

export default function History() {
  const [history, setHistory] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      setHistory([...ATTENDANCE_HISTORY]);
    }, [])
  );

  const renderHistoryItem = ({ item, index }: { item: any, index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 100).duration(400)}>
      <View style={styles.historyCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.date}>{item.date}</Text>
          <View style={[styles.badge, item.absentCount > 0 ? styles.badgeAbsent : styles.badgePerfect]}>
            <Text style={[styles.badgeText, item.absentCount > 0 ? styles.badgeTextAbsent : styles.badgeTextPerfect]}>
              {item.absentCount} Absent
            </Text>
          </View>
        </View>
        <Text style={styles.className}>{item.className}</Text>
        <Text style={styles.subject}>{item.subject}</Text>
        
        {item.smsSent && (
          <View style={styles.smsSuccessBox}>
            <Icon name="check-circle" size={16} color={Colors.success} />
            <Text style={styles.smsSuccessText}>SMS Sent Successfully</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>Recent Class Attendance</Text>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderHistoryItem}
        contentContainerStyle={[styles.listContainer, history.length === 0 && styles.listContainerEmpty]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="history" size={48} color={Colors.textSecondary} style={{ opacity: 0.5, marginBottom: 16 }} />
            <Text style={styles.emptyTitle}>No History Yet</Text>
            <Text style={styles.emptySubtitle}>Submit attendance to see records here.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  listContainer: {
    padding: 24,
  },
  listContainerEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  historyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  date: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '700',
  },
  className: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  subject: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgePerfect: {
    backgroundColor: '#dcfce7',
  },
  badgeAbsent: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  badgeTextPerfect: {
    color: Colors.success,
  },
  badgeTextAbsent: {
    color: Colors.error,
  },
  smsSuccessBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    padding: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  smsSuccessText: {
    color: Colors.success,
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 6,
  }
});
