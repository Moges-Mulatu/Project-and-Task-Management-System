import React from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Formik } from "formik";
import * as Yup from "yup";
import AppText from "../components/AppText";
import theme from "../theme";

// Note: Role selection removed - backend enforces team_member for public registration
// Only admins can later promote users to project_manager or admin roles

const RegisterSchema = Yup.object().shape({
  firstName: Yup.string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters")
    .matches(/^[a-zA-Z\s]+$/, "First name can only contain letters")
    .required("First name is required"),
  lastName: Yup.string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name cannot exceed 50 characters")
    .matches(/^[a-zA-Z\s]+$/, "Last name can only contain letters")
    .required("Last name is required"),
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .required("Password is required"),
});

const RegisterScreen = ({ onRegister, navigation }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          theme.colors.background,
          theme.colors.surface,
          theme.colors.background,
        ]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="h1" style={styles.title}>
          Create Account
        </AppText>
        <AppText style={styles.subtitle}>
          Join Debo Engineering workspace
        </AppText>

        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            email: "",
            password: "",
          }}
          validationSchema={RegisterSchema}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={async (values, { setSubmitting, setStatus }) => {
            setStatus("");
            try {
              await onRegister(values);
            } catch (err) {
              setStatus(err.message || "Registration failed.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            isSubmitting,
            status,
          }) => (
            <View style={styles.form}>
              <View style={styles.row}>
                <View
                  style={[
                    styles.inputContainer,
                    { flex: 1, marginRight: theme.spacing.sm },
                  ]}
                >
                  <AppText style={styles.label}>First Name</AppText>
                  <TextInput
                    style={styles.input}
                    placeholder="First"
                    placeholderTextColor={theme.colors.textMuted}
                    value={values.firstName}
                    onChangeText={handleChange("firstName")}
                    onBlur={handleBlur("firstName")}
                  />
                  {touched.firstName && errors.firstName && (
                    <AppText style={styles.fieldError}>
                      {errors.firstName}
                    </AppText>
                  )}
                </View>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <AppText style={styles.label}>Last Name</AppText>
                  <TextInput
                    style={styles.input}
                    placeholder="Last"
                    placeholderTextColor={theme.colors.textMuted}
                    value={values.lastName}
                    onChangeText={handleChange("lastName")}
                    onBlur={handleBlur("lastName")}
                  />
                  {touched.lastName && errors.lastName && (
                    <AppText style={styles.fieldError}>
                      {errors.lastName}
                    </AppText>
                  )}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <AppText style={styles.label}>Email</AppText>
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={theme.colors.textMuted}
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                {touched.email && errors.email && (
                  <AppText style={styles.fieldError}>{errors.email}</AppText>
                )}
              </View>

              <View style={styles.inputContainer}>
                <AppText style={styles.label}>Password</AppText>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={theme.colors.textMuted}
                  value={values.password}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  secureTextEntry
                />
                {touched.password && errors.password && (
                  <AppText style={styles.fieldError}>{errors.password}</AppText>
                )}
              </View>

              {/* Info about role assignment */}
              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={18} color={theme.colors.brandBlue} />
                <AppText style={styles.infoText}>
                  New accounts start as Team Members. Admins can promote users to other roles.
                </AppText>
              </View>

              {status ? <AppText style={styles.error}>{status}</AppText> : null}

              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <LinearGradient
                  colors={[theme.colors.brandGreen, theme.colors.brandBlue]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={theme.colors.textPrimary} />
                  ) : (
                    <AppText style={styles.registerButtonText}>
                      Create Account
                    </AppText>
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
          )}
        </Formik>
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
  fieldError: {
    color: theme.colors.danger,
    fontSize: 12,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.brandBlue + "15",
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.brandBlue + "30",
  },
  infoText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginLeft: theme.spacing.sm,
    flex: 1,
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
