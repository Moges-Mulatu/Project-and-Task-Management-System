import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import AppText from "../components/AppText";
import theme from "../theme";

const CreateScreen = ({ navigation, user }) => {
  const createOptions = [
    {
      id: "task",
      icon: "checkbox-outline",
      title: "New Task",
      subtitle: "Create a task for your project",
      color: theme.colors.brandBlue,
      screen: "CreateTask",
      roles: ["admin", "project_manager"],
    },
    {
      id: "project",
      icon: "briefcase-outline",
      title: "New Project",
      subtitle: "Start a new project",
      color: theme.colors.brandGreen,
      screen: "CreateProject",
      roles: ["admin", "project_manager"],
    },
    {
      id: "team",
      icon: "people-outline",
      title: "New Team",
      subtitle: "Create a team to collaborate",
      color: theme.colors.accentPink,
      screen: "CreateTeam",
      roles: ["admin"],
    },
    {
      id: "report",
      icon: "analytics-outline",
      title: "New Report",
      subtitle: "Generate a project report",
      color: theme.colors.accentOrange,
      screen: "CreateReport",
      roles: ["admin", "project_manager"],
    },
  ];

  const filteredOptions = createOptions.filter(
    (opt) => opt.roles.includes(user?.role) || user?.role === "admin"
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.background, theme.colors.surface]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glowTop} />
      
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.title}>Create</AppText>
        <View style={{ width: 40 }} />
      </View>

      <AppText style={styles.subtitle}>What would you like to create?</AppText>

      <View style={styles.optionsGrid}>
        {filteredOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.optionCard}
            onPress={() => navigation.navigate(option.screen)}
            activeOpacity={0.8}
          >
            <View style={styles.optionGlow}>
              <View style={[styles.optionGlowInner, { backgroundColor: option.color }]} />
            </View>
            <BlurView intensity={20} tint="dark" style={styles.optionBlur}>
              <View style={styles.optionContent}>
                <View style={[styles.optionIcon, { backgroundColor: option.color + "30" }]}>
                  <Ionicons name={option.icon} size={28} color={option.color} />
                </View>
                <AppText style={styles.optionTitle}>{option.title}</AppText>
                <AppText style={styles.optionSubtitle}>{option.subtitle}</AppText>
              </View>
            </BlurView>
          </TouchableOpacity>
        ))}
      </View>

      {user?.role === "team_member" && (
        <View style={styles.limitedAccess}>
          <Ionicons name="information-circle-outline" size={20} color={theme.colors.textMuted} />
          <AppText style={styles.limitedText}>
            Team members can update task progress from the Tasks screen
          </AppText>
        </View>
      )}

      <View style={{ height: 100 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  glowTop: {
    position: "absolute",
    top: -100,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: theme.colors.glowBlue,
    opacity: 0.15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.glass,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontWeight: "700",
  },
  subtitle: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  optionCard: {
    width: "48%",
    marginBottom: theme.spacing.md,
    borderRadius: 20,
    overflow: "hidden",
  },
  optionGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    overflow: "hidden",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  optionGlowInner: {
    width: "100%",
    height: "100%",
    opacity: 0.15,
  },
  optionBlur: {
    borderRadius: 20,
    overflow: "hidden",
  },
  optionContent: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    borderRadius: 20,
    minHeight: 150,
  },
  optionIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  optionTitle: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 4,
  },
  optionSubtitle: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
  },
  limitedAccess: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.glass,
    padding: theme.spacing.md,
    borderRadius: 12,
    marginTop: theme.spacing.lg,
  },
  limitedText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
});

export default CreateScreen;
