import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export function impactLight() {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
}

export function impactMedium() {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
}

export function impactHeavy() {
  if (Platform.OS === 'ios') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }
}

export function notificationSuccess() {
  if (Platform.OS === 'ios') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}

export function notificationWarning() {
  if (Platform.OS === 'ios') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }
}

export function notificationError() {
  if (Platform.OS === 'ios') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
}

export function selectionChanged() {
  if (Platform.OS === 'ios') {
    Haptics.selectionAsync();
  }
}
