import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useColors } from '@/components/Themed';
import { spacing, radius, shadows } from '@/constants/Tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  disabled?: boolean;
}

export function Card({ children, onPress, style, variant = 'default', disabled = false }: CardProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && onPress) {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    if (!disabled && onPress) {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    }
  };

  const variantStyles: Record<string, ViewStyle> = {
    default: {
      backgroundColor: colors.card,
      borderColor: colors.cardBorder,
      borderWidth: 1,
      ...shadows.sm(colors.shadowColor, colors.shadowOpacity),
    },
    elevated: {
      backgroundColor: colors.card,
      borderColor: colors.cardBorder,
      borderWidth: 1,
      ...shadows.md(colors.shadowColor, colors.shadowOpacity + 0.04),
    },
    outlined: {
      backgroundColor: 'transparent',
      borderColor: colors.border,
      borderWidth: 1.5,
    },
    glass: {
      backgroundColor: colors.card + 'CC',
      borderColor: colors.border + '80',
      borderWidth: 1,
      ...shadows.sm(colors.shadowColor, colors.shadowOpacity),
    },
  };

  const content = (
    <Animated.View
      style={[
        styles.base,
        variantStyles[variant],
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        hitSlop={8}
        accessibilityRole="button"
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  disabled: {
    opacity: 0.5,
  },
});
