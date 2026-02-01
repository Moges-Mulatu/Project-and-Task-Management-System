import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../components/AppText";
import AppCard from "../components/AppCard";
import ScreenContainer from "../components/ScreenContainer";
import ProgressBar from "../components/ProgressBar";
import theme from "../theme";
import { api } from "../services/api";

const TaskDetailScreen = ({ route, navigation, user }) => {
  const [task, setTask] = useState(route.params?.task || {});
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return theme.colors.brandGreen;
      case "in_progress":
        return theme.colors.brandBlue;
      case "review":
        return theme.colors.warning;
      case "blocked":
        return theme.colors.danger;
      default:
        return theme.colors.textMuted;
    }
  };

  const handleUpdateProgress = async (newProgress) => {
    setLoading(true);
    try {
      await api.updateTask(task.id, { progress: newProgress });
      setTask({ ...task, progress: newProgress });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setLoading(true);
    try {
      await api.updateTask(task.id, { status: newStatus });
      setTask({ ...task, status: newStatus });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const progressOptions = [0, 25, 50, 75, 100];
  const statusOptions = [
    { id: "pending", label: "Pending", icon: "time-outline" },
    { id: "in_progress", label: "In Progress", icon: "play-outline" },
    { id: "review", label: "Review", icon: "eye-outline" },
    { id: "completed", label: "Completed", icon: "checkmark-circle-outline" },
  ];

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <AppText variant="h3" style={styles.headerTitle}>Task Details</AppText>
          <View style={{ width: 40 }} />
        </View>

        <AppCard accentColor={getStatusColor(task.status)} glowIntensity="high">
          <AppText variant="h2" style={styles.taskTitle}>
            {task.title}
          </AppText>

          <View style={styles.tagsRow}>
            <View style={[styles.tag, { backgroundColor: getStatusColor(task.status) + "30" }]}>
              <Ionicons name="pulse-outline" size={14} color={getStatusColor(task.status)} />
              <AppText style={[styles.tagText, { color: getStatusColor(task.status) }]}>
                {task.status?.replace("_", " ")}
              </AppText>
            </View>
            <View style={[styles.tag, { backgroundColor: theme.colors.glass }]}>
              <Ionicons name="flag-outline" size={14} color={theme.colors.textSecondary} />
              <AppText style={styles.tagText}>{task.priority}</AppText>
            </View>
          </View>

          <AppText style={styles.description}>
            {task.description || "No description provided"}
          </AppText>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.textMuted} />
              <AppText style={styles.metaText}>
                Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set"}
              </AppText>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={theme.colors.textMuted} />
              <AppText style={styles.metaText}>
                {task.estimatedHours ? `${task.estimatedHours}h estimated` : "No estimate"}
              </AppText>
            </View>
          </View>
        </AppCard>

        {/* Progress Section */}
        <AppCard accentColor={theme.colors.brandBlue}>
          <AppText variant="h3" style={styles.sectionTitle}>Progress</AppText>
          <View style={styles.progressDisplay}>
            <AppText style={styles.progressPercent}>{task.progress || 0}%</AppText>
            <ProgressBar value={task.progress || 0} color={theme.colors.brandBlue} />
          </View>

          {(user?.role === "team_member" || user?.role === "admin" || user?.role === "project_manager") && (
            <View style={styles.progressButtons}>
              {progressOptions.map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.progressButton,
                    task.progress === val && styles.progressButtonActive,
                  ]}
                  onPress={() => handleUpdateProgress(val)}
                  disabled={loading}
                >
                  <AppText
                    style={[
                      styles.progressButtonText,
                      task.progress === val && styles.progressButtonTextActive,
                    ]}
                  >
                    {val}%
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </AppCard>

        {/* Status Section */}
        <AppCard accentColor={theme.colors.brandGreen}>
          <AppText variant="h3" style={styles.sectionTitle}>Status</AppText>
          <View style={styles.statusGrid}>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.statusOption,
                  task.status === option.id && styles.statusOptionActive,
                ]}
                onPress={() => handleUpdateStatus(option.id)}
                disabled={loading}
              >
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={task.status === option.id ? theme.colors.textPrimary : theme.colors.textMuted}
                />
                <AppText
                  style={[
                    styles.statusOptionText,
                    task.status === option.id && styles.statusOptionTextActive,
                  ]}
                >
                  {option.label}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </AppCard>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={theme.colors.brandBlue} />
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.glass,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontWeight: "600",
  },
  taskTitle: {
    fontWeight: "700",
    marginBottom: theme.spacing.md,
  },
  tagsRow: {
    flexDirection: "row",
    marginBottom: theme.spacing.md,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: theme.spacing.sm,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
    color: theme.colors.textSecondary,
    marginLeft: 4,
    textTransform: "capitalize",
  },
  description: {
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginLeft: 6,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: theme.spacing.md,
  },
  progressDisplay: {
    marginBottom: theme.spacing.md,
  },
  progressPercent: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.brandBlue,
    marginBottom: theme.spacing.sm,
  },
  progressButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    marginHorizontal: 4,
    borderRadius: 10,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  progressButtonActive: {
    backgroundColor: theme.colors.brandBlue,
    borderColor: theme.colors.brandBlue,
  },
  progressButtonText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  progressButtonTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  statusOption: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    margin: "1%",
    borderRadius: 12,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statusOptionActive: {
    backgroundColor: theme.colors.brandGreen,
    borderColor: theme.colors.brandGreen,
  },
  statusOptionText: {
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    fontSize: 13,
  },
  statusOptionTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
  loadingOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -15,
    marginTop: -15,
  },
});

export default TaskDetailScreen;
