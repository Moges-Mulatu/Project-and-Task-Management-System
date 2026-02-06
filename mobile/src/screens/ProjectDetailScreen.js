import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import AppText from "../components/AppText";
import AppCard from "../components/AppCard";
import ScreenContainer from "../components/ScreenContainer";
import ProgressBar from "../components/ProgressBar";
import theme from "../theme";
import { api } from "../services/api";

const ProjectDetailScreen = ({ route, navigation, user }) => {
  const [project, setProject] = useState(route.params?.project || {});
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProjectTasks = useCallback(async () => {
    setLoading(true);
    try {
      // Backend now handles role-based filtering
      const tasksRes = await api.getTasks({ projectId: project.id });
      const taskList = tasksRes.data || [];
      setTasks(taskList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [project.id]);

  useFocusEffect(
    useCallback(() => {
      if (project.id) {
        loadProjectTasks();
      }
    }, [loadProjectTasks, project.id])
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return theme.colors.brandGreen;
      case "in_progress":
        return theme.colors.brandBlue;
      case "active":
        return theme.colors.brandGreen;
      default:
        return theme.colors.textMuted;
    }
  };

  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const progressPercent = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <AppText variant="h3" style={styles.headerTitle}>Project</AppText>
          <View style={{ width: 40 }} />
        </View>

        {/* Project Info Card */}
        <AppCard accentColor={theme.colors.brandBlue} glowIntensity="high">
          <View style={styles.projectHeader}>
            <View style={styles.projectIcon}>
              <Ionicons name="briefcase" size={28} color={theme.colors.textPrimary} />
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) }]}>
              <AppText style={styles.statusText}>{project.status}</AppText>
            </View>
          </View>

          <AppText variant="h2" style={styles.projectName}>
            {project.name}
          </AppText>
          <AppText style={styles.description}>
            {project.description || "No description provided"}
          </AppText>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <AppText style={styles.progressLabel}>Overall Progress</AppText>
              <AppText style={styles.progressValue}>{progressPercent}%</AppText>
            </View>
            <ProgressBar value={progressPercent} color={theme.colors.brandBlue} />
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={theme.colors.textMuted} />
              <AppText style={styles.metaText}>
                Start: {project.startDate ? new Date(project.startDate).toLocaleDateString() : "Not set"}
              </AppText>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="flag-outline" size={16} color={theme.colors.textMuted} />
              <AppText style={styles.metaText}>
                End: {project.endDate ? new Date(project.endDate).toLocaleDateString() : "Not set"}
              </AppText>
            </View>
          </View>
        </AppCard>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <AppText style={styles.statValue}>{tasks.length}</AppText>
            <AppText style={styles.statLabel}>Total Tasks</AppText>
          </View>
          <View style={styles.statCard}>
            <AppText style={[styles.statValue, { color: theme.colors.brandGreen }]}>{completedTasks}</AppText>
            <AppText style={styles.statLabel}>Completed</AppText>
          </View>
          <View style={styles.statCard}>
            <AppText style={[styles.statValue, { color: theme.colors.brandBlue }]}>
              {tasks.filter((t) => t.status === "in_progress").length}
            </AppText>
            <AppText style={styles.statLabel}>In Progress</AppText>
          </View>
        </View>

        {/* Tasks Section */}
        <View style={styles.sectionHeader}>
          <AppText variant="h3" style={styles.sectionTitle}>Tasks</AppText>
          {user?.role === "project_manager" && (
            <TouchableOpacity
              style={styles.addTaskButton}
              onPress={() => navigation.navigate("CreateTask", { projectId: project.id })}
            >
              <Ionicons name="add" size={20} color={theme.colors.brandBlue} />
              <AppText style={styles.addTaskText}>Add Task</AppText>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <ActivityIndicator color={theme.colors.brandBlue} style={{ marginTop: 20 }} />
        ) : tasks.length === 0 ? (
          <View style={styles.emptyTasks}>
            <Ionicons name="checkbox-outline" size={40} color={theme.colors.textMuted} />
            <AppText style={styles.emptyText}>No tasks yet</AppText>
          </View>
        ) : (
          tasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              onPress={() => navigation.navigate("TaskDetail", { task })}
            >
              <AppCard
                accentColor={getStatusColor(task.status)}
                glowIntensity="low"
                style={styles.taskCard}
              >
                <View style={styles.taskRow}>
                  <View style={[styles.taskStatus, { backgroundColor: getStatusColor(task.status) }]} />
                  <View style={styles.taskInfo}>
                    <AppText style={styles.taskTitle} numberOfLines={1}>
                      {task.title}
                    </AppText>
                    <View style={styles.taskMeta}>
                      <AppText style={styles.taskMetaText}>
                        {task.progress || 0}% • {task.status?.replace("_", " ")}
                      </AppText>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                </View>
              </AppCard>
            </TouchableOpacity>
          ))
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
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.glass,
    alignItems: "center",
    justifyContent: "center",
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  projectIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: theme.colors.brandBlue + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    textTransform: "capitalize",
  },
  projectName: {
    fontWeight: "700",
    marginBottom: theme.spacing.sm,
  },
  description: {
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  progressSection: {
    marginBottom: theme.spacing.md,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.xs,
  },
  progressLabel: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  progressValue: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
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
  statsRow: {
    flexDirection: "row",
    marginVertical: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.glass,
    borderRadius: 14,
    padding: theme.spacing.md,
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontWeight: "600",
  },
  addTaskButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.brandBlue + "20",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 10,
  },
  addTaskText: {
    color: theme.colors.brandBlue,
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 4,
  },
  taskCard: {
    marginVertical: 4,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontWeight: "500",
  },
  taskMeta: {
    marginTop: 2,
  },
  taskMetaText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    textTransform: "capitalize",
  },
  emptyTasks: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
});

export default ProjectDetailScreen;
