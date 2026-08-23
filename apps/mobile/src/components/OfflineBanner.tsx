// src/OfflineBanner.tsx — offline + sync status banner
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, useColors } from '@/components/Themed';
import { spacing, radius, fontSize, fontWeight } from '@/constants/Tokens';
import { useSyncState } from '@/src/services/syncService';

export function OfflineBanner() {
  const colors = useColors();
  const { isOnline, isSyncing, pendingCount, failedCount, lastSyncResult, retryFailed } = useSyncState();
  const opacity = useRef(new Animated.Value(0)).current;
  const [syncComplete, setSyncComplete] = useState(false);
  const syncCompleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showBanner = !isOnline || isSyncing || pendingCount > 0 || failedCount > 0 || syncComplete;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: showBanner ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showBanner, opacity]);

  useEffect(() => {
    if (lastSyncResult && lastSyncResult.synced > 0 && lastSyncResult.failed === 0) {
      setSyncComplete(true);
      if (syncCompleteTimer.current) clearTimeout(syncCompleteTimer.current);
      syncCompleteTimer.current = setTimeout(() => setSyncComplete(false), 3000);
    }
    return () => {
      if (syncCompleteTimer.current) clearTimeout(syncCompleteTimer.current);
    };
  }, [lastSyncResult]);

  if (!showBanner) return null;

  let icon: string;
  let message: string;
  let bgColor: string;
  let textColor: string;
  let onRetry: (() => void) | null = null;

  if (!isOnline) {
    icon = 'cloud-offline-outline';
    message = pendingCount > 0
      ? `${pendingCount} change${pendingCount === 1 ? '' : 's'} pending sync`
      : "You're offline";
    bgColor = colors.warning + '15';
    textColor = colors.warning;
  } else if (isSyncing) {
    icon = 'sync-outline';
    message = 'Syncing...';
    bgColor = colors.tint + '15';
    textColor = colors.tint;
  } else if (syncComplete) {
    icon = 'checkmark-circle-outline';
    message = 'Sync complete';
    bgColor = colors.success + '15';
    textColor = colors.success;
  } else if (failedCount > 0) {
    icon = 'alert-circle-outline';
    message = `${failedCount} change${failedCount === 1 ? '' : 's'} failed to sync`;
    bgColor = colors.destructive + '15';
    textColor = colors.destructive;
    onRetry = retryFailed;
  } else if (pendingCount > 0) {
    icon = 'time-outline';
    message = `${pendingCount} change${pendingCount === 1 ? '' : 's'} pending sync`;
    bgColor = colors.warning + '15';
    textColor = colors.warning;
  } else {
    return null;
  }

  const banner = (
    <Animated.View
      style={[offStyles.banner, { backgroundColor: bgColor, borderColor: textColor + '30', opacity }]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      {isSyncing ? (
        <Ionicons name={icon as any} size={16} color={textColor} style={offStyles.spin} />
      ) : (
        <Ionicons name={icon as any} size={16} color={textColor} />
      )}
      <Text style={[offStyles.text, { color: textColor }]}>{message}</Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [offStyles.retryBtn, { opacity: pressed ? 0.6 : 1 }]}
          accessibilityLabel="Retry failed syncs"
        >
          <Text style={[offStyles.retryText, { color: textColor }]}>Retry</Text>
        </Pressable>
      )}
    </Animated.View>
  );

  if (onRetry) {
    return <Pressable onPress={onRetry}>{banner}</Pressable>;
  }
  return banner;
}

const offStyles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  text: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    flex: 1,
  },
  retryBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  retryText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  spin: {
    // Native rotation would require reanimated; static icon is fine for now
  },
});
