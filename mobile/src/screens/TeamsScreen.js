import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import AppText from "../components/AppText";
import AppCard from "../components/AppCard";
import ScreenContainer from "../components/ScreenContainer";
import theme from "../theme";
import { api } from "../services/api";

const TeamsScreen = ({ navigation, user }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTeams = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.getTeams();
      setTeams(response.data || []);
    } catch (err) {
      setError(err.message || "Failed to load teams");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTeams();
    }, [loadTeams])
  );

  const getInitials = (name) => {
    if (!name) return "T";
    const words = name.split(" ");
    if (words.length >= 2) {
      return words[0][0] + words[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const renderTeam = ({ item, index }) => (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => navigation.navigate("TeamDetail", { team: item })}
    >
      <AppCard
        accentColor={index % 2 === 0 ? theme.colors.brandBlue : theme.colors.brandGreen}
        glowIntensity="medium"
      >
        <View style={styles.cardHeader}>
          <View style={[styles.teamIcon, { backgroundColor: index % 2 === 0 ? theme.colors.brandBlue + "30" : theme.colors.brandGreen + "30" }]}>
            <Ionicons name="people" size={24} color={index % 2 === 0 ? theme.colors.brandBlue : theme.colors.brandGreen} />
          </View>
          <View style={styles.teamInfo}>
            <AppText variant="h3" style={styles.teamName}>
              {item.name}
            </AppText>
            <AppText style={styles.teamDesc} numberOfLines={1}>
              {item.description || item.department || "No description"}
            </AppText>
          </View>
          {item.department && (
            <View style={styles.deptBadge}>
              <AppText style={styles.deptText}>{item.department}</AppText>
            </View>
          )}
        </View>

        <View style={styles.membersSection}>
          <AppText style={styles.membersLabel}>Team Members</AppText>
          <View style={styles.avatarStack}>
            {/* Show initials based on team name */}
            {[0, 1, 2, 3].slice(0, Math.min(4, item.currentMemberCount || 1)).map((i) => (
              <View
                key={i}
                style={[
                  styles.memberAvatar,
                  { marginLeft: i > 0 ? -10 : 0 },
                  { backgroundColor: i % 2 === 0 ? theme.colors.brandBlue : theme.colors.brandGreen },
                ]}
              >
                <AppText style={styles.avatarText}>
                  {getInitials(item.name)[0]}
                </AppText>
              </View>
            ))}
            {(item.currentMemberCount || 0) > 4 && (
              <View style={[styles.memberAvatar, styles.moreAvatar, { marginLeft: -10 }]}>
                <AppText style={styles.moreText}>+{(item.currentMemberCount || 0) - 4}</AppText>
              </View>
            )}
            {(!item.currentMemberCount || item.currentMemberCount === 0) && (
              <AppText style={styles.noMembers}>No members yet</AppText>
            )}
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color={theme.colors.textMuted} />
            <AppText style={styles.metaText}>
              {item.currentMemberCount || 0} Members
            </AppText>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.textMuted} />
            <AppText style={styles.metaText}>
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
            </AppText>
          </View>
        </View>
      </AppCard>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppText variant="h2" style={styles.title}>Teams</AppText>
        {(user?.role === "admin" || user?.role === "project_manager") && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate("CreateTeam")}
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
          <TouchableOpacity style={styles.retryButton} onPress={loadTeams}>
            <AppText style={styles.retryText}>Retry</AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={teams}
          renderItem={renderTeam}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={theme.colors.textMuted} />
              <AppText style={styles.emptyText}>No teams yet</AppText>
              {(user?.role === "admin" || user?.role === "project_manager") && (
                <TouchableOpacity 
                  style={styles.createButton}
                  onPress={() => navigation.navigate("CreateTeam")}
                >
                  <AppText style={styles.createButtonText}>Create First Team</AppText>
                </TouchableOpacity>
              )}
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
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  teamIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  teamInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  teamName: {
    fontWeight: "600",
  },
  teamDesc: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  deptBadge: {
    backgroundColor: theme.colors.glass,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deptText: {
    color: theme.colors.textMuted,
    fontSize: 10,
    fontWeight: "500",
  },
  membersSection: {
    marginBottom: theme.spacing.md,
  },
  membersLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginBottom: theme.spacing.sm,
  },
  avatarStack: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: theme.colors.cardSolid,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  moreAvatar: {
    backgroundColor: theme.colors.glass,
  },
  moreText: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  noMembers: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontStyle: "italic",
  },
  cardFooter: {
    flexDirection: "row",
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
    marginBottom: theme.spacing.md,
  },
  createButton: {
    backgroundColor: theme.colors.brandBlue,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: 12,
  },
  createButtonText: {
    color: theme.colors.textPrimary,
    fontWeight: "500",
  },
});

export default TeamsScreen;
