import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { Colors } from '../constants/Colors';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function Success() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { absentStudents = [], classDetails = {} } = route.params || {};

  const startWhatsAppAutomation = (index = 0) => {
    if (index >= absentStudents.length) {
      Alert.alert('Done', 'All WhatsApp messages processed.');
      return;
    }
    const student = absentStudents[index];
    if (!student.phone) {
      startWhatsAppAutomation(index + 1);
      return;
    }
    const message = `Dear Parent, your ward ${student.name} is absent today for ${classDetails.subject || 'class'}. - ClassTrack`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}&phone=91${student.phone}`;
    
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'WhatsApp is not installed on this device.');
    });

    if (index < absentStudents.length - 1) {
      Alert.alert(
        'Next WhatsApp',
        `Sent to ${student.name}'s parent. Proceed to next student?`,
        [
          { text: 'Stop', style: 'cancel' },
          { text: 'Next', onPress: () => startWhatsAppAutomation(index + 1) }
        ],
        { cancelable: false }
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View entering={ZoomIn.duration(600)} style={styles.iconContainer}>
        <Text style={styles.checkIcon}>✓</Text>
      </Animated.View>
      
      <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.textContainer}>
        <Text style={styles.title}>Attendance Saved!</Text>
        <Text style={styles.subtitle}>SMS notifications have been successfully sent to the parents of all absent students.</Text>
      </Animated.View>

      {absentStudents.length > 0 && (
        <Animated.View entering={FadeInUp.delay(300).duration(600)} style={{ marginBottom: 40 }}>
          <TouchableOpacity 
            style={styles.waButton}
            onPress={() => startWhatsAppAutomation(0)}
          >
            <Text style={styles.waButtonText}>Start WhatsApp Automation</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.buttonWrapper}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.buttonText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#dcfce7', // Very light green
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 4,
    borderColor: Colors.success,
  },
  checkIcon: {
    fontSize: 72,
    color: Colors.success,
    fontWeight: '900',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
  },
  buttonWrapper: {
    width: '100%', 
    paddingHorizontal: 32,
    position: 'absolute',
    bottom: 40,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  waButton: {
    backgroundColor: '#25D366', // WhatsApp Green
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  waButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  }
});
