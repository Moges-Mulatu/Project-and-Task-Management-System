import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AppText from "../components/AppText";
import AppCard from "../components/AppCard";
import ScreenContainer from "../components/ScreenContainer";
import theme from "../theme";
import { api } from "../services/api";

const UsersScreen = ({ navigation, user }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.getUsers();
      setUsers(response.data || []);
      setFilteredUsers(response.data || []);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers])
  );

  const handleSearch = (text) => {
    setSearch(text);
    if (!text) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (u) =>
          u.firstName?.toLowerCase().includes(text.toLowerCase()) ||
          u.lastName?.toLowerCase().includes(text.toLowerCase()) ||
          u.email?.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
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

  const renderUser = ({ item, index }) => (
    <TouchableOpacity activeOpacity={0.8}>
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
              {item.role?.replace("_", " ")}
            </AppText>
          </View>
        </View>

        <View style={styles.userMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="briefcase-outline" size={14} color={theme.colors.textMuted} />
            <AppText style={styles.metaText}>5 Projects</AppText>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="checkbox-outline" size={14} color={theme.colors.textMuted} />
            <AppText style={styles.metaText}>12 Tasks</AppText>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={theme.colors.textMuted} />
            <AppText style={styles.metaText}>Active</AppText>
          </View>
        </View>
      </AppCard>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <AppText variant="h2" style={styles.title}>Users</AppText>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="person-add" size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={theme.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor={theme.colors.textMuted}
          value={search}
          onChangeText={handleSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Role Filter */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
          <AppText style={styles.filterChipTextActive}>All ({users.length})</AppText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <View style={[styles.filterDot, { backgroundColor: theme.colors.accentPink }]} />
          <AppText style={styles.filterChipText}>Admin</AppText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <View style={[styles.filterDot, { backgroundColor: theme.colors.brandBlue }]} />
          <AppText style={styles.filterChipText}>PM</AppText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <View style={[styles.filterDot, { backgroundColor: theme.colors.brandGreen }]} />
          <AppText style={styles.filterChipText}>Member</AppText>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.brandBlue} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <AppText style={styles.error}>{error}</AppText>
          <TouchableOpacity style={styles.retryButton} onPress={loadUsers}>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.brandBlue,
    alignItems: "center",
    justifyContent: "center",
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
  filterRow: {
    flexDirection: "row",
    marginBottom: theme.spacing.md,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.glass,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.brandBlue,
    borderColor: theme.colors.brandBlue,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  filterChipText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  filterChipTextActive: {
    color: theme.colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
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
    fontSize: 11,
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

export default UsersScreen;
