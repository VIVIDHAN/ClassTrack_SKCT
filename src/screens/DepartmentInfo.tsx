import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { DUMMY_USER } from '../constants/DummyData';

export default function DepartmentInfo() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Department Info</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInUp.duration(400)} style={styles.card}>
          <View style={styles.iconWrapper}>
            <Icon name="domain" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.title}>{DUMMY_USER.department}</Text>
          <Text style={styles.subtitle}>Sri Krishna College of Technology</Text>
          <View style={styles.divider} />
          <Text style={styles.label}>Roles & Responsibilities</Text>
          <Text style={styles.value}>• Senior Assistant Professor</Text>
          <Text style={styles.value}>• Class Advisor (IT C)</Text>
          <Text style={styles.value}>• Lab Coordinator</Text>
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
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  iconWrapper: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255, 93, 56, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, color: Colors.text, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, fontWeight: '600', textAlign: 'center', marginBottom: 24 },
  divider: { height: 1, backgroundColor: Colors.border, width: '100%', marginVertical: 16 },
  label: { fontSize: 14, color: Colors.textSecondary, fontWeight: '700', textTransform: 'uppercase', alignSelf: 'flex-start', marginBottom: 12 },
  value: { fontSize: 16, color: Colors.text, fontWeight: '600', alignSelf: 'flex-start', marginBottom: 8 },
});
