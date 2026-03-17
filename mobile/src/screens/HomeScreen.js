import React, { useCallback, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import AppText from "../components/AppText";
import AppCard from "../components/AppCard";
import ScreenContainer from "../components/ScreenContainer";
import ProgressBar from "../components/ProgressBar";
import theme from "../theme";
import { api } from "../services/api";

const HomeScreen = ({ navigation, user }) => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDay, setSelectedDay] = useState(0);

  const loadHome = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Backend now handles role-based filtering
      const [projectResponse, taskResponse] = await Promise.all([
        api.getProjects(),
        api.getTasks(),
      ]);

      const projectList = projectResponse.data || [];
      const taskList = taskResponse.data || [];

      setProjects(projectList);
      setTasks(taskList);
    } catch (err) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadHome();
      }
    }, [loadHome, user]),
  );

  // Generate week days starting from today
  const weekDays = useMemo(() => {
    const days = [];
    const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        dayName: dayNames[date.getDay()],
        date: date.getDate(),
        fullDate: date.toISOString().split("T")[0],
        isToday: i === 0,
      });
    }
    return days;
  }, []);

  // Filter tasks for selected day
  const tasksForSelectedDay = useMemo(() => {
    const selectedDate = weekDays[selectedDay]?.fullDate;
    return tasks.filter((task) => {
      if (!task.dueDate) return selectedDay === 0; // Show tasks without due date on "today"
      const taskDate = task.dueDate.split("T")[0];
      return taskDate === selectedDate;
    });
  }, [tasks, selectedDay, weekDays]);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return theme.colors.brandGreen;
      case "in_progress":
        return theme.colors.brandBlue;
      case "review":
        return theme.colors.warning;
      default:
        return theme.colors.textMuted;
    }
  };

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarGlow} />
              <View style={styles.avatar}>
                <AppText style={styles.avatarText}>
                  {user?.firstName?.[0] || "U"}
                </AppText>
              </View>
            </View>
            <View style={styles.greeting}>
              <AppText style={styles.greetingText}>Good Day 👋</AppText>
              <AppText variant="h2" style={styles.userName}>
                {user?.firstName || "User"} {user?.lastName?.[0] || ""}.
              </AppText>
            </View>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <Ionicons
              name="settings-outline"
              size={22}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate("Search")}
        >
          <Ionicons name="search" size={18} color={theme.colors.textMuted} />
          <AppText style={styles.searchText}>
            Search tasks and projects...
          </AppText>
        </TouchableOpacity>

        {/* Projects Section */}
        <View style={styles.sectionHeader}>
          <AppText variant="h3" style={styles.sectionTitle}>
            Project
          </AppText>
          <TouchableOpacity onPress={() => navigation.navigate("Projects")}>
            <AppText style={styles.seeAll}>See All</AppText>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={theme.colors.accentBlue} />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.projectsScroll}
          >
            {projects.slice(0, 3).map((project, index) => (
              <TouchableOpacity
                key={project.id}
                onPress={() =>
                  navigation.navigate("ProjectDetail", { project })
                }
              >
                <AppCard
                  accentColor={
                    index % 2 === 0
                      ? theme.colors.brandBlue
                      : theme.colors.brandGreen
                  }
                  style={styles.projectCard}
                  glowIntensity="high"
                >
                  <AppText
                    variant="h3"
                    style={styles.projectTitle}
                    numberOfLines={2}
                  >
                    {project.name}
                  </AppText>
                  <View style={styles.projectMeta}>
                    <View style={styles.avatarStack}>
                      {[0, 1, 2].map((i) => (
                        <View
                          key={i}
                          style={[
                            styles.miniAvatar,
                            { marginLeft: i > 0 ? -8 : 0 },
                          ]}
                        >
                          <AppText style={styles.miniAvatarText}>
                            {String.fromCharCode(65 + i)}
                          </AppText>
                        </View>
                      ))}
                    </View>
                    <View style={styles.projectStats}>
                      <Ionicons
                        name="time-outline"
                        size={12}
                        color={theme.colors.textMuted}
                      />
                      <AppText style={styles.statText}>
                        {project.progress || 0}%
                      </AppText>
                    </View>
                  </View>
                  <View style={styles.taskCount}>
                    <Ionicons
                      name="checkbox-outline"
                      size={12}
                      color={theme.colors.textMuted}
                    />
                    <AppText style={styles.taskCountText}>
                      {tasks.filter((t) => t.projectId === project.id).length}{" "}
                      Tasks
                    </AppText>
                  </View>
                </AppCard>
              </TouchableOpacity>
            ))}
            {projects.length === 0 && (
              <AppText style={styles.emptyText}>No projects yet</AppText>
            )}
          </ScrollView>
        )}

        {/* Progress Section - Functional Calendar */}
        <View style={styles.sectionHeader}>
          <AppText variant="h3" style={styles.sectionTitle}>
            Progress
          </AppText>
          <TouchableOpacity onPress={() => navigation.navigate("Tasks")}>
            <AppText style={styles.seeAll}>All Stats</AppText>
          </TouchableOpacity>
        </View>

        <AppCard accentColor={theme.colors.brandBlue} glowIntensity="medium">
          <AppText variant="h3" style={styles.progressTitle}>
            Create and Check{"\n"}Daily Task
          </AppText>
          <AppText style={styles.progressSubtitle}>
            Tap a day to see tasks due on that date
          </AppText>

          {/* Functional Calendar Strip */}
          <View style={styles.calendarStrip}>
            {weekDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  selectedDay === index && styles.calendarDayActive,
                ]}
                onPress={() => setSelectedDay(index)}
              >
                <AppText
                  style={[
                    styles.dayText,
                    selectedDay === index && styles.dayTextActive,
                  ]}
                >
                  {day.dayName}
                </AppText>
                <AppText
                  style={[
                    styles.dateText,
                    selectedDay === index && styles.dateTextActive,
                  ]}
                >
                  {day.date}
                </AppText>
                {day.isToday && selectedDay !== index && (
                  <View style={styles.todayDot} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Tasks for Selected Day */}
          <View style={styles.dayTasksContainer}>
            <AppText style={styles.dayTasksTitle}>
              {weekDays[selectedDay]?.isToday
                ? "Today's Tasks"
                : `Tasks for ${weekDays[selectedDay]?.dayName}`}{" "}
              ({tasksForSelectedDay.length})
            </AppText>

            {tasksForSelectedDay.length === 0 ? (
              <View style={styles.noTasks}>
                <Ionicons
                  name="calendar-outline"
                  size={24}
                  color={theme.colors.textMuted}
                />
                <AppText style={styles.noTasksText}>No tasks scheduled</AppText>
              </View>
            ) : (
              tasksForSelectedDay.slice(0, 3).map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={styles.dayTaskItem}
                  onPress={() => navigation.navigate("TaskDetail", { task })}
                >
                  <View
                    style={[
                      styles.taskIndicator,
                      { backgroundColor: getStatusColor(task.status) },
                    ]}
                  />
                  <View style={styles.taskInfo}>
                    <AppText style={styles.taskItemTitle} numberOfLines={1}>
                      {task.title}
                    </AppText>
                    <AppText style={styles.taskItemMeta}>
                      {task.progress || 0}% • {task.status?.replace("_", " ")}
                    </AppText>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={theme.colors.textMuted}
                  />
                </TouchableOpacity>
              ))
            )}

            {tasksForSelectedDay.length > 3 && (
              <TouchableOpacity
                style={styles.viewMoreButton}
                onPress={() => navigation.navigate("Tasks")}
              >
                <AppText style={styles.viewMoreText}>
                  +{tasksForSelectedDay.length - 3} more tasks
                </AppText>
              </TouchableOpacity>
            )}
          </View>

          {/* Team Avatars */}
          <View style={styles.teamAvatars}>
            {[0, 1, 2, 3, 4].map((i) => (
              <View
                key={i}
                style={[
                  styles.teamAvatar,
                  {
                    marginLeft: i > 0 ? -10 : 0,
                    backgroundColor:
                      i % 2 === 0
                        ? theme.colors.brandBlue
                        : theme.colors.brandGreen,
                  },
                ]}
              >
                <AppText style={styles.teamAvatarText}>
                  {String.fromCharCode(65 + i)}
                </AppText>
              </View>
            ))}
          </View>
        </AppCard>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <AppText variant="h3" style={styles.sectionTitle}>
            Quick Actions
          </AppText>
        </View>

        <View style={styles.quickActionsGrid}>
          {/* PM Only: Create Task & Project */}
          {user?.role === "project_manager" && (
            <>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate("CreateTask")}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.actionGlowLine,
                    { backgroundColor: theme.colors.brandBlue },
                  ]}
                />
                <View
                  style={[
                    styles.actionGlowEffect,
                    { shadowColor: theme.colors.brandBlue },
                  ]}
                />
                <View style={styles.actionCardContent}>
                  <View
                    style={[
                      styles.actionIconLarge,
                      { backgroundColor: theme.colors.brandBlue + "30" },
                    ]}
                  >
                    <Ionicons
                      name="add-circle"
                      size={20}
                      color={theme.colors.brandBlue}
                    />
                  </View>
                  <AppText style={styles.actionCardTitle}>New Task</AppText>
                  <AppText style={styles.actionCardSub}>
                    Create & assign
                  </AppText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => navigation.navigate("CreateProject")}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.actionGlowLine,
                    { backgroundColor: theme.colors.brandGreen },
                  ]}
                />
                <View
                  style={[
                    styles.actionGlowEffect,
                    { shadowColor: theme.colors.brandGreen },
                  ]}
                />
                <View style={styles.actionCardContent}>
                  <View
                    style={[
                      styles.actionIconLarge,
                      { backgroundColor: theme.colors.brandGreen + "30" },
                    ]}
                  >
                    <Ionicons
                      name="folder-open"
                      size={20}
                      color={theme.colors.brandGreen}
                    />
                  </View>
                  <AppText style={styles.actionCardTitle}>New Project</AppText>
                  <AppText style={styles.actionCardSub}>Start fresh</AppText>
                </View>
              </TouchableOpacity>
            </>
          )}

          {/* All roles: View Tasks */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("Tasks")}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.actionGlowLine,
                { backgroundColor: theme.colors.brandGreen },
              ]}
            />
            <View
              style={[
                styles.actionGlowEffect,
                { shadowColor: theme.colors.brandGreen },
              ]}
            />
            <View style={styles.actionCardContent}>
              <View
                style={[
                  styles.actionIconLarge,
                  { backgroundColor: theme.colors.brandGreen + "30" },
                ]}
              >
                <Ionicons
                  name="checkbox"
                  size={20}
                  color={theme.colors.brandGreen}
                />
              </View>
              <AppText style={styles.actionCardTitle}>
                {user?.role === "team_member" ? "My Tasks" : "All Tasks"}
              </AppText>
              <AppText style={styles.actionCardSub}>
                {user?.role === "team_member"
                  ? "Update progress"
                  : "View tasks"}
              </AppText>
            </View>
          </TouchableOpacity>

          {/* All roles: View Teams */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate("Teams")}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.actionGlowLine,
                { backgroundColor: theme.colors.brandGreen },
              ]}
            />
            <View
              style={[
                styles.actionGlowEffect,
                { shadowColor: theme.colors.brandGreen },
              ]}
            />
            <View style={styles.actionCardContent}>
              <View
                style={[
                  styles.actionIconLarge,
                  { backgroundColor: theme.colors.brandGreen + "30" },
                ]}
              >
                <Ionicons
                  name="people"
                  size={20}
                  color={theme.colors.brandGreen}
                />
              </View>
              <AppText style={styles.actionCardTitle}>Teams</AppText>
              <AppText style={styles.actionCardSub}>
                {user?.role === "admin" ? "Manage teams" : "View teams"}
              </AppText>
            </View>
          </TouchableOpacity>

          {/* PM + Admin: Reports (Monitor Progress) */}
          {(user?.role === "project_manager" || user?.role === "admin") && (
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate("Reports")}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.actionGlowLine,
                  { backgroundColor: theme.colors.accentOrange },
                ]}
              />
              <View
                style={[
                  styles.actionGlowEffect,
                  { shadowColor: theme.colors.accentOrange },
                ]}
              />
              <View style={styles.actionCardContent}>
                <View
                  style={[
                    styles.actionIconLarge,
                    { backgroundColor: theme.colors.accentOrange + "30" },
                  ]}
                >
                  <Ionicons
                    name="analytics"
                    size={20}
                    color={theme.colors.accentOrange}
                  />
                </View>
                <AppText style={styles.actionCardTitle}>Reports</AppText>
                <AppText style={styles.actionCardSub}>Monitor progress</AppText>
              </View>
            </TouchableOpacity>
          )}

          {/* Admin Only: Manage Users - half-width to complete 2x2 grid */}
          {user?.role === "admin" && (
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate("Users")}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.actionGlowLine,
                  { backgroundColor: theme.colors.accentPink },
                ]}
              />
              <View
                style={[
                  styles.actionGlowEffect,
                  { shadowColor: theme.colors.accentPink },
                ]}
              />
              <View style={styles.actionCardContent}>
                <View
                  style={[
                    styles.actionIconLarge,
                    { backgroundColor: theme.colors.accentPink + "30" },
                  ]}
                >
                  <Ionicons
                    name="person-circle"
                    size={20}
                    color={theme.colors.accentPink}
                  />
                </View>
                <AppText style={styles.actionCardTitle}>Users</AppText>
                <AppText style={styles.actionCardSub}>Manage roles</AppText>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {error ? <AppText style={styles.error}>{error}</AppText> : null}

        <View style={{ height: 100 }} />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    marginTop: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
  },
  avatarGlow: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.glowBlue,
    opacity: 0.5,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.brandBlue,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: theme.colors.accentOrange,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  greeting: {
    marginLeft: theme.spacing.md,
  },
  greetingText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  userName: {
    fontWeight: "700",
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.glass,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  searchBar: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.glass,
    borderRadius: 14,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  searchText: {
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.sm,
  },
  sectionHeader: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontWeight: "600",
  },
  seeAll: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  projectsScroll: {
    marginHorizontal: -theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  projectCard: {
    width: 160,
    marginRight: theme.spacing.md,
  },
  projectTitle: {
    fontWeight: "600",
    fontSize: 15,
    marginBottom: theme.spacing.sm,
  },
  projectMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.sm,
  },
  avatarStack: {
    flexDirection: "row",
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.brandBlue,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: theme.colors.cardSolid,
  },
  miniAvatarText: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  projectStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginLeft: 4,
  },
  taskCount: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  taskCountText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginLeft: 4,
  },
  progressTitle: {
    fontWeight: "700",
    lineHeight: 26,
  },
  progressSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: theme.spacing.sm,
    lineHeight: 18,
  },
  calendarStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.lg,
  },
  calendarDay: {
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: 12,
    minWidth: 42,
  },
  calendarDayActive: {
    backgroundColor: theme.colors.brandBlue,
  },
  dayText: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: "500",
  },
  dayTextActive: {
    color: theme.colors.textPrimary,
  },
  dateText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  dateTextActive: {
    color: theme.colors.textPrimary,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.brandBlue,
    marginTop: 4,
  },
  dayTasksContainer: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.glassDark,
    borderRadius: 14,
    padding: theme.spacing.md,
  },
  dayTasksTitle: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
    marginBottom: theme.spacing.sm,
  },
  noTasks: {
    alignItems: "center",
    paddingVertical: theme.spacing.lg,
  },
  noTasksText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: theme.spacing.sm,
  },
  dayTaskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  taskIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
  },
  taskInfo: {
    flex: 1,
  },
  taskItemTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  taskItemMeta: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    textTransform: "capitalize",
  },
  viewMoreButton: {
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  viewMoreText: {
    color: theme.colors.brandBlue,
    fontSize: 13,
    fontWeight: "500",
  },
  teamAvatars: {
    flexDirection: "row",
    marginTop: theme.spacing.lg,
  },
  teamAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: theme.colors.cardSolid,
  },
  teamAvatarText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: "48%",
    marginBottom: theme.spacing.sm,
    borderRadius: 14,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    overflow: "hidden",
    position: "relative",
  },
  actionCardFull: {
    width: "100%",
    marginBottom: theme.spacing.sm,
    borderRadius: 14,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    overflow: "hidden",
    position: "relative",
  },
  actionGlowLine: {
    position: "absolute",
    left: 0,
    top: 10,
    width: 3,
    height: 28,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  actionGlowEffect: {
    position: "absolute",
    left: 0,
    top: 14,
    width: 3,
    height: 20,
    borderRadius: 2,
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 5,
  },
  actionCardContent: {
    padding: theme.spacing.sm,
    paddingLeft: theme.spacing.md,
  },
  actionCardContentFull: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  actionTextContainer: {
    marginLeft: theme.spacing.sm,
  },
  actionGlowLineFull: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 3,
    height: "100%",
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  actionIconLarge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xs,
  },
  actionCardTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  actionCardSub: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontStyle: "italic",
  },
  error: {
    color: theme.colors.danger,
    marginTop: theme.spacing.lg,
  },
});

export default HomeScreen;
