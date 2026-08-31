import { useRef } from 'react';
import { Animated, StyleSheet, Pressable, View as RNView } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Text, useColors } from '@/components/Themed';
import { fontSize, fontWeight } from '@/constants/Tokens';
import { impactMedium } from '@/src/services/haptics';

// Suppress TS type incompatibility with react-native-gesture-handler
import React from 'react';
const SwipeableAny = Swipeable as unknown as React.ComponentType<any>;

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onEdit?: () => void;
  deleteLabel?: string;
  editLabel?: string;
}

export function SwipeableRow({
  children,
  onDelete,
  onEdit,
  deleteLabel = 'Delete',
  editLabel = 'Edit',
}: SwipeableRowProps) {
  const swipeableRef = useRef<Swipeable>(null);
  const colors = useColors();

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [80, 0],
    });

    return (
      <RNView style={swipeStyles.rightActions}>
        {onEdit && (
          <Animated.View style={[swipeStyles.action, { transform: [{ translateX: trans }] }]}>
            <Pressable
              onPress={() => {
                impactMedium();
                swipeableRef.current?.close();
                onEdit();
              }}
              style={[swipeStyles.actionBtn, { backgroundColor: colors.info }]}
            >
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={swipeStyles.actionText}>{editLabel}</Text>
            </Pressable>
          </Animated.View>
        )}
        {onDelete && (
          <Animated.View style={[swipeStyles.action, { transform: [{ translateX: trans }] }]}>
            <Pressable
              onPress={() => {
                impactMedium();
                swipeableRef.current?.close();
                onDelete();
              }}
              style={[swipeStyles.actionBtn, { backgroundColor: colors.destructive }]}
            >
              <Ionicons name="trash-outline" size={20} color="#fff" />
              <Text style={swipeStyles.actionText}>{deleteLabel}</Text>
            </Pressable>
          </Animated.View>
        )}
      </RNView>
    );
  };

  return (
    <SwipeableAny
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}
    >
      {children}
    </SwipeableAny>
  );
}

const swipeStyles = StyleSheet.create({
  rightActions: {
    flexDirection: 'row',
    gap: 2,
  },
  action: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 4,
  },
  actionText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
});
