import { Pressable, StyleSheet, ActivityIndicator, type ViewStyle, type TextStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Text, useColors } from '@/components/Themed';
import { spacing, radius, fontSize, fontWeight, shadows } from '@/constants/Tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    }
  };

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle; iconColor: string } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: colors.tint,
            ...shadows.sm(colors.tint, 0.2),
          },
          text: { color: '#FFFFFF' },
          iconColor: '#FFFFFF',
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: colors.tintLight,
            borderWidth: 1,
            borderColor: colors.tint + '40',
          },
          text: { color: colors.tint },
          iconColor: colors.tint,
        };
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent' },
          text: { color: colors.tint },
          iconColor: colors.tint,
        };
      case 'destructive':
        return {
          container: {
            backgroundColor: colors.destructive,
            ...shadows.sm(colors.destructive, 0.2),
          },
          text: { color: '#FFFFFF' },
          iconColor: '#FFFFFF',
        };
    }
  };

  const sizeStyles: Record<string, { container: ViewStyle; text: TextStyle; iconSize: number }> = {
    sm: {
      container: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, minHeight: 36 },
      text: { fontSize: fontSize.sm },
      iconSize: 16,
    },
    md: {
      container: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, minHeight: 44 },
      text: { fontSize: fontSize.base },
      iconSize: 20,
    },
    lg: {
      container: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, minHeight: 52 },
      text: { fontSize: fontSize.lg },
      iconSize: 22,
    },
  };

  const variantStyle = getVariantStyles();
  const sizeStyle = sizeStyles[size];

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      <Animated.View
        style={[
          styles.base,
          variantStyle.container,
          sizeStyle.container,
          (disabled || loading) && styles.disabled,
          animatedStyle,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={variantStyle.iconColor} />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <Ionicons name={icon} size={sizeStyle.iconSize} color={variantStyle.iconColor} style={styles.iconLeft} />
            )}
            <Text style={[styles.text, sizeStyle.text, variantStyle.text, textStyle]}>
              {title}
            </Text>
            {icon && iconPosition === 'right' && (
              <Ionicons name={icon} size={sizeStyle.iconSize} color={variantStyle.iconColor} style={styles.iconRight} />
            )}
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  text: {
    fontWeight: fontWeight.semibold,
  },
  iconLeft: {
    marginRight: spacing.xs,
  },
  iconRight: {
    marginLeft: spacing.xs,
  },
  disabled: {
    opacity: 0.5,
  },
});
