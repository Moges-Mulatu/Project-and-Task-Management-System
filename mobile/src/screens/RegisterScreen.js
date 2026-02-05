import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AppText from "../components/AppText";
import theme from "../theme";

const ROLES = [
  { id: "admin", label: "Admin" },
  { id: "project_manager", label: "Project Manager" },
  { id: "team_member", label: "Team Member" },
];

const RegisterScreen = ({ onRegister, navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("team_member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");
    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await onRegister({ firstName, lastName, email, password, role });
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.background, theme.colors.surface, theme.colors.background]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AppText variant="h1" style={styles.title}>
          Create Account
        </AppText>
        <AppText style={styles.subtitle}>Join Debo Engineering workspace</AppText>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: theme.spacing.sm }]}>
              <AppText style={styles.label}>First Name</AppText>
              <TextInput
                style={styles.input}
                placeholder="First"
                placeholderTextColor={theme.colors.textMuted}
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <AppText style={styles.label}>Last Name</AppText>
              <TextInput
                style={styles.input}
                placeholder="Last"
                placeholderTextColor={theme.colors.textMuted}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <AppText style={styles.label}>Email</AppText>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={theme.colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <AppText style={styles.label}>Password</AppText>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={theme.colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <AppText style={styles.label}>Role</AppText>
            <View style={styles.roleContainer}>
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.roleButton, role === r.id && styles.roleButtonActive]}
                  onPress={() => setRole(r.id)}
                >
                  <AppText
                    style={[styles.roleText, role === r.id && styles.roleTextActive]}
                  >
                    {r.label}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {error ? <AppText style={styles.error}>{error}</AppText> : null}

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={loading}
          >
            <LinearGradient
              colors={[theme.colors.brandGreen, theme.colors.brandBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.textPrimary} />
              ) : (
                <AppText style={styles.registerButtonText}>Create Account</AppText>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate("Login")}
          >
            <AppText style={styles.loginText}>Back to login</AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  glowTop: {
    position: "absolute",
    top: -50,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: theme.colors.glowGreen,
    opacity: 0.15,
  },
  glowBottom: {
    position: "absolute",
    bottom: -100,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: theme.colors.glowBlue,
    opacity: 0.2,
  },
  scrollContent: {
    padding: theme.spacing.xl,
    paddingTop: 60,
  },
  title: {
    fontWeight: "700",
  },
  subtitle: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  form: {
    backgroundColor: theme.colors.glass,
    borderRadius: 24,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  row: {
    flexDirection: "row",
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.glassDark,
    borderRadius: 14,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  roleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  roleButton: {
    backgroundColor: theme.colors.glassDark,
    borderRadius: 20,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  roleButtonActive: {
    backgroundColor: theme.colors.brandBlue,
    borderColor: theme.colors.brandBlue,
  },
  roleText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  roleTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
  error: {
    color: theme.colors.danger,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  registerButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: theme.spacing.md,
    shadowColor: theme.colors.glowGreen,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
  },
  registerButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  loginLink: {
    marginTop: theme.spacing.xl,
    alignItems: "center",
  },
  loginText: {
    color: theme.colors.textMuted,
  },
});

export default RegisterScreen;
