import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export type PillButtonVariant =
  | 'primary'
  | 'dark'
  | 'secondary'
  | 'light'
  | 'outline'
  | 'success'
  | 'danger'
  | 'warning';

export type PillButtonSize = 'sm' | 'md' | 'lg';

export interface PillButtonProps {
  title: string;
  onPress: () => void;
  variant?: PillButtonVariant;
  size?: PillButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  activeOpacity?: number;
}

export const PillButton: React.FC<PillButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  activeOpacity = 0.8,
}) => {
  const getGradientColors = (): [string, string, ...string[]] => {
    switch (variant) {
      case 'primary':
        return ['#FF8C38', '#E05D00'];
      case 'dark':
        // Match reference image "Tutorial" button (#5B5480 to #262238)
        return ['#5B5480', '#262238'];
      case 'secondary':
      case 'light':
        // Match reference image "Chips UI" button (#FFFFFF to #E8ECF5)
        return ['#FFFFFF', '#E8ECF5'];
      case 'outline':
        // Match reference image "Design ideas" button
        return ['#F5F6FA', '#E4E7F5'];
      case 'success':
        return ['#34D399', '#059669'];
      case 'danger':
        return ['#F87171', '#DC2626'];
      case 'warning':
        return ['#FBBF24', '#D97706'];
      default:
        return ['#FF8C38', '#E05D00'];
    }
  };

  const getBorderColor = (): string => {
    switch (variant) {
      case 'primary':
        return 'rgba(255, 255, 255, 0.35)';
      case 'dark':
        return 'rgba(255, 255, 255, 0.25)';
      case 'secondary':
      case 'light':
        return '#CBD5E1';
      case 'outline':
        return '#8B8BAE';
      case 'success':
        return 'rgba(255, 255, 255, 0.4)';
      case 'danger':
        return 'rgba(255, 255, 255, 0.4)';
      case 'warning':
        return 'rgba(255, 255, 255, 0.4)';
      default:
        return 'transparent';
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'secondary':
      case 'light':
        return '#0F172A';
      case 'outline':
        return '#1E1B4B';
      default:
        return '#FFFFFF';
    }
  };

  const getShadowColor = (): string => {
    switch (variant) {
      case 'primary':
        return '#E05D00';
      case 'dark':
        return '#181528';
      case 'secondary':
      case 'light':
        return '#475569';
      case 'outline':
        return '#64748B';
      case 'success':
        return '#059669';
      case 'danger':
        return '#DC2626';
      case 'warning':
        return '#D97706';
      default:
        return '#000000';
    }
  };

  const sizeStyles = {
    sm: {
      paddingVertical: 7,
      paddingHorizontal: 16,
      minHeight: 36,
      fontSize: 13,
    },
    md: {
      paddingVertical: 12,
      paddingHorizontal: 22,
      minHeight: 48,
      fontSize: 15,
    },
    lg: {
      paddingVertical: 16,
      paddingHorizontal: 28,
      minHeight: 56,
      fontSize: 17,
    },
  }[size];

  const currentTextColor = getTextColor();
  const shadowColor = getShadowColor();
  const borderColor = getBorderColor();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={activeOpacity}
      style={[
        styles.touchable,
        fullWidth && styles.fullWidth,
        {
          shadowColor,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[
          styles.gradient,
          {
            paddingVertical: sizeStyles.paddingVertical,
            paddingHorizontal: sizeStyles.paddingHorizontal,
            minHeight: sizeStyles.minHeight,
            borderColor,
            borderWidth: variant === 'outline' ? 1.5 : 1,
          },
        ]}
      >
        {/* Top glossy edge inner highlight overlay */}
        <View style={styles.glossyTopHighlight} />

        {loading ? (
          <ActivityIndicator color={currentTextColor} size="small" />
        ) : (
          <View style={styles.contentRow}>
            {icon && iconPosition === 'left' ? (
              <View style={styles.iconLeft}>{icon}</View>
            ) : null}
            <Text
              style={[
                styles.text,
                {
                  color: currentTextColor,
                  fontSize: sizeStyles.fontSize,
                },
                textStyle,
              ]}
            >
              {title}
            </Text>
            {icon && iconPosition === 'right' ? (
              <View style={styles.iconRight}>{icon}</View>
            ) : null}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 9999, // Stadium Pill shape
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  fullWidth: {
    width: '100%',
  },
  gradient: {
    borderRadius: 9999, // Stadium Pill shape
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  glossyTopHighlight: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 9999,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

export default PillButton;
