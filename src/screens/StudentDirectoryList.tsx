import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, TextInput, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated, { FadeInRight, Layout } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../constants/Colors';
import { API_BASE_URL } from '../constants/Config';
import BreatheLoader from '../components/BreatheLoader';

export default function StudentDirectoryList() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { classDetails } = route.params || { classDetails: { subject: 'Unknown', className: 'Unknown' } };
  
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [markedAbsent, setMarkedAbsent] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    fetch(`${API_BASE_URL}/students?section=${classDetails.className}`)
      .then(res => res.json())
      .then(data => {
        const mapped = data.map((s: any) => ({
          id: s.roll_no || s.rollNo,
          db_id: s.id,
          name: s.name,
          phone: s.test_parent_phone_number || s.parent_phone || s.parentPhone || '9876543210',
        }));
        setStudents(mapped);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [classDetails.className]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMarkAbsent = (item: any) => {
    const separator = Platform.OS === 'ios' ? '&' : '?';
    const message = `Dear Parent, your ward ${item.name} is absent today from ${classDetails.className}.`;
    const url = `sms:${item.phone}${separator}body=${encodeURIComponent(message)}`;
    
    Linking.openURL(url).then(() => {
      setMarkedAbsent(prev => ({...prev, [item.id]: true}));
    }).catch(err => {
      console.error('Failed to open SMS app', err);
    });
  };

  const renderStudent = ({ item, index }: { item: any, index: number }) => {
    const isAbsent = markedAbsent[item.id];
    
    return (
      <View>
        <View style={styles.studentCard}>
          <View style={styles.studentAvatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{item.name}</Text>
            <Text style={styles.studentId}>{item.id}</Text>
          </View>
          
          {isAbsent ? (
            <View style={[styles.attendanceBadge, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]}>
              <Text style={[styles.attendanceText, { color: Colors.success }]}>SMS Sent</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.attendanceBadge, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}
              onPress={() => handleMarkAbsent(item)}
            >
              <Text style={[styles.attendanceText, { color: Colors.error }]}>Absent</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <BreatheLoader message="Loading student directory..." />
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
          <Text style={styles.title}>{classDetails.className}</Text>
          <View style={{ width: 28 }} />
        </View>
        <Text style={styles.subtitle}>Directory</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Icon name="search" size={24} color={Colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or roll no..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.listContainer}>
        <Animated.FlatList
          data={filteredStudents}
          keyExtractor={(item: any) => item.id}
          renderItem={renderStudent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          itemLayoutAnimation={Layout.springify()}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>No students found.</Text>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    
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
  searchContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  listContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  studentId: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: Colors.textSecondary,
    fontSize: 16,
  },
  attendanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  attendanceText: {
    fontSize: 14,
    fontWeight: '800',
  }
});
