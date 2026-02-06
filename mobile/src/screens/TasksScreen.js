import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import AppText from "../components/AppText";
import AppCard from "../components/AppCard";
import ScreenContainer from "../components/ScreenContainer";
import ProgressBar from "../components/ProgressBar";
import theme from "../theme";
import { api } from "../services/api";

const TasksScreen = ({ navigation, user }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [collapsedSections, setCollapsedSections] = useState({});
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Load tasks and projects in parallel
      // Backend now handles role-based filtering
      const [tasksRes, projectsRes] = await Promise.all([
        api.getTasks(),
        api.getProjects().catch(() => ({ data: [] })),
      ]);

      const tasks = tasksRes.data || [];
      const projects = projectsRes.data || [];

      // Create a map of projects by ID
      const projectMap = {};
      projects.forEach((project) => {
        projectMap[project.id] = project;
      });

      // Group tasks by projectId
      const groupedTasks = {};
      const unassignedTasks = [];

      tasks.forEach((task) => {
        if (task.projectId && projectMap[task.projectId]) {
          if (!groupedTasks[task.projectId]) {
            groupedTasks[task.projectId] = {
              project: projectMap[task.projectId],
              tasks: [],
            };
          }
          groupedTasks[task.projectId].tasks.push(task);
        } else {
          unassignedTasks.push(task);
        }
      });

      // Convert to sections format
      const sectionsData = [];

      // Add project sections
      Object.values(groupedTasks).forEach((group) => {
        sectionsData.push({
          id: group.project.id,
          title: group.project.name,
          project: group.project,
          data: group.tasks,
          taskCount: group.tasks.length,
        });
      });

      // Sort sections by project name
      sectionsData.sort((a, b) => a.title.localeCompare(b.title));

      // Add unassigned tasks section at the end if there are any
      if (unassignedTasks.length > 0) {
        sectionsData.push({
          id: "unassigned",
          title: "Unassigned Tasks",
          project: null,
          data: unassignedTasks,
          taskCount: unassignedTasks.length,
        });
      }

      setSections(sectionsData);
    } catch (err) {
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks]),
  );

  const handleDeleteTask = (task) => {
    Alert.alert(
      "Delete Task",
      `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.deleteTask(task.id);
              // Remove task from sections locally
              setSections((prevSections) =>
                prevSections
                  .map((section) => ({
                    ...section,
                    data: section.data.filter((t) => t.id !== task.id),
                    taskCount: section.data.filter((t) => t.id !== task.id)
                      .length,
                  }))
                  .filter((section) => section.data.length > 0),
              );
              setSelectedTaskId(null);
            } catch (err) {
              Alert.alert("Error", err.message || "Failed to delete task");
            }
          },
        },
      ],
    );
  };

  const toggleSection = (sectionId) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return theme.colors.danger;
      case "high":
        return theme.colors.accentOrange;
      case "medium":
        return theme.colors.warning;
      default:
        return theme.colors.textMuted;
    }
  };

  const getProjectStatusColor = (status) => {
    switch (status) {
      case "completed":
        return theme.colors.brandGreen;
      case "active":
      case "in_progress":
        return theme.colors.brandBlue;
      case "on_hold":
        return theme.colors.warning;
      default:
        return theme.colors.textMuted;
    }
  };

  const renderSectionHeader = ({ section }) => {
    const isCollapsed = collapsedSections[section.id];
    const completedTasks = section.data.filter(
      (t) => t.status === "completed",
    ).length;
    const progress =
      section.taskCount > 0
        ? Math.round((completedTasks / section.taskCount) * 100)
        : 0;

    return (
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection(section.id)}
        activeOpacity={0.7}
      >
        <View style={styles.sectionHeaderLeft}>
          <View
            style={[
              styles.projectIcon,
              {
                backgroundColor: section.project
                  ? getProjectStatusColor(section.project.status) + "25"
                  : theme.colors.glass,
              },
            ]}
          >
            <Ionicons
              name={section.project ? "folder" : "documents-outline"}
              size={18}
              color={
                section.project
                  ? getProjectStatusColor(section.project.status)
                  : theme.colors.textMuted
              }
            />
          </View>
          <View style={styles.sectionTitleContainer}>
            <AppText variant="h3" style={styles.sectionTitle} numberOfLines={1}>
              {section.title}
            </AppText>
            <View style={styles.sectionMeta}>
              <AppText style={styles.taskCountText}>
                {section.taskCount} task{section.taskCount !== 1 ? "s" : ""}
              </AppText>
              <View style={styles.sectionProgressContainer}>
                <View style={styles.sectionProgressBar}>
                  <View
                    style={[
                      styles.sectionProgressFill,
                      {
                        width: `${progress}%`,
                        backgroundColor: theme.colors.brandGreen,
                      },
                    ]}
                  />
                </View>
                <AppText style={styles.sectionProgressText}>
                  {progress}%
                </AppText>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.sectionHeaderRight}>
          {section.project && (
            <TouchableOpacity
              style={styles.viewProjectButton}
              onPress={(e) => {
                e.stopPropagation();
                navigation.navigate("ProjectDetail", {
                  project: section.project,
                });
              }}
            >
              <Ionicons
                name="open-outline"
                size={16}
                color={theme.colors.brandBlue}
              />
            </TouchableOpacity>
          )}
          <Ionicons
            name={isCollapsed ? "chevron-down" : "chevron-up"}
            size={20}
            color={theme.colors.textMuted}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderTask = ({ item, section }) => {
    if (collapsedSections[section.id]) {
      return null;
    }

    const canDelete =
      user?.role === "admin" ||
      user?.role === "project_manager" ||
      item.assignedBy === user?.id;
    const isSelected = selectedTaskId === item.id;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("TaskDetail", { task: item })}
        onLongPress={() => canDelete && setSelectedTaskId(item.id)}
        activeOpacity={0.8}
        style={styles.taskItemContainer}
      >
        <AppCard
          accentColor={getStatusColor(item.status)}
          glowIntensity={
            item.priority === "critical" || item.priority === "high"
              ? "high"
              : "low"
          }
          style={styles.taskCard}
        >
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            />
            <AppText variant="h3" style={styles.taskTitle} numberOfLines={2}>
              {item.title}
            </AppText>
          </View>

          <View style={styles.tagsRow}>
            <View
              style={[
                styles.tag,
                { backgroundColor: getPriorityColor(item.priority) + "30" },
              ]}
            >
              <AppText
                style={[
                  styles.tagText,
                  { color: getPriorityColor(item.priority) },
                ]}
              >
                {item.priority}
              </AppText>
            </View>
            <View style={[styles.tag, { backgroundColor: theme.colors.glass }]}>
              <AppText style={styles.tagText}>{item.type || "task"}</AppText>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <AppText style={styles.progressLabel}>Progress</AppText>
              <AppText style={styles.progressValue}>
                {item.progress || 0}%
              </AppText>
            </View>
            <ProgressBar
              value={item.progress || 0}
              color={getStatusColor(item.status)}
            />
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.metaItem}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={theme.colors.textMuted}
              />
              <AppText style={styles.metaText}>
                {item.dueDate
                  ? new Date(item.dueDate).toLocaleDateString()
                  : "No due date"}
              </AppText>
            </View>
            <View style={styles.cardFooterRight}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) + "30" },
                ]}
              >
                <AppText
                  style={[
                    styles.statusBadgeText,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  {item.status?.replace("_", " ")}
                </AppText>
              </View>
              {canDelete && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDeleteTask(item);
                  }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={theme.colors.danger}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </AppCard>
      </TouchableOpacity>
    );
  };

  const totalTasks = sections.reduce(
    (sum, section) => sum + section.taskCount,
    0,
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View>
          <AppText variant="h2" style={styles.title}>
            Tasks
          </AppText>
          <AppText style={styles.subtitle}>
            {totalTasks} task{totalTasks !== 1 ? "s" : ""} across{" "}
            {sections.length} project{sections.length !== 1 ? "s" : ""}
          </AppText>
        </View>
        {(user?.role === "admin" || user?.role === "project_manager") && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("CreateTask")}
          >
            <Ionicons name="add" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.brandBlue} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <AppText style={styles.error}>{error}</AppText>
          <TouchableOpacity style={styles.retryButton} onPress={loadTasks}>
            <AppText style={styles.retryText}>Retry</AppText>
          </TouchableOpacity>
        </View>
      ) : sections.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons
            name="checkbox-outline"
            size={48}
            color={theme.colors.textMuted}
          />
          <AppText style={styles.emptyText}>No tasks assigned</AppText>
        </View>
      ) : (
        <SectionList
          sections={sections}
          renderItem={renderTask}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontWeight: "700",
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.brandBlue,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.glowBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  list: {
    paddingBottom: theme.spacing.xl,
  },
  // Section header styles
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.glassDark,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: 14,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  projectIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.sm,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontWeight: "600",
    fontSize: 15,
  },
  sectionMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  taskCountText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginRight: theme.spacing.md,
  },
  sectionProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sectionProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.glass,
    borderRadius: 2,
    maxWidth: 80,
  },
  sectionProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  sectionProgressText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginLeft: 6,
  },
  sectionHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewProjectButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.brandBlue + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.sm,
  },
  // Task item styles
  taskItemContainer: {
    marginLeft: theme.spacing.md,
  },
  taskCard: {
    marginVertical: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: theme.spacing.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: theme.spacing.sm,
    marginTop: 6,
  },
  taskTitle: {
    fontWeight: "600",
    flex: 1,
  },
  tagsRow: {
    flexDirection: "row",
    marginBottom: theme.spacing.md,
  },
  tag: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: theme.spacing.sm,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "500",
    color: theme.colors.textSecondary,
    textTransform: "capitalize",
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
    fontSize: 12,
  },
  progressValue: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  cardFooterRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.danger + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    color: theme.colors.danger,
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: theme.colors.glass,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: 12,
  },
  retryText: {
    color: theme.colors.accentBlue,
  },
  empty: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
  },
});

export default TasksScreen;
