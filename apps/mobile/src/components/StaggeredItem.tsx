import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface StaggeredItemProps {
  index: number;
  children: React.ReactNode;
  delay?: number;
  style?: object;
}

export function StaggeredItem({ index, children, delay = 50, style }: StaggeredItemProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }, index * delay);
    return () => clearTimeout(timer);
  }, [index, delay, opacity, translateY]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}
