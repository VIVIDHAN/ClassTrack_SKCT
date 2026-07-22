import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function HelpSupport() {
  const navigation = useNavigation<any>();

  const SupportOption = ({ icon, title, subtitle }: any) => (
    <TouchableOpacity style={styles.optionCard}>
      <View style={styles.iconBox}>
        <Icon name={icon} size={24} color={Colors.primary} />
      </View>
      <View style={styles.optionText}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
      <Icon name="chevron-right" size={24} color={Colors.border} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInUp.duration(400)}>
          <SupportOption icon="chat-bubble-outline" title="Live Chat" subtitle="Usually replies in 5 mins" />
          <SupportOption icon="mail-outline" title="Email Support" subtitle="support@classtrack.edu" />
          <SupportOption icon="article" title="FAQs" subtitle="Find answers to common issues" />
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
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, padding: 20, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  iconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255, 93, 56, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  optionSubtitle: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' }
});
