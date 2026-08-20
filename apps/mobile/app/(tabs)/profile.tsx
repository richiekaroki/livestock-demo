import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";

export default function ProfileScreen() {
  const { user, updateProfile, logout } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    county: user?.county || "",
    subCounty: user?.subCounty || "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await updateProfile(form);
      setMessage("Profile updated successfully");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const roleLabel = user.role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      {message ? (
        <Text style={styles.message}>{message}</Text>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          value={user.email}
          editable={false}
        />
        <Text style={styles.hint}>Email cannot be changed</Text>

        <Text style={styles.label}>Role</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          value={roleLabel}
          editable={false}
        />
        <Text style={styles.hint}>Role can only be changed by an admin</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={form.name}
          onChangeText={(t) => setForm({ ...form, name: t })}
          placeholder="Richard Karoki"
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

        <Text style={styles.label}>Sub-County</Text>
        <TextInput
          style={styles.input}
          value={form.subCounty}
          onChangeText={(t) => setForm({ ...form, subCounty: t })}
          placeholder="Optional"
        />

        <TouchableOpacity
          style={[styles.button, saving ? styles.buttonDisabled : null]}
          disabled={saving}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flexGrow: 1 },
  title: { fontSize: 24, fontWeight: "700", color: "#111827", marginBottom: 20 },
  card: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
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
    marginBottom: 4,
  },
  inputDisabled: { color: "#9ca3af" },
  hint: { color: "#9ca3af", fontSize: 12, marginBottom: 16 },
  button: {
    backgroundColor: "#16a34a",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  logoutButton: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: { color: "#dc2626", fontWeight: "600", fontSize: 16 },
  message: {
    color: "#16a34a",
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
  },
});