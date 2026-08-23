import { useState, useEffect } from 'react';
import { StyleSheet, Animated, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, useColors } from '@/components/Themed';
import { spacing, radius, fontSize, fontWeight } from '@/constants/Tokens';
import { connectSocket, getSocket } from '@/src/services/socket';

export function LiveIndicator() {
  const [isOnline, setIsOnline] = useState(false);
  const pulseAnim = useState(new Animated.Value(1))[0];
  const colors = useColors();

  useEffect(() => {
    let mounted = true;

    const setup = async () => {
      const s = await connectSocket();

      if (mounted) setIsOnline(s.connected);

      s.on('connect', () => { if (mounted) setIsOnline(true); });
      s.on('disconnect', () => { if (mounted) setIsOnline(false); });
    };

    void setup();

    return () => {
      mounted = false;
      getSocket().then((s) => {
        s.off('connect');
        s.off('disconnect');
      });
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isOnline, pulseAnim]);

  const statusColor = isOnline ? colors.success : colors.destructive;

  return (
    <Animated.View style={[styles.container, { opacity: pulseAnim }]}>
      <View style={[styles.dot, { backgroundColor: statusColor }]} />
      <Text style={[styles.label, { color: statusColor }]}>
        {isOnline ? 'Live' : 'Offline'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
});
