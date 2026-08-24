import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { apiCall } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  try {
    const existing = await Notifications.getPermissionsAsync();
    let finalStatus: string = existing.status;

    if (finalStatus !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      finalStatus = requested.status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Push notification permission not granted');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const pushToken = tokenData.data;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    return pushToken;
  } catch (err) {
    console.error('Failed to register for push notifications:', err);
    return null;
  }
}

export async function registerPushTokenWithServer(
  token: string
): Promise<void> {
  try {
    await apiCall('POST', '/notifications/register', { token });
  } catch (err) {
    console.error('Failed to register push token with server:', err);
  }
}

export async function unregisterPushTokenWithServer(
  token: string
): Promise<void> {
  try {
    await apiCall('DELETE', '/notifications/register', { token });
  } catch (err) {
    console.error('Failed to unregister push token:', err);
  }
}

export function addPushNotificationListener(
  handler: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(handler);
}

export function addPushNotificationResponseListener(
  handler: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(handler);
}
