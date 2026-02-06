import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
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

const ProjectsScreen = ({ navigation, user }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Backend now handles role-based filtering
      const response = await api.getProjects();
      const projectsList = response.data || [];
      setProjects(projectsList);
    } catch (err) {
      setError(err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, [loadProjects])
  );

  const handleDeleteProject = useCallback(async (project) => {
    Alert.alert(
      "Delete Project",
      `Are you sure you want to delete "${project.name}"? This will delete all associated tasks and cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.deleteProject(project.id);
              setProjects((prevProjects) =>
                prevProjects.filter((p) => p.id !== project.id)
              );
              Alert.alert("Success", "Project deleted successfully");
            } catch (err) {
              Alert.alert("Error", err.message || "Failed to delete project");
            }
          },
        },
      ]
    );
  }, []);

  const renderProject = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("ProjectDetail", { project: item })}
      activeOpacity={0.8}
    >
      <AppCard
        accentColor={index % 2 === 0 ? theme.colors.brandBlue : theme.colors.brandGreen}
        glowIntensity={item.priority === "high" ? "high" : "medium"}
      >
        <View style={styles.cardHeader}>
          <AppText variant="h3" style={styles.projectName}>
            {item.name}
          </AppText>
          <View style={styles.headerRight}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <AppText style={styles.statusText}>{item.status}</AppText>
            </View>
            {user?.role === "admin" && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleDeleteProject(item);
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
        <AppText style={styles.projectDesc} numberOfLines={2}>
          {item.description || "No description"}
        </AppText>
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <AppText style={styles.progressLabel}>Progress</AppText>
            <AppText style={styles.progressValue}>{item.progress || 0}%</AppText>
          </View>
          <ProgressBar
            value={item.progress || 0}
            color={index % 2 === 0 ? theme.colors.brandBlue : theme.colors.brandGreen}
          />
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.metaItem}>
            <Ionicons name="flag-outline" size={14} color={theme.colors.textMuted} />
            <AppText style={styles.metaText}>{item.priority || "medium"}</AppText>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.textMuted} />
            <AppText style={styles.metaText}>
              {item.endDate ? new Date(item.endDate).toLocaleDateString() : "No deadline"}
            </AppText>
          </View>
        </View>
      </AppCard>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return theme.colors.brandGreen;
      case "completed":
        return theme.colors.accentBlue;
      case "on_hold":
        return theme.colors.warning;
      default:
        return theme.colors.textMuted;
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppText variant="h2" style={styles.title}>Projects</AppText>
        {(user?.role === "admin" || user?.role === "project_manager") && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("CreateProject")}
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
          <TouchableOpacity style={styles.retryButton} onPress={loadProjects}>
            <AppText style={styles.retryText}>Retry</AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={projects}
          renderItem={renderProject}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="folder-open-outline" size={48} color={theme.colors.textMuted} />
              <AppText style={styles.emptyText}>No projects yet</AppText>
            </View>
          }
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
    alignItems: "center",
  },
  title: {
    fontWeight: "700",
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.sm,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  projectName: {
    fontWeight: "600",
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  deleteButton: {
    padding: theme.spacing.xs,
    borderRadius: 8,
    backgroundColor: theme.colors.danger + "20",
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    textTransform: "capitalize",
  },
  projectDesc: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  progressSection: {
    marginTop: theme.spacing.md,
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
    marginTop: theme.spacing.md,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: theme.spacing.lg,
  },
  metaText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginLeft: 4,
    textTransform: "capitalize",
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

export default ProjectsScreen;
