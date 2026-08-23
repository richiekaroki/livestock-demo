import React, { useState } from "react";
import {
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, View, useColors } from "@/components/Themed";
import { useAuth } from "@/src/contexts/AuthContext";
import { spacing, radius, fontSize, fontWeight } from "@/constants/Tokens";
import { impactLight, impactMedium, notificationSuccess, notificationError } from "@/src/services/haptics";
import { useToast } from "@/src/components/Toast";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginScreen() {
  const { requestOtp, verifyOtp, isLoading } = useAuth();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleRequestOtp = async () => {
    setError("");
    impactMedium();
    try {
      await requestOtp(email);
      notificationSuccess();
      showToast('success', 'OTP sent successfully');
      setStep("otp");
    } catch (err) {
      notificationError();
      showToast('error', err instanceof Error ? err.message : 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    impactMedium();
    try {
      await verifyOtp(email, otp);
      notificationSuccess();
      router.replace("/(tabs)");
    } catch (err) {
      notificationError();
      showToast('error', err instanceof Error ? err.message : 'Invalid OTP');
    }
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.inputBg,
      borderColor: colors.inputBorder,
      color: colors.text,
    },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={[styles.logoWrap, { backgroundColor: colors.tintLight }]}>
            <Ionicons name="leaf-outline" size={32} color={colors.tint} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>Wam Mfugo</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sign in to your account
          </Text>
        </View>

        {error ? (
          <View style={[styles.errorWrap, { backgroundColor: colors.destructiveLight }]}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.destructive} />
            <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
          </View>
        ) : null}

        {step === "email" ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <TextInput
              style={inputStyle}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
            <Pressable
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: colors.tint },
                (!email || isLoading) && styles.buttonDisabled,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              disabled={!email || isLoading}
              onPress={handleRequestOtp}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="mail-outline" size={18} color="#fff" />
                  <Text style={styles.buttonText}>Send OTP</Text>
                </>
              )}
            </Pressable>
            <Link href="/(auth)/register" style={[styles.link, { color: colors.tint }]}>
              Don't have an account? Register
            </Link>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.label, { color: colors.text }]}>Verification Code</Text>
            <TextInput
              style={inputStyle}
              value={otp}
              onChangeText={(t) => setOtp(t.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              placeholderTextColor={colors.placeholder}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              Enter the 6-digit code sent to {email}
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: colors.tint },
                (otp.length !== 6 || isLoading) && styles.buttonDisabled,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              disabled={otp.length !== 6 || isLoading}
              onPress={handleVerifyOtp}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                  <Text style={styles.buttonText}>Verify</Text>
                </>
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                setStep("email");
                setOtp("");
                setError("");
              }}
              style={styles.backButton}
            >
              <Text style={[styles.backText, { color: colors.textSecondary }]}>
                Use a different email
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: "center", padding: spacing.xxxl },
  header: { alignItems: "center", marginBottom: spacing.xxxl },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: { fontSize: fontSize.hero, fontWeight: fontWeight.bold },
  subtitle: { fontSize: fontSize.md, marginTop: spacing.xs },
  card: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    borderWidth: 1,
  },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    marginBottom: spacing.lg,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: fontWeight.semibold, fontSize: fontSize.base },
  link: { textAlign: "center", marginTop: spacing.xl, fontSize: fontSize.md },
  backButton: { alignItems: "center", marginTop: spacing.lg },
  backText: { fontSize: fontSize.md },
  hint: { fontSize: fontSize.sm, marginBottom: spacing.lg, textAlign: "center" },
  errorWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  error: { fontSize: fontSize.sm, flex: 1 },
});
