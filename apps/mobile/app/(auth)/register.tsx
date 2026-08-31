import React, { useState } from "react";
import {
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, View, useColors } from "@/components/Themed";
import { useAuth } from "@/src/contexts/AuthContext";
import { spacing, radius, fontSize, fontWeight } from "@/constants/Tokens";
import { impactMedium, notificationSuccess, notificationError } from "@/src/services/haptics";
import { useToast } from "@/src/components/Toast";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useI18n } from "@/src/i18n";

export default function RegisterScreen() {
  const { register, verifyRegistration, isLoading } = useAuth();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { t } = useI18n();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", county: "" });
  const [otp, setOtp] = useState("");
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  const handleRegister = async () => {
    setError("");
    impactMedium();
    try {
      const res = await register(form);
      setDemoOtp(res.otp || null);
      notificationSuccess();
      showToast('success', 'Account created successfully');
      setStep("otp");
    } catch (err) {
      notificationError();
      showToast('error', err instanceof Error ? err.message : t('registerFailed'));
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    impactMedium();
    try {
      await verifyRegistration(form.email, otp);
      notificationSuccess();
    } catch (err) {
      notificationError();
      showToast('error', err instanceof Error ? err.message : t('verifyFailed'));
    }
  };

  const canSubmit = form.name.length > 1 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && form.phone.length >= 10 && form.county !== "";

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
            <Ionicons name="person-add-outline" size={32} color={colors.tint} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{t('createAccount')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('joinWamMfugo')}
          </Text>
        </View>

        {error ? (
          <View style={[styles.errorWrap, { backgroundColor: colors.destructiveLight }]}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.destructive} />
            <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
          </View>
        ) : null}

        {step === "form" ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.label, { color: colors.text }]}>{t('fullName')}</Text>
            <TextInput
              style={inputStyle}
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
              placeholder="Richard Karoki"
              placeholderTextColor={colors.placeholder}
            />

            <Text style={[styles.label, { color: colors.text }]}>{t('email')}</Text>
            <TextInput
              style={inputStyle}
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
              placeholder={t('emailPlaceholder')}
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />

            <Text style={[styles.label, { color: colors.text }]}>{t('phone')}</Text>
            <TextInput
              style={inputStyle}
              value={form.phone}
              onChangeText={(text) => setForm({ ...form, phone: text })}
              placeholder={t('phonePlaceholder')}
              placeholderTextColor={colors.placeholder}
              keyboardType="phone-pad"
            />

            <Text style={[styles.label, { color: colors.text }]}>{t('county')}</Text>
            <TextInput
              style={inputStyle}
              value={form.county}
              onChangeText={(text) => setForm({ ...form, county: text })}
              placeholder="Nairobi"
              placeholderTextColor={colors.placeholder}
            />

            <Pressable
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: colors.tint },
                (!canSubmit || isLoading) && styles.buttonDisabled,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              disabled={!canSubmit || isLoading}
              onPress={handleRegister}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="person-add-outline" size={18} color="#fff" />
                  <Text style={styles.buttonText}>{t('createAccount')}</Text>
                </>
              )}
            </Pressable>
            <Link href="/(auth)/login" style={[styles.link, { color: colors.tint }]}>
              {t('alreadyHaveAccount')} {t('signIn')}
            </Link>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.label, { color: colors.text }]}>{t('verificationCode')}</Text>
            {__DEV__ && demoOtp && (
              <Pressable
                onPress={() => setOtp(demoOtp)}
                style={[styles.demoOtpWrap, { backgroundColor: colors.tintLight, borderColor: colors.tint }]}
              >
                <Text style={[styles.demoOtpLabel, { color: colors.textSecondary }]}>Demo mode — tap to auto-fill:</Text>
                <Text style={[styles.demoOtpCode, { color: colors.tint }]}>{demoOtp}</Text>
              </Pressable>
            )}
            <TextInput
              style={inputStyle}
              value={otp}
              onChangeText={(text) => setOtp(text.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              placeholderTextColor={colors.placeholder}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              {t('enterOtpSentTo')} {form.email}
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
                  <Text style={styles.buttonText}>{t('verify')}</Text>
                </>
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                setStep("form");
                setOtp("");
                setError("");
                setDemoOtp(null);
              }}
              style={styles.backButton}
            >
              <Text style={[styles.backText, { color: colors.textSecondary }]}>{t('backToForm')}</Text>
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
  demoOtpWrap: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: "center",
  },
  demoOtpLabel: { fontSize: fontSize.xs, marginBottom: spacing.xs },
  demoOtpCode: { fontSize: 28, fontWeight: fontWeight.bold, letterSpacing: 4, fontVariant: ["tabular-nums"] },
});
