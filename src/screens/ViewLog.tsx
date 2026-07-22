import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../constants/Colors';
import { API_BASE_URL } from '../constants/Config';
import LinearGradient from 'react-native-linear-gradient';

export default function ViewLog() {
  const navigation = useNavigation<any>();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const profileStr = await AsyncStorage.getItem('teacherProfile');
        if (profileStr) {
          const profile = JSON.parse(profileStr);
          const response = await fetch(`${API_BASE_URL}/attendance/logs?teacher_id=${profile.id}`);
          if (response.ok) {
            const data = await response.json();
            setLogs(data);
          }
        }
      } catch (err) {
        console.log("Failed to fetch logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const renderLogCard = ({ item, index }: { item: any, index: number }) => {
    const timeSent = new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return (
      <Animated.View 
        entering={FadeInUp.delay(index * 100).duration(400)}
        layout={Layout.springify()}
        style={styles.cardContainer}
      >
        <LinearGradient 
          colors={['#ffffff', '#FAFAFA']} 
          style={styles.logCard}
        >
          <View style={styles.cardHeader}>
            <View style={styles.timeBadge}>
               <Icon name="access-time" size={14} color="#F97316" style={{ marginRight: 4 }} />
               <Text style={styles.timeText}>{timeSent}</Text>
            </View>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionText}>{item.section}</Text>
            </View>
          </View>
          
          <Text style={styles.courseTitle}>{item.subject_name}</Text>
          
          <View style={styles.statsRow}>
             <View style={styles.statBox}>
               <Icon name="sms-failed" size={20} color="#EF4444" />
               <View style={{ marginLeft: 8 }}>
                 <Text style={styles.statValue}>{item.absent_count}</Text>
                 <Text style={styles.statLabel}>Notified</Text>
               </View>
             </View>
          </View>
          
          <View style={styles.rollNumbersBox}>
            <Text style={styles.rollNumbersLabel}>Absent Roll Numbers:</Text>
            <Text style={styles.rollNumbersText}>{item.absent_roll_numbers}</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back-ios" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Log</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#F97316" />
          <Text style={styles.loadingText}>Fetching logs...</Text>
        </View>
      ) : logs.length === 0 ? (
        <View style={styles.centerContainer}>
          <Icon name="history-toggle-off" size={64} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>No Logs Found</Text>
          <Text style={styles.emptySubtitle}>You haven't sent any absence notifications today.</Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderLogCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
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
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  cardContainer: {
    marginBottom: 16,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  logCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#FFF5ED',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5ED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timeText: {
    color: '#F97316',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  sectionText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '800',
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 20,
    lineHeight: 26,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#7F1D1D',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  rollNumbersBox: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  rollNumbersLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  rollNumbersText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    lineHeight: 22,
  }
});
