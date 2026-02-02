import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AppText from "../components/AppText";
import AppCard from "../components/AppCard";
import ScreenContainer from "../components/ScreenContainer";
import theme from "../theme";
import { api } from "../services/api";

const ROLE_FILTERS = [
  { key: "all", label: "All", icon: "people" },
  { key: "admin", label: "Admin", color: theme.colors.accentPink },
  { key: "project_manager", label: "PM", color: theme.colors.brandBlue },
  { key: "team_member", label: "Member", color: theme.colors.brandGreen },
];

const UsersScreen = ({ navigation, user: currentUser }) => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [usersRes, tasksRes, projectsRes] = await Promise.all([
        api.getUsers(),
        api.getTasks(),
        api.getProjects(),
      ]);
      setUsers(usersRes.data || []);
      setTasks(tasksRes.data || []);
      setProjects(projectsRes.data || []);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Get user stats
  const getUserStats = (userId) => {
    const userTasks = tasks.filter((t) => t.assignedTo === userId);
    const completedTasks = userTasks.filter((t) => t.status === "completed").length;
    
    // Count projects where user has tasks
    const projectIds = [...new Set(userTasks.map((t) => t.projectId).filter(Boolean))];
    
    return {
      taskCount: userTasks.length,
      completedTasks,
      projectCount: projectIds.length,
      completionRate: userTasks.length > 0 
        ? Math.round((completedTasks / userTasks.length) * 100) 
        : 0,
    };
  };

  // Filter users
  const getFilteredUsers = () => {
    let filtered = users;

    // Apply role filter
    if (activeFilter !== "all") {
      filtered = filtered.filter((u) => u.role === activeFilter);
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.firstName?.toLowerCase().includes(searchLower) ||
          u.lastName?.toLowerCase().includes(searchLower) ||
          u.email?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  const filteredUsers = getFilteredUsers();

  // Get count for each role
  const getRoleCount = (role) => {
    if (role === "all") return users.length;
    return users.filter((u) => u.role === role).length;
  };

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

  const handleDeactivateUser = (userId, userName) => {
    if (userId === currentUser?.id) {
      Alert.alert("Cannot Deactivate", "You cannot deactivate your own account.");
      return;
    }

    Alert.alert(
      "Deactivate User",
      `Are you sure you want to deactivate ${userName}? They will no longer be able to access the system.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: async () => {
            try {
              await api.deactivateUser(userId);
              setShowUserModal(false);
              setSelectedUser(null);
              loadData(); // Refresh the list
              Alert.alert("Success", `${userName} has been deactivated.`);
            } catch (err) {
              Alert.alert("Error", err.message || "Failed to deactivate user");
            }
          },
        },
      ]
    );
  };

  const openUserDetail = (userItem) => {
    setSelectedUser(userItem);
    setShowUserModal(true);
  };

  const renderUser = ({ item }) => {
    const stats = getUserStats(item.id);
    
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={() => openUserDetail(item)}>
        <AppCard
          accentColor={getRoleBadgeColor(item.role)}
          glowIntensity="low"
        >
          <View style={styles.userRow}>
            <LinearGradient
              colors={[getRoleBadgeColor(item.role), theme.colors.brandBlue]}
              style={styles.avatar}
            >
              <AppText style={styles.avatarText}>
                {item.firstName?.[0] || "U"}{item.lastName?.[0] || ""}
              </AppText>
            </LinearGradient>

            <View style={styles.userInfo}>
              <AppText style={styles.userName}>
                {item.firstName} {item.lastName}
              </AppText>
              <AppText style={styles.userEmail}>{item.email}</AppText>
            </View>

            <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(item.role) + "25" }]}>
              <AppText style={[styles.roleText, { color: getRoleBadgeColor(item.role) }]}>
                {getRoleLabel(item.role)}
              </AppText>
            </View>
          </View>

          <View style={styles.userMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="briefcase-outline" size={14} color={theme.colors.textMuted} />
              <AppText style={styles.metaText}>{stats.projectCount} Projects</AppText>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="checkbox-outline" size={14} color={theme.colors.textMuted} />
              <AppText style={styles.metaText}>{stats.taskCount} Tasks</AppText>
            </View>
            <View style={styles.metaItem}>
              <Ionicons 
                name={item.isActive !== false ? "checkmark-circle" : "close-circle"} 
                size={14} 
                color={item.isActive !== false ? theme.colors.brandGreen : theme.colors.danger} 
              />
              <AppText style={[
                styles.metaText, 
                { color: item.isActive !== false ? theme.colors.brandGreen : theme.colors.danger }
              ]}>
                {item.isActive !== false ? "Active" : "Inactive"}
              </AppText>
            </View>
          </View>
        </AppCard>
      </TouchableOpacity>
    );
  };

  // User Detail Modal
  const renderUserModal = () => {
    if (!selectedUser) return null;
    const stats = getUserStats(selectedUser.id);

    return (
      <Modal
        visible={showUserModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUserModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setShowUserModal(false)}
                  style={styles.modalCloseBtn}
                >
                  <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <AppText variant="h3" style={styles.modalTitle}>User Details</AppText>
                <View style={{ width: 40 }} />
              </View>

              {/* User Profile */}
              <View style={styles.profileSection}>
                <LinearGradient
                  colors={[getRoleBadgeColor(selectedUser.role), theme.colors.brandBlue]}
                  style={styles.profileAvatar}
                >
                  <AppText style={styles.profileAvatarText}>
                    {selectedUser.firstName?.[0] || "U"}{selectedUser.lastName?.[0] || ""}
                  </AppText>
                </LinearGradient>
                <AppText variant="h2" style={styles.profileName}>
                  {selectedUser.firstName} {selectedUser.lastName}
                </AppText>
                <AppText style={styles.profileEmail}>{selectedUser.email}</AppText>
                <View style={[styles.profileRoleBadge, { backgroundColor: getRoleBadgeColor(selectedUser.role) + "25" }]}>
                  <AppText style={[styles.profileRoleText, { color: getRoleBadgeColor(selectedUser.role) }]}>
                    {getRoleLabel(selectedUser.role)}
                  </AppText>
                </View>
              </View>

              {/* Stats */}
              <View style={styles.statsGrid}>
                <View style={[styles.statBox, { backgroundColor: theme.colors.brandBlue + "20" }]}>
                  <Ionicons name="briefcase" size={24} color={theme.colors.brandBlue} />
                  <AppText style={[styles.statBoxValue, { color: theme.colors.brandBlue }]}>
                    {stats.projectCount}
                  </AppText>
                  <AppText style={styles.statBoxLabel}>Projects</AppText>
                </View>
                <View style={[styles.statBox, { backgroundColor: theme.colors.brandGreen + "20" }]}>
                  <Ionicons name="checkbox" size={24} color={theme.colors.brandGreen} />
                  <AppText style={[styles.statBoxValue, { color: theme.colors.brandGreen }]}>
                    {stats.taskCount}
                  </AppText>
                  <AppText style={styles.statBoxLabel}>Tasks</AppText>
                </View>
                <View style={[styles.statBox, { backgroundColor: theme.colors.accentOrange + "20" }]}>
                  <Ionicons name="checkmark-done" size={24} color={theme.colors.accentOrange} />
                  <AppText style={[styles.statBoxValue, { color: theme.colors.accentOrange }]}>
                    {stats.completedTasks}
                  </AppText>
                  <AppText style={styles.statBoxLabel}>Completed</AppText>
                </View>
                <View style={[styles.statBox, { backgroundColor: theme.colors.accentPink + "20" }]}>
                  <Ionicons name="trophy" size={24} color={theme.colors.accentPink} />
                  <AppText style={[styles.statBoxValue, { color: theme.colors.accentPink }]}>
                    {stats.completionRate}%
                  </AppText>
                  <AppText style={styles.statBoxLabel}>Rate</AppText>
                </View>
              </View>

              {/* Info Rows */}
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Ionicons name="mail-outline" size={20} color={theme.colors.textMuted} />
                  <View style={styles.infoContent}>
                    <AppText style={styles.infoLabel}>Email</AppText>
                    <AppText style={styles.infoValue}>{selectedUser.email}</AppText>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="shield-outline" size={20} color={theme.colors.textMuted} />
                  <View style={styles.infoContent}>
                    <AppText style={styles.infoLabel}>Role</AppText>
                    <AppText style={styles.infoValue}>{getRoleLabel(selectedUser.role)}</AppText>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons 
                    name={selectedUser.isActive !== false ? "checkmark-circle-outline" : "close-circle-outline"} 
                    size={20} 
                    color={selectedUser.isActive !== false ? theme.colors.brandGreen : theme.colors.danger} 
                  />
                  <View style={styles.infoContent}>
                    <AppText style={styles.infoLabel}>Status</AppText>
                    <AppText style={[
                      styles.infoValue, 
                      { color: selectedUser.isActive !== false ? theme.colors.brandGreen : theme.colors.danger }
                    ]}>
                      {selectedUser.isActive !== false ? "Active" : "Inactive"}
                    </AppText>
                  </View>
                </View>
                {selectedUser.createdAt && (
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={20} color={theme.colors.textMuted} />
                    <View style={styles.infoContent}>
                      <AppText style={styles.infoLabel}>Joined</AppText>
                      <AppText style={styles.infoValue}>
                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </AppText>
                    </View>
                  </View>
                )}
              </View>

              {/* Actions */}
              {currentUser?.role === "admin" && selectedUser.id !== currentUser?.id && (
                <View style={styles.actionsSection}>
                  {selectedUser.isActive !== false ? (
                    <TouchableOpacity
                      style={styles.deactivateButton}
                      onPress={() => handleDeactivateUser(selectedUser.id, `${selectedUser.firstName} ${selectedUser.lastName}`)}
                    >
                      <Ionicons name="person-remove" size={20} color={theme.colors.danger} />
                      <AppText style={styles.deactivateButtonText}>Deactivate User</AppText>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.deactivatedBadge}>
                      <Ionicons name="information-circle" size={20} color={theme.colors.warning} />
                      <AppText style={styles.deactivatedText}>This user has been deactivated</AppText>
                    </View>
                  )}
                </View>
              )}

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.title}>Users</AppText>
        <View style={styles.headerRight}>
          <AppText style={styles.userCount}>{users.length} total</AppText>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={theme.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor={theme.colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Role Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
      >
        {ROLE_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              activeFilter === filter.key && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(filter.key)}
          >
            {filter.color ? (
              <View style={[styles.filterDot, { backgroundColor: filter.color }]} />
            ) : (
              <Ionicons 
                name={filter.icon} 
                size={14} 
                color={activeFilter === filter.key ? theme.colors.textPrimary : theme.colors.textMuted}
                style={{ marginRight: 6 }}
              />
            )}
            <AppText
              style={[
                styles.filterChipText,
                activeFilter === filter.key && styles.filterChipTextActive,
              ]}
            >
              {filter.label} ({getRoleCount(filter.key)})
            </AppText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.brandBlue} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle" size={48} color={theme.colors.danger} />
          <AppText style={styles.error}>{error}</AppText>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <AppText style={styles.retryText}>Retry</AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={theme.colors.textMuted} />
              <AppText style={styles.emptyText}>
                {search ? "No users found" : "No users yet"}
              </AppText>
            </View>
          }
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      )}

      {renderUserModal()}
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
  backButton: {
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
  headerRight: {
    width: 70,
    alignItems: "flex-end",
  },
  userCount: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  searchBar: {
    backgroundColor: theme.colors.glass,
    borderRadius: 14,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 15,
    marginLeft: theme.spacing.sm,
  },
  filterScroll: {
    marginBottom: theme.spacing.md,
    height: 44,
    minHeight: 44,
    maxHeight: 44,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.glass,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 36,
    width: 90,
  },
  filterChipActive: {
    backgroundColor: theme.colors.brandBlue,
    borderColor: theme.colors.brandBlue,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  filterChipText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  filterChipTextActive: {
    color: theme.colors.textPrimary,
  },
  list: {
    paddingBottom: theme.spacing.xl,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  userInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  userName: {
    fontWeight: "600",
    fontSize: 15,
  },
  userEmail: {
    color: theme.colors.textSecondary,
    fontSize: 13,
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
    textTransform: "capitalize",
  },
  userMeta: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
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
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    color: theme.colors.danger,
    marginVertical: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: theme.colors.glass,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: 12,
  },
  retryText: {
    color: theme.colors.brandBlue,
  },
  empty: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.spacing.lg,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.glass,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontWeight: "600",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  profileAvatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  profileName: {
    fontWeight: "700",
    marginBottom: 4,
  },
  profileEmail: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  profileRoleBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
  },
  profileRoleText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
    marginBottom: theme.spacing.lg,
  },
  statBox: {
    width: "48%",
    margin: "1%",
    borderRadius: 14,
    padding: theme.spacing.md,
    alignItems: "center",
  },
  statBoxValue: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: theme.spacing.sm,
  },
  statBoxLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  infoSection: {
    backgroundColor: theme.colors.glass,
    borderRadius: 14,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoContent: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  infoLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
  infoValue: {
    fontWeight: "500",
    marginTop: 2,
  },
  actionsSection: {
    marginTop: theme.spacing.sm,
  },
  deactivateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.danger + "15",
    borderWidth: 1,
    borderColor: theme.colors.danger,
    borderRadius: 14,
    paddingVertical: theme.spacing.md,
  },
  deactivateButtonText: {
    color: theme.colors.danger,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
  },
  deactivatedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.warning + "15",
    borderRadius: 14,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  deactivatedText: {
    color: theme.colors.warning,
    marginLeft: theme.spacing.sm,
    fontSize: 13,
  },
});

export default UsersScreen;
