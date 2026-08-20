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
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";

export default function RegisterScreen() {
  const { register, verifyRegistration, isLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", county: "" });
  const [otp, setOtp] = useState("");

  const handleRegister = async () => {
    setError("");
    try {
      await register(form);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    try {
      await verifyRegistration(form.email, otp);
      router.replace("/(tabs)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    }
  };

  const canSubmit = form.name.length > 1 && form.email.includes("@") && form.phone.length > 0 && form.county !== "";

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Wam Mfugo today</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {step === "form" ? (
          <View style={styles.card}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
              placeholder="Richard Karoki"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={(t) => setForm({ ...form, email: t })}
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />

            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={form.phone}
              onChangeText={(t) => setForm({ ...form, phone: t })}
              placeholder="+254700000000"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>County</Text>
            <TextInput
              style={styles.input}
              value={form.county}
              onChangeText={(t) => setForm({ ...form, county: t })}
              placeholder="Nairobi"
            />

            <TouchableOpacity
              style={[styles.button, !canSubmit || isLoading ? styles.buttonDisabled : null]}
              disabled={!canSubmit || isLoading}
              onPress={handleRegister}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Creating..." : "Create Account"}
              </Text>
            </TouchableOpacity>
            <Link href="/(auth)/login" style={styles.link}>
              Already have an account? Sign in
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
            <Text style={styles.hint}>Enter the 6-digit code sent to {form.email}</Text>
            <TouchableOpacity
              style={[styles.button, otp.length !== 6 || isLoading ? styles.buttonDisabled : null]}
              disabled={otp.length !== 6 || isLoading}
              onPress={handleVerifyOtp}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Verifying..." : "Verify & Sign In"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setStep("form");
                setOtp("");
                setError("");
              }}
              style={styles.backButton}
            >
              <Text style={styles.backText}>Back to form</Text>
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
