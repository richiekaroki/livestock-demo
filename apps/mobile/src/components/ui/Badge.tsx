import { StyleSheet, type ViewStyle } from 'react-native';
import { Text } from '@/components/Themed';
import { useColors } from '@/components/Themed';
import { spacing, radius, fontSize, fontWeight } from '@/constants/Tokens';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'outline';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function Badge({ label, variant = 'default', size = 'sm', style }: BadgeProps) {
  const colors = useColors();

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'success':
        return {
          container: { backgroundColor: colors.success + '20', borderColor: colors.success + '40' },
          text: { color: colors.success },
        };
      case 'warning':
        return {
          container: { backgroundColor: colors.warning + '20', borderColor: colors.warning + '40' },
          text: { color: colors.warning },
        };
      case 'destructive':
        return {
          container: { backgroundColor: colors.destructive + '20', borderColor: colors.destructive + '40' },
          text: { color: colors.destructive },
        };
      case 'info':
        return {
          container: { backgroundColor: colors.info + '20', borderColor: colors.info + '40' },
          text: { color: colors.info },
        };
      case 'outline':
        return {
          container: { backgroundColor: 'transparent', borderColor: colors.border },
          text: { color: colors.textSecondary },
        };
      default:
        return {
          container: { backgroundColor: colors.tintLight, borderColor: colors.tint + '30' },
          text: { color: colors.tint },
        };
    }
  };

  const sizeStyles: Record<string, { container: ViewStyle; text: TextStyle }> = {
    sm: {
      container: { paddingVertical: 2, paddingHorizontal: spacing.sm },
      text: { fontSize: fontSize.xs },
    },
    md: {
      container: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
      text: { fontSize: fontSize.sm },
    },
  };

  const variantStyle = getVariantStyles();
  const sizeStyle = sizeStyles[size];

  return (
    <View
      style={[
        styles.base,
        variantStyle.container,
        sizeStyle.container,
        style,
      ]}
    >
      <Text style={[styles.text, sizeStyle.text, variantStyle.text]}>{label}</Text>
    </View>
  );
}

import { View } from '@/components/Themed';
import type { TextStyle } from 'react-native';

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  text: {
    fontWeight: fontWeight.medium,
  },
});
