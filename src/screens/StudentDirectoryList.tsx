import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated, { FadeInRight, Layout } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../constants/Colors';
import { API_BASE_URL } from '../constants/Config';
import BreatheLoader from '../components/BreatheLoader';
import { SKCT_STUDENTS_G, SKCT_STUDENTS_E } from '../constants/DummyData';

export default function StudentDirectoryList() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { classDetails } = route.params || { classDetails: { subject: 'Student Directory', className: 'III IT G' } };
  
  const [selectedSection, setSelectedSection] = useState<string>(
    classDetails.className && classDetails.className !== 'Unknown' ? classDetails.className : 'III IT G'
  );
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const isSectionE = selectedSection.includes('E');
    const fallbackList = isSectionE ? SKCT_STUDENTS_E : SKCT_STUDENTS_G;

    fetch(`${API_BASE_URL}/students?section=${encodeURIComponent(selectedSection)}`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        clearTimeout(timeoutId);
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((s: any) => ({
            id: s.roll_no || s.rollNo,
            db_id: s.id,
            name: s.name,
            phone: s.parentPhone || s.parent_phone || s.phone,
          }));
          setStudents(mapped);
        } else {
          setStudents(fallbackList);
        }
        setLoading(false);
      })
      .catch(() => {
        setStudents(fallbackList);
        setLoading(false);
      });

    return () => clearTimeout(timeoutId);
  }, [selectedSection]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStudent = ({ item, index }: { item: any, index: number }) => {
    let hash = 0;
    for (let i = 0; i < item.id.length; i++) {
      hash += item.id.charCodeAt(i);
    }
    const mockAttendance = 70 + (hash % 31);
    
    return (
      <View>
        <TouchableOpacity 
          style={styles.studentCard}
          onPress={() => navigation.navigate('StudentProfile', { student: item, classDetails: { ...classDetails, className: selectedSection } })}
          activeOpacity={0.75}
        >
          <View style={styles.studentAvatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{item.name}</Text>
            <Text style={styles.studentId}>{item.id}</Text>
          </View>
          <View style={styles.attendanceBadge}>
            <Text style={[
              styles.attendanceText, 
              { color: mockAttendance >= 85 ? Colors.success : mockAttendance >= 75 ? Colors.warning : Colors.error }
            ]}>
              {mockAttendance}%
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <BreatheLoader message={`Loading student directory (${selectedSection})...`} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={26} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>{selectedSection}</Text>
          <View style={{ width: 28 }} />
        </View>
        
        {/* Section Selector */}
        <View style={styles.sectionToggleRow}>
          {['III IT G', 'III IT E'].map((sec) => (
            <TouchableOpacity
              key={sec}
              style={[styles.sectionBtn, selectedSection === sec && styles.sectionBtnActive]}
              onPress={() => setSelectedSection(sec)}
            >
              <Text style={[styles.sectionBtnText, selectedSection === sec && styles.sectionBtnTextActive]}>
                {sec}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.subtitle}>
          {classDetails.subject && classDetails.subject !== 'Unknown'
            ? `${classDetails.subject} • Directory (${filteredStudents.length} Students)`
            : `Student Directory (${filteredStudents.length} Students)`}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Icon name="search" size={22} color={Colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or roll no..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={18} color={Colors.textSecondary} />
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
            <Text style={styles.emptyText}>No students found for {selectedSection}.</Text>
          )}
        />
      </View>
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
  sectionToggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  sectionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  sectionBtnActive: {
    backgroundColor: Colors.primary,
  },
  sectionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  sectionBtnTextActive: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  studentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  studentId: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  attendanceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
  },
  attendanceText: {
    fontSize: 13,
    fontWeight: '800',
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 40,
    fontWeight: '500',
  },
});
