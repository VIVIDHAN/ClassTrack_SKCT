import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { API_BASE_URL } from '../constants/Config';
import BreatheLoader from '../components/BreatheLoader';

export default function PersonalDetails() {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = React.useState(true);
  const [facultyName, setFacultyName] = React.useState('Faculty Member');
  const [facultyEmail, setFacultyEmail] = React.useState('faculty@skct.edu.in');
  const [facultyPhone, setFacultyPhone] = React.useState('+91 98765 43210');
  
  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      fetch(`${API_BASE_URL}/timetable?day=1&section=III IT G`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0 && data[0].Teacher) {
            setFacultyName(data[0].Teacher.name);
            if (data[0].Teacher.email) setFacultyEmail(data[0].Teacher.email);
            if (data[0].Teacher.phone) setFacultyPhone(data[0].Teacher.phone);
          }
        })
        .catch(err => console.log('Failed to fetch personal details:', err))
        .finally(() => {
          setTimeout(() => {
            setLoading(false);
          }, 1000);
        });
    }, [])
  );

  const DetailRow = ({ label, value }: any) => (
    <View style={styles.detailRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <BreatheLoader message="Loading personal details..." />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Details</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInUp.duration(400)} style={styles.card}>
          <DetailRow label="Full Name" value={`Prof. ${facultyName}`} />
          <View style={styles.divider} />
          <DetailRow label="Email Address" value={facultyEmail} />
          <View style={styles.divider} />
          <DetailRow label="Phone Number" value={facultyPhone} />
          <View style={styles.divider} />
          <DetailRow label="Date of Birth" value="15 Aug 1985" />
          <View style={styles.divider} />
          <DetailRow label="Gender" value="Male" />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { padding: 10, backgroundColor: Colors.background, borderRadius: 10, marginRight: 16, borderWidth: 1, borderColor: Colors.border },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.text },
  content: { padding: 24 },
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Colors.border },
  detailRow: { paddingVertical: 12 },
  label: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  value: { fontSize: 18, color: Colors.text, fontWeight: '700' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
});
