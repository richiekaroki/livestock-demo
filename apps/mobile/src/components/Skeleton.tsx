import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/components/Themed';
import { spacing, radius } from '@/constants/Tokens';

// Suppress TS type incompatibility with Expo SDK 54
import React from 'react';
const LinearGradientAny = LinearGradient as unknown as React.ComponentType<any>;

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = radius.sm, style }: SkeletonProps) {
  const colors = useColors();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={[{ width, height, borderRadius, overflow: 'hidden', backgroundColor: colors.border }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
        <LinearGradientAny
          colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

export function StatCardSkeleton({ colors }: { colors: ReturnType<typeof import('@/components/Themed').useColors> }) {
  return (
    <View style={[skelStyles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <Skeleton width={40} height={40} borderRadius={radius.md} />
      <Skeleton width={32} height={24} />
      <Skeleton width={50} height={12} />
    </View>
  );
}

export function RowSkeleton({ colors }: { colors: ReturnType<typeof import('@/components/Themed').useColors> }) {
  return (
    <View style={[skelStyles.row, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <Skeleton width={36} height={36} borderRadius={radius.sm} />
      <View style={skelStyles.rowContent}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={12} />
        <Skeleton width={60} height={18} borderRadius={radius.pill} />
      </View>
    </View>
  );
}

const skelStyles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: '30%',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    alignItems: 'center',
  },
  rowContent: { flex: 1, gap: 6 },
});
