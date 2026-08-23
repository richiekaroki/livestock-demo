import React, { useState } from "react";
import {
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text, View, useColors } from "@/components/Themed";
import { useAuth } from "@/src/contexts/AuthContext";
import { spacing, radius, fontSize, fontWeight, shadows } from "@/constants/Tokens";
import { impactMedium, notificationSuccess, impactLight } from "@/src/services/haptics";
import { useToast } from "@/src/components/Toast";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DarkModeToggle } from "@/src/components/DarkModeToggle";
import { KALROSyncButton } from "@/src/components/KALROSync";
import { useI18n } from "@/src/i18n";

export default function ProfileScreen() {
  const { user, updateProfile, logout } = useAuth();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showToast } = useToast();
  const { lang, setLang, t } = useI18n();
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
    impactMedium();
    setSaving(true);
    setMessage("");
    try {
      await updateProfile(form);
      notificationSuccess();
      showToast('success', 'Profile updated successfully');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    impactLight();
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

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.inputBg,
      borderColor: colors.inputBorder,
      color: colors.text,
    },
  ];

  const disabledInputStyle = [
    inputStyle,
    { color: colors.textSecondary, opacity: 0.7 },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={88}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
      <View style={styles.headerRow}>
        <View style={[styles.avatar, { backgroundColor: colors.tintLight }]}>
          <Ionicons name="person-outline" size={28} color={colors.tint} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>My Profile</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Manage your account
          </Text>
        </View>
        <DarkModeToggle />
      </View>

      {message ? (
        <View style={[styles.messageWrap, { backgroundColor: colors.tintLight }]}>
          <Ionicons
            name={message.includes("failed") || message.includes("Update") ? "alert-circle-outline" : "checkmark-circle-outline"}
            size={18}
            color={message.includes("failed") || message.includes("Update") ? colors.destructive : colors.tint}
          />
          <Text style={[styles.message, { color: colors.tint }]}>{message}</Text>
        </View>
      ) : null}

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
        <TextInput
          style={disabledInputStyle}
          value={user.email}
          editable={false}
        />
        <Text style={[styles.hint, { color: colors.textSecondary }]}>Email cannot be changed</Text>

        <Text style={[styles.label, { color: colors.text }]}>Role</Text>
        <TextInput
          style={disabledInputStyle}
          value={roleLabel}
          editable={false}
        />
        <Text style={[styles.hint, { color: colors.textSecondary }]}>Role can only be changed by an admin</Text>

        <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
        <TextInput
          style={inputStyle}
          value={form.name}
          onChangeText={(t) => setForm({ ...form, name: t })}
          placeholder="Richard Karoki"
          placeholderTextColor={colors.placeholder}
        />

        <Text style={[styles.label, { color: colors.text }]}>Phone</Text>
        <TextInput
          style={inputStyle}
          value={form.phone}
          onChangeText={(t) => setForm({ ...form, phone: t })}
          placeholder="+254700000000"
          placeholderTextColor={colors.placeholder}
          keyboardType="phone-pad"
        />

        <Text style={[styles.label, { color: colors.text }]}>County</Text>
        <TextInput
          style={inputStyle}
          value={form.county}
          onChangeText={(t) => setForm({ ...form, county: t })}
          placeholder="Nairobi"
          placeholderTextColor={colors.placeholder}
        />

        <Text style={[styles.label, { color: colors.text }]}>Sub-County</Text>
        <TextInput
          style={inputStyle}
          value={form.subCounty}
          onChangeText={(t) => setForm({ ...form, subCounty: t })}
          placeholder="Optional"
          placeholderTextColor={colors.placeholder}
        />

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.tint },
            saving && styles.buttonDisabled,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          disabled={saving}
          onPress={handleSave}
          accessibilityLabel="Save profile changes"
        >
          <Ionicons name="save-outline" size={18} color="#fff" />
          <Text style={styles.buttonText}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          { backgroundColor: colors.destructiveLight, borderColor: colors.destructive },
          { opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={handleLogout}
        accessibilityLabel="Sign out"
      >
        <Ionicons name="log-out-outline" size={20} color={colors.destructive} />
        <Text style={[styles.logoutText, { color: colors.destructive }]}>{t('signOut')}</Text>
      </Pressable>

      {/* Language Toggle */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, marginTop: spacing.lg }]}>
        <Text style={[styles.label, { color: colors.text }]}>Language</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
          <Pressable
            onPress={() => { impactLight(); setLang('en'); }}
            style={({ pressed }) => [styles.langBtn, {
              backgroundColor: lang === 'en' ? colors.tint : colors.card,
              borderColor: lang === 'en' ? colors.tint : colors.borderLight,
              opacity: pressed ? 0.85 : 1,
            }]}
            accessibilityLabel="Switch to English"
          >
            <Text style={[styles.langText, { color: lang === 'en' ? '#fff' : colors.text }]}>English</Text>
          </Pressable>
          <Pressable
            onPress={() => { impactLight(); setLang('sw'); }}
            style={({ pressed }) => [styles.langBtn, {
              backgroundColor: lang === 'sw' ? colors.tint : colors.card,
              borderColor: lang === 'sw' ? colors.tint : colors.borderLight,
              opacity: pressed ? 0.85 : 1,
            }]}
            accessibilityLabel="Switch to Kiswahili"
          >
            <Text style={[styles.langText, { color: lang === 'sw' ? '#fff' : colors.text }]}>Kiswahili</Text>
          </Pressable>
        </View>
      </View>

      {/* KALRO Sync */}
      <View style={{ marginTop: spacing.lg }}>
        <KALROSyncButton />
      </View>

      {/* Admin Section */}
      {user.role === 'admin' && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, marginTop: spacing.lg }]}>
          <Text style={[styles.label, { color: colors.text }]}>Admin</Text>
          <Pressable
            onPress={() => { impactLight(); router.push({ pathname: '/admin/users' } as any); }}
            style={({ pressed }) => [styles.adminRow, { opacity: pressed ? 0.7 : 1, borderBottomColor: colors.border }]}
            accessibilityLabel="Open user management"
          >
            <Ionicons name="people-outline" size={18} color={colors.tint} />
            <Text style={[styles.adminText, { color: colors.text }]}>User Management</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </Pressable>
          <Pressable
            onPress={() => { impactLight(); router.push({ pathname: '/admin/audit-logs' } as any); }}
            style={({ pressed }) => [styles.adminRow, { opacity: pressed ? 0.7 : 1 }]}
            accessibilityLabel="Open audit log"
          >
            <Ionicons name="document-text-outline" size={18} color={colors.tint} />
            <Text style={[styles.adminText, { color: colors.text }]}>Audit Log</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </Pressable>
        </View>
      )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: spacing.lg, flexGrow: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.xxl,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold },
  subtitle: { fontSize: fontSize.sm, marginTop: 2 },
  card: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    marginBottom: spacing.xs,
  },
  hint: { fontSize: fontSize.xs, marginBottom: spacing.lg },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    marginTop: spacing.md,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: fontWeight.semibold, fontSize: fontSize.base },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
  },
  logoutText: { fontWeight: fontWeight.semibold, fontSize: fontSize.base },
  messageWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  message: { fontSize: fontSize.sm, flex: 1 },
  langBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  langText: { fontWeight: fontWeight.semibold, fontSize: fontSize.base },
  adminRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.md, borderBottomWidth: 1,
  },
  adminText: { flex: 1, fontSize: fontSize.base, fontWeight: fontWeight.medium },
});
