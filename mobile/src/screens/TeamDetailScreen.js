import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AppText from "../components/AppText";
import AppCard from "../components/AppCard";
import ScreenContainer from "../components/ScreenContainer";
import theme from "../theme";
import { api } from "../services/api";

const TeamDetailScreen = ({ route, navigation, user }) => {
  const [team] = useState(route.params?.team || {});
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTeamData = useCallback(async () => {
    setLoading(true);
    try {
      // Load team members, users, and other data in parallel
      const [membersRes, usersRes, projectsRes, tasksRes] = await Promise.all([
        api.getTeamMembers(team.id).catch(() => ({ data: [] })),
        api.getUsers().catch(() => ({ data: [] })),
        api.getProjects().catch(() => ({ data: [] })),
        api.getTasks().catch(() => ({ data: [] })),
      ]);

      // Get the raw team members (which have userId but not user details)
      const teamMemberRecords = membersRes.data || [];
      const allUsers = usersRes.data || [];

      // Create a map of users by ID for quick lookup
      const userMap = {};
      allUsers.forEach((user) => {
        userMap[user.id] = user;
      });

      // Merge team member records with user details
      const enrichedMembers = teamMemberRecords.map((memberRecord) => {
        const userInfo = userMap[memberRecord.userId] || {};
        return {
          ...memberRecord,
          id: memberRecord.userId || memberRecord.id, // Use userId for key
          firstName: userInfo.firstName || memberRecord.firstName || "",
          lastName: userInfo.lastName || memberRecord.lastName || "",
          email: userInfo.email || memberRecord.email || "",
          role: userInfo.role || memberRecord.role || "team_member",
        };
      });

      setMembers(enrichedMembers);

      // Filter projects and tasks that might be associated with this team
      const teamProjects = (projectsRes.data || []).filter(
        (p) => p.teamId === team.id,
      );
      const teamTasks = (tasksRes.data || []).filter((t) => {
        // Check if task is directly assigned to this team OR belongs to a project in this team
        if (t.teamId === team.id) return true;
        const projectIds = teamProjects.map((p) => p.id);
        return projectIds.includes(t.projectId);
      });

      setProjects(teamProjects);
      setTasks(teamTasks);
    } catch (err) {
      console.error(err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [team.id]);

  useFocusEffect(
    useCallback(() => {
      loadTeamData();
    }, [loadTeamData]),
  );

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return theme.colors.accentPink;
      case "project_manager":
        return theme.colors.brandBlue;
      default:
        return theme.colors.brandGreen;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "project_manager":
        return "Project Manager";
      default:
        return "Team Member";
    }
  };

  // Use actual member count from team data, or fall back to loaded members
  const memberCount = team.currentMemberCount || members.length;
  const projectCount = projects.length;
  const taskCount = tasks.length;

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
          <AppText variant="h3" style={styles.headerTitle}>
            Team Details
          </AppText>
          <View style={{ width: 40 }} />
        </View>

        {/* Team Info Card */}
        <AppCard accentColor={theme.colors.brandBlue} glowIntensity="high">
          <View style={styles.teamHeader}>
            <View style={styles.teamIcon}>
              <Ionicons
                name="people"
                size={32}
                color={theme.colors.textPrimary}
              />
            </View>
            <View style={styles.teamInfo}>
              <AppText variant="h2" style={styles.teamName}>
                {team.name}
              </AppText>
              <AppText style={styles.teamDesc}>
                {team.description || team.department || "No description"}
              </AppText>
            </View>
          </View>

          {team.department && (
            <View style={styles.departmentRow}>
              <Ionicons
                name="business-outline"
                size={16}
                color={theme.colors.textMuted}
              />
              <AppText style={styles.departmentText}>{team.department}</AppText>
            </View>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons
                name="briefcase-outline"
                size={18}
                color={theme.colors.brandBlue}
              />
              <AppText style={styles.statValue}>{projectCount}</AppText>
              <AppText style={styles.statLabel}>Projects</AppText>
            </View>
            <View style={styles.statItem}>
              <Ionicons
                name="checkbox-outline"
                size={18}
                color={theme.colors.brandGreen}
              />
              <AppText style={styles.statValue}>{taskCount}</AppText>
              <AppText style={styles.statLabel}>Tasks</AppText>
            </View>
            <View style={styles.statItem}>
              <Ionicons
                name="people-outline"
                size={18}
                color={theme.colors.accentPink}
              />
              <AppText style={styles.statValue}>{memberCount}</AppText>
              <AppText style={styles.statLabel}>Members</AppText>
            </View>
          </View>

          {team.createdAt && (
            <View style={styles.createdRow}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color={theme.colors.textMuted}
              />
              <AppText style={styles.createdText}>
                Created {new Date(team.createdAt).toLocaleDateString()}
              </AppText>
            </View>
          )}
        </AppCard>

        {/* Team Members Section */}
        <View style={styles.sectionHeader}>
          <AppText variant="h3" style={styles.sectionTitle}>
            Team Members
          </AppText>
          <AppText style={styles.memberCount}>{memberCount} members</AppText>
        </View>

        {loading ? (
          <ActivityIndicator
            color={theme.colors.brandBlue}
            style={{ marginTop: 20 }}
          />
        ) : members.length === 0 ? (
          <View style={styles.emptyMembers}>
            <Ionicons
              name="people-outline"
              size={40}
              color={theme.colors.textMuted}
            />
            <AppText style={styles.emptyText}>No members in this team</AppText>
          </View>
        ) : (
          members.map((member, index) => (
            <TouchableOpacity key={member.id} activeOpacity={0.8}>
              <AppCard
                accentColor={getRoleBadgeColor(member.role)}
                glowIntensity="low"
                style={styles.memberCard}
              >
                <View style={styles.memberRow}>
                  <LinearGradient
                    colors={[
                      getRoleBadgeColor(member.role),
                      theme.colors.brandBlue,
                    ]}
                    style={styles.memberAvatar}
                  >
                    <AppText style={styles.avatarText}>
                      {member.firstName?.[0] || "U"}
                      {member.lastName?.[0] || ""}
                    </AppText>
                  </LinearGradient>

                  <View style={styles.memberInfo}>
                    <AppText style={styles.memberName}>
                      {member.firstName} {member.lastName}
                    </AppText>
                    <AppText style={styles.memberEmail}>{member.email}</AppText>
                  </View>

                  <View
                    style={[
                      styles.roleBadge,
                      {
                        backgroundColor: getRoleBadgeColor(member.role) + "25",
                      },
                    ]}
                  >
                    <AppText
                      style={[
                        styles.roleText,
                        { color: getRoleBadgeColor(member.role) },
                      ]}
                    >
                      {getRoleLabel(member.role)}
                    </AppText>
                  </View>
                </View>
              </AppCard>
            </TouchableOpacity>
          ))
        )}

        {/* Projects Section (if any) */}
        {projects.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <AppText variant="h3" style={styles.sectionTitle}>
                Team Projects
              </AppText>
              <AppText style={styles.memberCount}>
                {projectCount} projects
              </AppText>
            </View>
            {projects.map((project) => (
              <TouchableOpacity
                key={project.id}
                onPress={() =>
                  navigation.navigate("ProjectDetail", { project })
                }
              >
                <AppCard
                  accentColor={theme.colors.brandBlue}
                  glowIntensity="low"
                >
                  <View style={styles.projectRow}>
                    <View style={styles.projectIcon}>
                      <Ionicons
                        name="folder"
                        size={20}
                        color={theme.colors.brandBlue}
                      />
                    </View>
                    <View style={styles.projectInfo}>
                      <AppText style={styles.projectName}>
                        {project.name}
                      </AppText>
                      <AppText style={styles.projectStatus}>
                        {project.status || "active"}
                      </AppText>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={theme.colors.textMuted}
                    />
                  </View>
                </AppCard>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Tasks Section */}
        {tasks.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <AppText variant="h3" style={styles.sectionTitle}>
                Team Tasks
              </AppText>
              <AppText style={styles.memberCount}>{taskCount} tasks</AppText>
            </View>
            {tasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                onPress={() => navigation.navigate("TaskDetail", { task })}
              >
                <AppCard
                  accentColor={
                    task.priority === "critical"
                      ? theme.colors.danger
                      : task.priority === "high"
                        ? theme.colors.accentOrange
                        : task.priority === "medium"
                          ? theme.colors.warning
                          : theme.colors.brandGreen
                  }
                  glowIntensity="low"
                >
                  <View style={styles.taskRow}>
                    <View
                      style={[
                        styles.taskIcon,
                        {
                          backgroundColor:
                            (task.priority === "critical"
                              ? theme.colors.danger
                              : task.priority === "high"
                                ? theme.colors.accentOrange
                                : task.priority === "medium"
                                  ? theme.colors.warning
                                  : theme.colors.brandGreen) + "25",
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          task.type === "bug"
                            ? "bug"
                            : task.type === "feature"
                              ? "sparkles"
                              : "checkbox"
                        }
                        size={20}
                        color={
                          task.priority === "critical"
                            ? theme.colors.danger
                            : task.priority === "high"
                              ? theme.colors.accentOrange
                              : task.priority === "medium"
                                ? theme.colors.warning
                                : theme.colors.brandGreen
                        }
                      />
                    </View>
                    <View style={styles.taskInfo}>
                      <AppText style={styles.taskTitle}>{task.title}</AppText>
                      <View style={styles.taskMeta}>
                        <View
                          style={[
                            styles.priorityBadge,
                            {
                              backgroundColor:
                                (task.priority === "critical"
                                  ? theme.colors.danger
                                  : task.priority === "high"
                                    ? theme.colors.accentOrange
                                    : task.priority === "medium"
                                      ? theme.colors.warning
                                      : theme.colors.brandGreen) + "25",
                            },
                          ]}
                        >
                          <AppText
                            style={[
                              styles.priorityText,
                              {
                                color:
                                  task.priority === "critical"
                                    ? theme.colors.danger
                                    : task.priority === "high"
                                      ? theme.colors.accentOrange
                                      : task.priority === "medium"
                                        ? theme.colors.warning
                                        : theme.colors.brandGreen,
                              },
                            ]}
                          >
                            {task.priority}
                          </AppText>
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                (task.status === "completed"
                                  ? theme.colors.brandGreen
                                  : task.status === "in_progress"
                                    ? theme.colors.brandBlue
                                    : task.status === "review"
                                      ? theme.colors.accentPink
                                      : theme.colors.textMuted) + "25",
                            },
                          ]}
                        >
                          <AppText
                            style={[
                              styles.statusText,
                              {
                                color:
                                  task.status === "completed"
                                    ? theme.colors.brandGreen
                                    : task.status === "in_progress"
                                      ? theme.colors.brandBlue
                                      : task.status === "review"
                                        ? theme.colors.accentPink
                                        : theme.colors.textMuted,
                              },
                            ]}
                          >
                            {task.status?.replace("_", " ")}
                          </AppText>
                        </View>
                      </View>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={theme.colors.textMuted}
                    />
                  </View>
                </AppCard>
              </TouchableOpacity>
            ))}
          </>
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
  teamHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  teamIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: theme.colors.brandBlue + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  teamInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  teamName: {
    fontWeight: "700",
  },
  teamDesc: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  departmentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.glass,
    alignSelf: "flex-start",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  departmentText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  createdRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  createdText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginLeft: 6,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontWeight: "600",
  },
  memberCount: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  memberCard: {
    marginVertical: 4,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  memberInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  memberName: {
    fontWeight: "600",
    fontSize: 15,
  },
  memberEmail: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 10,
    fontWeight: "600",
  },
  emptyMembers: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
  projectRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  projectIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.brandBlue + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  projectInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  projectName: {
    fontWeight: "500",
    fontSize: 14,
  },
  projectStatus: {
    color: theme.colors.textMuted,
    fontSize: 12,
    textTransform: "capitalize",
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  taskInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  taskTitle: {
    fontWeight: "500",
    fontSize: 14,
  },
  taskMeta: {
    flexDirection: "row",
    marginTop: 4,
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "capitalize",
  },
});

export default TeamDetailScreen;
