import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function SecurityPassword() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInUp.duration(400)}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Current Password</Text>
            <TextInput style={styles.input} secureTextEntry placeholder="••••••••" placeholderTextColor="#94A3B8" />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <TextInput style={styles.input} secureTextEntry placeholder="••••••••" placeholderTextColor="#94A3B8" />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput style={styles.input} secureTextEntry placeholder="••••••••" placeholderTextColor="#94A3B8" />
          </View>
          
          <TouchableOpacity style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Update Password</Text>
          </TouchableOpacity>
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
  sectionTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 20 },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, color: Colors.textSecondary, fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 16, fontSize: 16, color: Colors.text },
  saveBtn: { backgroundColor: Colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' }
});
