import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export interface PillChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  count?: number | string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  activeGradient?: [string, string];
  inactiveGradient?: [string, string];
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  activeTextColor?: string;
  inactiveTextColor?: string;
}

export const PillChip: React.FC<PillChipProps> = ({
  label,
  selected,
  onPress,
  count,
  icon,
  size = 'md',
  activeGradient = ['#5B5480', '#262238'], // Match "Tutorial" in reference image
  inactiveGradient = ['#FFFFFF', '#E8ECF5'], // Match "Chips UI" in reference image
  style,
  textStyle,
  activeTextColor = '#FFFFFF',
  inactiveTextColor = '#0F172A',
}) => {
  const sizeStyles = {
    sm: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      minHeight: 32,
      fontSize: 12,
    },
    md: {
      paddingVertical: 10,
      paddingHorizontal: 18,
      minHeight: 42,
      fontSize: 14,
    },
  }[size];

  const colors = selected ? activeGradient : inactiveGradient;
  const textColor = selected ? activeTextColor : inactiveTextColor;
  const borderColor = selected
    ? 'rgba(255, 255, 255, 0.3)'
    : 'rgba(203, 213, 225, 0.9)';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.touchable,
        {
          shadowColor: selected ? colors[1] : '#475569',
          shadowOpacity: selected ? 0.25 : 0.12,
          shadowRadius: selected ? 8 : 6,
          elevation: selected ? 5 : 3,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[
          styles.gradient,
          {
            paddingVertical: sizeStyles.paddingVertical,
            paddingHorizontal: sizeStyles.paddingHorizontal,
            minHeight: sizeStyles.minHeight,
            borderColor,
          },
        ]}
      >
        <View style={styles.glossyTopHighlight} />
        <View style={styles.contentRow}>
          {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
          <Text
            style={[
              styles.text,
              {
                color: textColor,
                fontSize: sizeStyles.fontSize,
                fontWeight: selected ? '700' : '600',
              },
              textStyle,
            ]}
          >
            {label}
          </Text>
          {count !== undefined && count !== null ? (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: selected
                    ? 'rgba(255, 255, 255, 0.25)'
                    : 'rgba(15, 23, 42, 0.08)',
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  {
                    color: textColor,
                  },
                ]}
              >
                {count}
              </Text>
            </View>
          ) : null}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 9999, // Stadium Pill shape
    shadowOffset: { width: 0, height: 3 },
  },
  gradient: {
    borderRadius: 9999, // Stadium Pill shape
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  glossyTopHighlight: {
    position: 'absolute',
    top: 0,
    left: 10,
    right: 10,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 9999,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 6,
  },
  text: {
    letterSpacing: 0.1,
  },
  badge: {
    marginLeft: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

export default PillChip;
