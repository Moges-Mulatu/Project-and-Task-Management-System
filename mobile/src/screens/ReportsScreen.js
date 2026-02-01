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

const ReportsScreen = ({ navigation, user }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.getReports();
      setReports(response.data || []);
    } catch (err) {
      setError(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [loadReports])
  );

  const getTypeIcon = (type) => {
    switch (type) {
      case "progress":
        return "trending-up";
      case "performance":
        return "speedometer";
      case "summary":
        return "document-text";
      default:
        return "analytics";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "progress":
        return theme.colors.brandBlue;
      case "performance":
        return theme.colors.accentOrange;
      case "summary":
        return theme.colors.brandGreen;
      default:
        return theme.colors.textMuted;
    }
  };

  const renderReport = ({ item, index }) => (
    <TouchableOpacity activeOpacity={0.8}>
      <AppCard
        accentColor={getTypeColor(item.type)}
        glowIntensity="medium"
      >
        <View style={styles.cardHeader}>
          <View style={[styles.typeIcon, { backgroundColor: getTypeColor(item.type) + "30" }]}>
            <Ionicons name={getTypeIcon(item.type)} size={24} color={getTypeColor(item.type)} />
          </View>
          <View style={styles.reportInfo}>
            <AppText variant="h3" style={styles.reportTitle}>
              {item.title || `Report #${index + 1}`}
            </AppText>
            <AppText style={styles.reportType}>{item.type || "General"}</AppText>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) + "20" }]}>
            <AppText style={[styles.typeBadgeText, { color: getTypeColor(item.type) }]}>
              {item.type}
            </AppText>
          </View>
        </View>

        <AppText style={styles.description} numberOfLines={2}>
          {item.description || item.content || "No description available"}
        </AppText>

        <View style={styles.cardFooter}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.textMuted} />
            <AppText style={styles.metaText}>
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
            </AppText>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="person-outline" size={14} color={theme.colors.textMuted} />
            <AppText style={styles.metaText}>
              {item.generatedBy || "System"}
            </AppText>
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
        <AppText variant="h2" style={styles.title}>Reports</AppText>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter-outline" size={22} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.brandBlue + "20" }]}>
          <Ionicons name="trending-up" size={22} color={theme.colors.brandBlue} />
          <AppText style={[styles.statValue, { color: theme.colors.brandBlue }]}>
            {reports.filter(r => r.type === "progress").length}
          </AppText>
          <AppText style={styles.statLabel}>Progress</AppText>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.accentOrange + "20" }]}>
          <Ionicons name="speedometer" size={22} color={theme.colors.accentOrange} />
          <AppText style={[styles.statValue, { color: theme.colors.accentOrange }]}>
            {reports.filter(r => r.type === "performance").length}
          </AppText>
          <AppText style={styles.statLabel}>Performance</AppText>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.brandGreen + "20" }]}>
          <Ionicons name="document-text" size={22} color={theme.colors.brandGreen} />
          <AppText style={[styles.statValue, { color: theme.colors.brandGreen }]}>
            {reports.filter(r => r.type === "summary").length}
          </AppText>
          <AppText style={styles.statLabel}>Summary</AppText>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.brandBlue} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <AppText style={styles.error}>{error}</AppText>
          <TouchableOpacity style={styles.retryButton} onPress={loadReports}>
            <AppText style={styles.retryText}>Retry</AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderReport}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="analytics-outline" size={48} color={theme.colors.textMuted} />
              <AppText style={styles.emptyText}>No reports yet</AppText>
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
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.glass,
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: theme.spacing.md,
    marginHorizontal: 4,
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
    marginTop: 2,
  },
  list: {
    paddingBottom: theme.spacing.xl,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  reportInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  reportTitle: {
    fontWeight: "600",
  },
  reportType: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    textTransform: "capitalize",
  },
  typeBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: theme.spacing.md,
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
  },
});

export default ReportsScreen;
