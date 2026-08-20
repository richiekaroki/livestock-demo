import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";

export default function LoginScreen() {
  const { requestOtp, verifyOtp, isLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleRequestOtp = async () => {
    setError("");
    try {
      await requestOtp(email);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    try {
      await verifyOtp(email, otp);
      router.replace("/(tabs)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Wam Mfugo</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {step === "email" ? (
          <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.button, !email || isLoading ? styles.buttonDisabled : null]}
              disabled={!email || isLoading}
              onPress={handleRequestOtp}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Sending..." : "Send OTP"}
              </Text>
            </TouchableOpacity>
            <Link href="/(auth)/register" style={styles.link}>
              Don't have an account? Register
            </Link>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              style={styles.input}
              value={otp}
              onChangeText={(t) => setOtp(t.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
            <Text style={styles.hint}>Enter the 6-digit code sent to {email}</Text>
            <TouchableOpacity
              style={[styles.button, otp.length !== 6 || isLoading ? styles.buttonDisabled : null]}
              disabled={otp.length !== 6 || isLoading}
              onPress={handleVerifyOtp}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Verifying..." : "Verify"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setStep("email");
                setOtp("");
                setError("");
              }}
              style={styles.backButton}
            >
              <Text style={styles.backText}>Use a different email</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#fff" },
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  header: { alignItems: "center", marginBottom: 32 },
  title: { fontSize: 28, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 15, color: "#6b7280", marginTop: 4 },
  card: { backgroundColor: "#f9fafb", borderRadius: 12, padding: 20 },
  label: { fontSize: 14, fontWeight: "500", color: "#111827", marginBottom: 6 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#16a34a",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  link: { textAlign: "center", color: "#16a34a", marginTop: 16, fontSize: 14 },
  backButton: { alignItems: "center", marginTop: 12 },
  backText: { color: "#6b7280", fontSize: 14 },
  hint: { color: "#6b7280", fontSize: 13, marginBottom: 12, textAlign: "center" },
  error: {
    color: "#dc2626",
    backgroundColor: "#fef2f2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
  },
});
