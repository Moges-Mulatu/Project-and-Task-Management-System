import React from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AppText from "../components/AppText";
import theme from "../theme";
import { Formik } from "formik";
import * as Yup from "yup";

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const LoginScreen = ({ onLogin, navigation }) => {
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoGlow} />
          <View style={styles.logo}>
            <AppText style={styles.logoText}>D</AppText>
          </View>
        </View>

        <AppText variant="h1" style={styles.title}>
          Welcome Back
        </AppText>
        <AppText style={styles.subtitle}>Sign in to Debo Engineering</AppText>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={async (
            values,
            { setSubmitting, setStatus, setFieldError },
          ) => {
            setStatus("");
            try {
              await onLogin(values);
            } catch (err) {
              setStatus(err.message || "Login failed. Check credentials.");
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
              <View style={styles.inputContainer}>
                <AppText style={styles.label}>Email</AppText>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.colors.textMuted}
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                {touched.email && errors.email && (
                  <AppText style={styles.error}>{errors.email}</AppText>
                )}
              </View>

              <View style={styles.inputContainer}>
                <AppText style={styles.label}>Password</AppText>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.colors.textMuted}
                  value={values.password}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  secureTextEntry
                />
                {touched.password && errors.password && (
                  <AppText style={styles.error}>{errors.password}</AppText>
                )}
              </View>

              {status ? <AppText style={styles.error}>{status}</AppText> : null}

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <LinearGradient
                  colors={[theme.colors.brandBlue, theme.colors.brandGreen]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={theme.colors.textPrimary} />
                  ) : (
                    <AppText style={styles.loginButtonText}>Sign In</AppText>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.registerLink}
                onPress={() => navigation.navigate("Register")}
              >
                <AppText style={styles.registerText}>
                  Don't have an account?{" "}
                  <AppText style={styles.registerHighlight}>
                    Create Account
                  </AppText>
                </AppText>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  glowTop: {
    position: "absolute",
    top: -100,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: theme.colors.glowBlue,
    opacity: 0.2,
  },
  glowBottom: {
    position: "absolute",
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: theme.colors.glowGreen,
    opacity: 0.15,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: "center",
  },
  logoContainer: {
    alignSelf: "center",
    marginBottom: theme.spacing.xl,
  },
  logoGlow: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.colors.glowBlue,
    opacity: 0.5,
    top: -5,
    left: -5,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.brandBlue,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: theme.colors.glassBorder,
  },
  logoText: {
    fontSize: 36,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  title: {
    textAlign: "center",
    fontWeight: "700",
  },
  subtitle: {
    textAlign: "center",
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
  error: {
    color: theme.colors.danger,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  loginButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: theme.spacing.md,
    shadowColor: theme.colors.glowBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
  },
  loginButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  registerLink: {
    marginTop: theme.spacing.xl,
    alignItems: "center",
  },
  registerText: {
    color: theme.colors.textSecondary,
  },
  registerHighlight: {
    color: theme.colors.accentBlue,
    fontWeight: "600",
  },
});

export default LoginScreen;
