import { useState, useEffect } from 'react';
import { Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, useColors } from '@/components/Themed';
import { spacing, radius, fontSize, fontWeight } from '@/constants/Tokens';
import { impactMedium } from '@/src/services/haptics';
import { API_BASE_URL } from '@/src/services/storage';
import { useAuth } from '@/src/contexts/AuthContext';

export default function VerifyInviteScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const { verifyRegistration } = useAuth();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMsg('No invite token provided.');
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/verify-invite/${token}`);
        const data = await res.json();

        if (res.ok && data.success) {
          // Update AuthContext so the app recognizes the user as logged in
          await verifyRegistration(data.data.user.email, token);
          impactMedium();
          setStatus('success');
          setTimeout(() => router.replace('/'), 1500);
        } else {
          setStatus('error');
          setErrorMsg(data.error || 'Invalid or expired invite link.');
        }
      } catch {
        setStatus('error');
        setErrorMsg('Network error. Please try again.');
      }
    })();
  }, [token]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + spacing.xxl }]}>
      {status === 'loading' && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Verifying invite...</Text>
        </View>
      )}

      {status === 'success' && (
        <View style={styles.center}>
          <Ionicons name="checkmark-circle-outline" size={64} color={colors.success} />
          <Text style={[styles.successText, { color: colors.success }]}>Invite verified!</Text>
          <Text style={[styles.subText, { color: colors.textSecondary }]}>Redirecting to dashboard...</Text>
        </View>
      )}

      {status === 'error' && (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.destructive} />
          <Text style={[styles.errorText, { color: colors.destructive }]}>Verification Failed</Text>
          <Text style={[styles.subText, { color: colors.textSecondary }]}>{errorMsg}</Text>
          <Pressable
            onPress={() => router.replace('/(auth)/register')}
            style={({ pressed }) => [styles.btn, { backgroundColor: colors.tint, opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={styles.btnText}>Register Manually</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  loadingText: { fontSize: fontSize.base },
  successText: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  errorText: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  subText: { fontSize: fontSize.sm, textAlign: 'center' },
  btn: {
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    borderRadius: radius.md, marginTop: spacing.md,
  },
  btnText: { color: '#fff', fontSize: fontSize.base, fontWeight: fontWeight.semibold },
});
