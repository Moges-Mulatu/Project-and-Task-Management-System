import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../components/AppText";
import AppCard from "../components/AppCard";
import ScreenContainer from "../components/ScreenContainer";
import ProgressBar from "../components/ProgressBar";
import theme from "../theme";
import { api } from "../services/api";

const SearchScreen = ({ navigation, user }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all", "tasks", "projects"
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [tasksRes, projectsRes] = await Promise.all([
          api.getTasks(user?.role === "team_member" ? { assignedTo: user?.id } : {}),
          api.getProjects(),
        ]);
        setTasks(tasksRes.data || []);
        setProjects(projectsRes.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, [user]);

  // Filter results based on search query
  const filteredTasks = tasks.filter((task) =>
    task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = projects.filter((project) =>
    project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return theme.colors.brandGreen;
      case "in_progress":
      case "active":
        return theme.colors.brandBlue;
      case "review":
        return theme.colors.warning;
      case "blocked":
      case "on_hold":
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

  const renderTaskItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        Keyboard.dismiss();
        navigation.navigate("TaskDetail", { task: item });
      }}
      activeOpacity={0.8}
    >
      <AppCard
        accentColor={getStatusColor(item.status)}
        glowIntensity="low"
        style={styles.resultCard}
      >
        <View style={styles.resultHeader}>
          <View style={styles.resultTypeIcon}>
            <Ionicons name="checkbox-outline" size={16} color={theme.colors.brandBlue} />
          </View>
          <View style={styles.resultInfo}>
            <AppText style={styles.resultTitle} numberOfLines={1}>
              {item.title}
            </AppText>
            <View style={styles.resultMeta}>
              <View style={[styles.tag, { backgroundColor: getPriorityColor(item.priority) + "30" }]}>
                <AppText style={[styles.tagText, { color: getPriorityColor(item.priority) }]}>
                  {item.priority}
                </AppText>
              </View>
              <View style={[styles.tag, { backgroundColor: getStatusColor(item.status) + "30" }]}>
                <AppText style={[styles.tagText, { color: getStatusColor(item.status) }]}>
                  {item.status?.replace("_", " ")}
                </AppText>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
        </View>
        <View style={styles.progressRow}>
          <ProgressBar value={item.progress || 0} color={getStatusColor(item.status)} height={4} />
          <AppText style={styles.progressText}>{item.progress || 0}%</AppText>
        </View>
      </AppCard>
    </TouchableOpacity>
  );

  const renderProjectItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        Keyboard.dismiss();
        navigation.navigate("ProjectDetail", { project: item });
      }}
      activeOpacity={0.8}
    >
      <AppCard
        accentColor={getStatusColor(item.status)}
        glowIntensity="low"
        style={styles.resultCard}
      >
        <View style={styles.resultHeader}>
          <View style={[styles.resultTypeIcon, { backgroundColor: theme.colors.brandGreen + "25" }]}>
            <Ionicons name="folder" size={16} color={theme.colors.brandGreen} />
          </View>
          <View style={styles.resultInfo}>
            <AppText style={styles.resultTitle} numberOfLines={1}>
              {item.name}
            </AppText>
            <View style={styles.resultMeta}>
              <View style={[styles.tag, { backgroundColor: getStatusColor(item.status) + "30" }]}>
                <AppText style={[styles.tagText, { color: getStatusColor(item.status) }]}>
                  {item.status || "active"}
                </AppText>
              </View>
              {item.priority && (
                <View style={[styles.tag, { backgroundColor: getPriorityColor(item.priority) + "30" }]}>
                  <AppText style={[styles.tagText, { color: getPriorityColor(item.priority) }]}>
                    {item.priority}
                  </AppText>
                </View>
              )}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
        </View>
        {item.description && (
          <AppText style={styles.description} numberOfLines={2}>
            {item.description}
          </AppText>
        )}
      </AppCard>
    </TouchableOpacity>
  );

  // Combine results for "all" tab
  const getAllResults = () => {
    const results = [];
    
    filteredProjects.forEach((project) => {
      results.push({ ...project, _type: "project" });
    });
    
    filteredTasks.forEach((task) => {
      results.push({ ...task, _type: "task" });
    });
    
    return results;
  };

  const renderAllItem = ({ item }) => {
    if (item._type === "project") {
      return renderProjectItem({ item });
    }
    return renderTaskItem({ item });
  };

  const getDisplayData = () => {
    switch (activeTab) {
      case "tasks":
        return { data: filteredTasks, renderItem: renderTaskItem };
      case "projects":
        return { data: filteredProjects, renderItem: renderProjectItem };
      default:
        return { data: getAllResults(), renderItem: renderAllItem };
    }
  };

  const { data, renderItem } = getDisplayData();

  const totalResults = filteredTasks.length + filteredProjects.length;

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="h3" style={styles.headerTitle}>Search</AppText>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={theme.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks and projects..."
          placeholderTextColor={theme.colors.textMuted}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            setHasSearched(true);
          }}
          autoFocus
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "all" && styles.tabActive]}
          onPress={() => setActiveTab("all")}
        >
          <AppText style={[styles.tabText, activeTab === "all" && styles.tabTextActive]}>
            All ({totalResults})
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "tasks" && styles.tabActive]}
          onPress={() => setActiveTab("tasks")}
        >
          <Ionicons
            name="checkbox-outline"
            size={14}
            color={activeTab === "tasks" ? theme.colors.textPrimary : theme.colors.textMuted}
            style={{ marginRight: 4 }}
          />
          <AppText style={[styles.tabText, activeTab === "tasks" && styles.tabTextActive]}>
            Tasks ({filteredTasks.length})
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "projects" && styles.tabActive]}
          onPress={() => setActiveTab("projects")}
        >
          <Ionicons
            name="folder"
            size={14}
            color={activeTab === "projects" ? theme.colors.textPrimary : theme.colors.textMuted}
            style={{ marginRight: 4 }}
          />
          <AppText style={[styles.tabText, activeTab === "projects" && styles.tabTextActive]}>
            Projects ({filteredProjects.length})
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {searchQuery.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="search" size={48} color={theme.colors.textMuted} />
          </View>
          <AppText style={styles.emptyTitle}>Start Searching</AppText>
          <AppText style={styles.emptySubtitle}>
            Search for tasks by title, type, or status{"\n"}
            Search for projects by name or description
          </AppText>
          
          {/* Recent/Quick Access */}
          <View style={styles.quickAccess}>
            <AppText style={styles.quickAccessTitle}>Quick Filters</AppText>
            <View style={styles.quickFilters}>
              <TouchableOpacity
                style={styles.quickFilter}
                onPress={() => setSearchQuery("in_progress")}
              >
                <Ionicons name="time" size={14} color={theme.colors.brandBlue} />
                <AppText style={styles.quickFilterText}>In Progress</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickFilter}
                onPress={() => setSearchQuery("high")}
              >
                <Ionicons name="alert-circle" size={14} color={theme.colors.accentOrange} />
                <AppText style={styles.quickFilterText}>High Priority</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickFilter}
                onPress={() => setSearchQuery("completed")}
              >
                <Ionicons name="checkmark-circle" size={14} color={theme.colors.brandGreen} />
                <AppText style={styles.quickFilterText}>Completed</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickFilter}
                onPress={() => setSearchQuery("bug")}
              >
                <Ionicons name="bug" size={14} color={theme.colors.danger} />
                <AppText style={styles.quickFilterText}>Bugs</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : data.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color={theme.colors.textMuted} />
          <AppText style={styles.emptyTitle}>No Results</AppText>
          <AppText style={styles.emptySubtitle}>
            No {activeTab === "all" ? "items" : activeTab} found for "{searchQuery}"
          </AppText>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => `${item._type || "item"}-${item.id}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsList}
          ListFooterComponent={<View style={{ height: 100 }} />}
          keyboardShouldPersistTaps="handled"
        />
      )}
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.glassDark,
    borderRadius: 14,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.brandBlue + "50",
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 16,
    marginLeft: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  tabsContainer: {
    flexDirection: "row",
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tabActive: {
    backgroundColor: theme.colors.brandBlue + "30",
    borderColor: theme.colors.brandBlue,
  },
  tabText: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  tabTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: "500",
  },
  resultsList: {
    paddingTop: theme.spacing.sm,
  },
  resultCard: {
    marginVertical: 4,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  resultTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.brandBlue + "25",
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.sm,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontWeight: "600",
    fontSize: 15,
  },
  resultMeta: {
    flexDirection: "row",
    marginTop: 4,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  progressText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginLeft: theme.spacing.sm,
    minWidth: 35,
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: theme.spacing.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.glass,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    color: theme.colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  quickAccess: {
    marginTop: theme.spacing.xl,
    width: "100%",
  },
  quickAccessTitle: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  quickFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  quickFilter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    margin: 4,
  },
  quickFilterText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginLeft: 6,
  },
});

export default SearchScreen;
