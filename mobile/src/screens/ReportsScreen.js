import React, { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
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

const REPORT_TYPES = [
  { key: "all", label: "All", icon: "layers" },
  { key: "project_summary", label: "Project", icon: "folder" },
  { key: "team_performance", label: "Team", icon: "people" },
  { key: "task_bottlenecks", label: "Tasks", icon: "warning" },
];

const ReportsScreen = ({ navigation, user }) => {
  // Restrict access to project_manager only (per spec: PM monitors project progress)
  React.useEffect(() => {
    if (user?.role !== "project_manager") {
      Alert.alert(
        "Access Denied",
        "Only project managers can access reports to monitor progress.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }
  }, [user, navigation]);

  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showReportDetail, setShowReportDetail] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [reportTypeToGenerate, setReportTypeToGenerate] = useState("project_summary");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [reportsRes, projectsRes, teamsRes, tasksRes] = await Promise.all([
        api.getReports(),
        api.getProjects(),
        api.getTeams(),
        api.getTasks(),
      ]);
      setReports(reportsRes.data || []);
      setProjects(projectsRes.data || []);
      setTeams(teamsRes.data || []);
      setTasks(tasksRes.data || []);
    } catch (err) {
      setError(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      if (reportTypeToGenerate === "project_summary") {
        if (!selectedProject) {
          Alert.alert("Select Project", "Please select a project to generate a summary report.");
          setGenerating(false);
          return;
        }
        await api.generateProjectSummary(selectedProject.id);
        Alert.alert("Success", "Project summary report generated successfully!");
      } else if (reportTypeToGenerate === "team_performance") {
        if (!selectedTeam) {
          Alert.alert("Select Team", "Please select a team to generate a performance report.");
          setGenerating(false);
          return;
        }
        // Calculate team stats
        const teamTasks = tasks.filter(t => {
          const project = projects.find(p => p.id === t.projectId);
          return project?.teamId === selectedTeam.id;
        });
        const completedTasks = teamTasks.filter(t => t.status === "completed").length;
        const inProgressTasks = teamTasks.filter(t => t.status === "in_progress").length;
        
        await api.createReport({
          title: `Team Performance: ${selectedTeam.name}`,
          type: "team_performance",
          teamId: selectedTeam.id,
          reportData: {
            teamName: selectedTeam.name,
            department: selectedTeam.department,
            totalMembers: selectedTeam.currentMemberCount || 0,
            totalTasks: teamTasks.length,
            completedTasks,
            inProgressTasks,
            pendingTasks: teamTasks.length - completedTasks - inProgressTasks,
            completionRate: teamTasks.length > 0 
              ? Math.round((completedTasks / teamTasks.length) * 100) 
              : 0,
          },
          status: "completed",
        });
        Alert.alert("Success", "Team performance report generated successfully!");
      } else if (reportTypeToGenerate === "task_bottlenecks") {
        // Analyze task bottlenecks
        const overdueTasks = tasks.filter(t => {
          if (!t.dueDate || t.status === "completed") return false;
          return new Date(t.dueDate) < new Date();
        });
        const blockedTasks = tasks.filter(t => t.status === "blocked");
        const highPriorityPending = tasks.filter(t => 
          (t.priority === "high" || t.priority === "critical") && t.status !== "completed"
        );
        const longRunningTasks = tasks.filter(t => 
          t.status === "in_progress" && t.progress < 50
        );

        await api.createReport({
          title: `Task Bottlenecks Analysis - ${new Date().toLocaleDateString()}`,
          type: "task_bottlenecks",
          reportData: {
            totalTasks: tasks.length,
            overdueTasks: overdueTasks.length,
            overdueTasksList: overdueTasks.slice(0, 5).map(t => ({ id: t.id, title: t.title, dueDate: t.dueDate })),
            blockedTasks: blockedTasks.length,
            blockedTasksList: blockedTasks.slice(0, 5).map(t => ({ id: t.id, title: t.title })),
            highPriorityPending: highPriorityPending.length,
            highPriorityList: highPriorityPending.slice(0, 5).map(t => ({ id: t.id, title: t.title, priority: t.priority })),
            slowProgressTasks: longRunningTasks.length,
            riskScore: Math.min(100, (overdueTasks.length * 10) + (blockedTasks.length * 15) + (highPriorityPending.length * 5)),
          },
          status: "completed",
        });
        Alert.alert("Success", "Task bottlenecks report generated successfully!");
      }
      
      setShowGenerateModal(false);
      setSelectedProject(null);
      setSelectedTeam(null);
      setReportTypeToGenerate("project_summary");
      loadData(); // Refresh the list
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteReport = (reportId) => {
    Alert.alert(
      "Delete Report",
      "Are you sure you want to delete this report?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.deleteReport(reportId);
              setReports(reports.filter((r) => r.id !== reportId));
              setShowReportDetail(null);
            } catch (err) {
              Alert.alert("Error", err.message || "Failed to delete report");
            }
          },
        },
      ]
    );
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "project_summary":
        return "folder";
      case "team_performance":
        return "people";
      case "task_bottlenecks":
        return "warning";
      default:
        return "analytics";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "project_summary":
        return theme.colors.brandBlue;
      case "team_performance":
        return theme.colors.accentOrange;
      case "task_bottlenecks":
        return theme.colors.danger;
      default:
        return theme.colors.brandGreen;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "project_summary":
        return "Project Summary";
      case "team_performance":
        return "Team Performance";
      case "task_bottlenecks":
        return "Task Bottlenecks";
      default:
        return type || "General";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return theme.colors.brandGreen;
      case "generating":
        return theme.colors.warning;
      case "failed":
        return theme.colors.danger;
      default:
        return theme.colors.textMuted;
    }
  };

  const filteredReports = activeFilter === "all"
    ? reports
    : reports.filter((r) => r.type === activeFilter);

  const renderReport = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => setShowReportDetail(item)}
    >
      <AppCard
        accentColor={getTypeColor(item.type)}
        glowIntensity="medium"
      >
        <View style={styles.cardHeader}>
          <View style={[styles.typeIcon, { backgroundColor: getTypeColor(item.type) + "25" }]}>
            <Ionicons name={getTypeIcon(item.type)} size={22} color={getTypeColor(item.type)} />
          </View>
          <View style={styles.reportInfo}>
            <AppText variant="h3" style={styles.reportTitle} numberOfLines={1}>
              {item.title}
            </AppText>
            <AppText style={styles.reportType}>{getTypeLabel(item.type)}</AppText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "25" }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <AppText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </AppText>
          </View>
        </View>

        {/* Report Data Preview */}
        {item.reportData && item.type === "project_summary" && (
          <View style={styles.dataPreview}>
            <View style={styles.dataItem}>
              <AppText style={styles.dataValue}>{item.reportData.totalTasks || 0}</AppText>
              <AppText style={styles.dataLabel}>Total Tasks</AppText>
            </View>
            <View style={styles.dataItem}>
              <AppText style={[styles.dataValue, { color: theme.colors.brandGreen }]}>
                {item.reportData.completedTasks || 0}
              </AppText>
              <AppText style={styles.dataLabel}>Completed</AppText>
            </View>
            <View style={styles.dataItem}>
              <AppText style={[styles.dataValue, { color: theme.colors.warning }]}>
                {item.reportData.pendingTasks || 0}
              </AppText>
              <AppText style={styles.dataLabel}>Pending</AppText>
            </View>
            <View style={styles.dataItem}>
              <AppText style={[styles.dataValue, { color: theme.colors.brandBlue }]}>
                {item.reportData.projectProgress || 0}%
              </AppText>
              <AppText style={styles.dataLabel}>Progress</AppText>
            </View>
          </View>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.textMuted} />
            <AppText style={styles.metaText}>
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
        </View>
      </AppCard>
    </TouchableOpacity>
  );

  // Report Detail Modal
  const renderReportDetailModal = () => (
    <Modal
      visible={!!showReportDetail}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowReportDetail(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setShowReportDetail(null)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
              <AppText variant="h3" style={styles.modalTitle}>Report Details</AppText>
              <TouchableOpacity
                onPress={() => handleDeleteReport(showReportDetail?.id)}
                style={styles.modalDeleteBtn}
              >
                <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
              </TouchableOpacity>
            </View>

            {showReportDetail && (
              <>
                {/* Title & Type */}
                <View style={styles.detailSection}>
                  <View style={[styles.detailIcon, { backgroundColor: getTypeColor(showReportDetail.type) + "25" }]}>
                    <Ionicons
                      name={getTypeIcon(showReportDetail.type)}
                      size={32}
                      color={getTypeColor(showReportDetail.type)}
                    />
                  </View>
                  <AppText variant="h2" style={styles.detailTitle}>
                    {showReportDetail.title}
                  </AppText>
                  <View style={[styles.detailTypeBadge, { backgroundColor: getTypeColor(showReportDetail.type) + "25" }]}>
                    <AppText style={[styles.detailTypeText, { color: getTypeColor(showReportDetail.type) }]}>
                      {getTypeLabel(showReportDetail.type)}
                    </AppText>
                  </View>
                </View>

                {/* Status */}
                <View style={styles.detailRow}>
                  <AppText style={styles.detailLabel}>Status</AppText>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(showReportDetail.status) + "25" }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(showReportDetail.status) }]} />
                    <AppText style={[styles.statusText, { color: getStatusColor(showReportDetail.status) }]}>
                      {showReportDetail.status}
                    </AppText>
                  </View>
                </View>

                {/* Created At */}
                <View style={styles.detailRow}>
                  <AppText style={styles.detailLabel}>Generated On</AppText>
                  <AppText style={styles.detailValue}>
                    {showReportDetail.createdAt
                      ? new Date(showReportDetail.createdAt).toLocaleString()
                      : "N/A"}
                  </AppText>
                </View>

                {/* Report Data */}
                {showReportDetail.reportData && (
                  <View style={styles.reportDataSection}>
                    <AppText style={styles.sectionTitle}>Report Data</AppText>
                    
                    {showReportDetail.type === "project_summary" && (
                      <View style={styles.statsGrid}>
                        <View style={[styles.statBox, { backgroundColor: theme.colors.brandBlue + "20" }]}>
                          <Ionicons name="list" size={24} color={theme.colors.brandBlue} />
                          <AppText style={[styles.statBoxValue, { color: theme.colors.brandBlue }]}>
                            {showReportDetail.reportData.totalTasks || 0}
                          </AppText>
                          <AppText style={styles.statBoxLabel}>Total Tasks</AppText>
                        </View>
                        <View style={[styles.statBox, { backgroundColor: theme.colors.brandGreen + "20" }]}>
                          <Ionicons name="checkmark-circle" size={24} color={theme.colors.brandGreen} />
                          <AppText style={[styles.statBoxValue, { color: theme.colors.brandGreen }]}>
                            {showReportDetail.reportData.completedTasks || 0}
                          </AppText>
                          <AppText style={styles.statBoxLabel}>Completed</AppText>
                        </View>
                        <View style={[styles.statBox, { backgroundColor: theme.colors.warning + "20" }]}>
                          <Ionicons name="time" size={24} color={theme.colors.warning} />
                          <AppText style={[styles.statBoxValue, { color: theme.colors.warning }]}>
                            {showReportDetail.reportData.pendingTasks || 0}
                          </AppText>
                          <AppText style={styles.statBoxLabel}>Pending</AppText>
                        </View>
                        <View style={[styles.statBox, { backgroundColor: theme.colors.accentPink + "20" }]}>
                          <Ionicons name="trending-up" size={24} color={theme.colors.accentPink} />
                          <AppText style={[styles.statBoxValue, { color: theme.colors.accentPink }]}>
                            {showReportDetail.reportData.projectProgress || 0}%
                          </AppText>
                          <AppText style={styles.statBoxLabel}>Progress</AppText>
                        </View>
                      </View>
                    )}

                    {showReportDetail.type === "team_performance" && (
                      <View style={styles.statsGrid}>
                        <View style={[styles.statBox, { backgroundColor: theme.colors.accentOrange + "20" }]}>
                          <Ionicons name="people" size={24} color={theme.colors.accentOrange} />
                          <AppText style={[styles.statBoxValue, { color: theme.colors.accentOrange }]}>
                            {showReportDetail.reportData.totalMembers || 0}
                          </AppText>
                          <AppText style={styles.statBoxLabel}>Members</AppText>
                        </View>
                        <View style={[styles.statBox, { backgroundColor: theme.colors.brandBlue + "20" }]}>
                          <Ionicons name="list" size={24} color={theme.colors.brandBlue} />
                          <AppText style={[styles.statBoxValue, { color: theme.colors.brandBlue }]}>
                            {showReportDetail.reportData.totalTasks || 0}
                          </AppText>
                          <AppText style={styles.statBoxLabel}>Total Tasks</AppText>
                        </View>
                        <View style={[styles.statBox, { backgroundColor: theme.colors.brandGreen + "20" }]}>
                          <Ionicons name="checkmark-circle" size={24} color={theme.colors.brandGreen} />
                          <AppText style={[styles.statBoxValue, { color: theme.colors.brandGreen }]}>
                            {showReportDetail.reportData.completedTasks || 0}
                          </AppText>
                          <AppText style={styles.statBoxLabel}>Completed</AppText>
                        </View>
                        <View style={[styles.statBox, { backgroundColor: theme.colors.accentPink + "20" }]}>
                          <Ionicons name="trophy" size={24} color={theme.colors.accentPink} />
                          <AppText style={[styles.statBoxValue, { color: theme.colors.accentPink }]}>
                            {showReportDetail.reportData.completionRate || 0}%
                          </AppText>
                          <AppText style={styles.statBoxLabel}>Completion</AppText>
                        </View>
                      </View>
                    )}

                    {showReportDetail.type === "task_bottlenecks" && (
                      <>
                        <View style={styles.statsGrid}>
                          <View style={[styles.statBox, { backgroundColor: theme.colors.warning + "20" }]}>
                            <Ionicons name="time" size={24} color={theme.colors.warning} />
                            <AppText style={[styles.statBoxValue, { color: theme.colors.warning }]}>
                              {showReportDetail.reportData.overdueTasks || 0}
                            </AppText>
                            <AppText style={styles.statBoxLabel}>Overdue</AppText>
                          </View>
                          <View style={[styles.statBox, { backgroundColor: theme.colors.danger + "20" }]}>
                            <Ionicons name="ban" size={24} color={theme.colors.danger} />
                            <AppText style={[styles.statBoxValue, { color: theme.colors.danger }]}>
                              {showReportDetail.reportData.blockedTasks || 0}
                            </AppText>
                            <AppText style={styles.statBoxLabel}>Blocked</AppText>
                          </View>
                          <View style={[styles.statBox, { backgroundColor: theme.colors.accentOrange + "20" }]}>
                            <Ionicons name="alert-circle" size={24} color={theme.colors.accentOrange} />
                            <AppText style={[styles.statBoxValue, { color: theme.colors.accentOrange }]}>
                              {showReportDetail.reportData.highPriorityPending || 0}
                            </AppText>
                            <AppText style={styles.statBoxLabel}>High Priority</AppText>
                          </View>
                          <View style={[styles.statBox, { backgroundColor: theme.colors.accentPink + "20" }]}>
                            <Ionicons name="speedometer" size={24} color={theme.colors.accentPink} />
                            <AppText style={[styles.statBoxValue, { color: theme.colors.accentPink }]}>
                              {showReportDetail.reportData.riskScore || 0}
                            </AppText>
                            <AppText style={styles.statBoxLabel}>Risk Score</AppText>
                          </View>
                        </View>
                      </>
                    )}

                    {/* Priority Distribution */}
                    {showReportDetail.reportData.priorityDistribution && (
                      <View style={styles.prioritySection}>
                        <AppText style={styles.subSectionTitle}>Priority Distribution</AppText>
                        <View style={styles.priorityBars}>
                          <View style={styles.priorityItem}>
                            <View style={styles.priorityLabelRow}>
                              <AppText style={styles.priorityLabel}>High</AppText>
                              <AppText style={styles.priorityCount}>
                                {showReportDetail.reportData.priorityDistribution.high || 0}
                              </AppText>
                            </View>
                            <View style={styles.priorityBarBg}>
                              <View
                                style={[
                                  styles.priorityBarFill,
                                  {
                                    backgroundColor: theme.colors.danger,
                                    width: `${Math.min(
                                      ((showReportDetail.reportData.priorityDistribution.high || 0) /
                                        (showReportDetail.reportData.totalTasks || 1)) *
                                        100,
                                      100
                                    )}%`,
                                  },
                                ]}
                              />
                            </View>
                          </View>
                          <View style={styles.priorityItem}>
                            <View style={styles.priorityLabelRow}>
                              <AppText style={styles.priorityLabel}>Medium</AppText>
                              <AppText style={styles.priorityCount}>
                                {showReportDetail.reportData.priorityDistribution.medium || 0}
                              </AppText>
                            </View>
                            <View style={styles.priorityBarBg}>
                              <View
                                style={[
                                  styles.priorityBarFill,
                                  {
                                    backgroundColor: theme.colors.warning,
                                    width: `${Math.min(
                                      ((showReportDetail.reportData.priorityDistribution.medium || 0) /
                                        (showReportDetail.reportData.totalTasks || 1)) *
                                        100,
                                      100
                                    )}%`,
                                  },
                                ]}
                              />
                            </View>
                          </View>
                          <View style={styles.priorityItem}>
                            <View style={styles.priorityLabelRow}>
                              <AppText style={styles.priorityLabel}>Low</AppText>
                              <AppText style={styles.priorityCount}>
                                {showReportDetail.reportData.priorityDistribution.low || 0}
                              </AppText>
                            </View>
                            <View style={styles.priorityBarBg}>
                              <View
                                style={[
                                  styles.priorityBarFill,
                                  {
                                    backgroundColor: theme.colors.brandGreen,
                                    width: `${Math.min(
                                      ((showReportDetail.reportData.priorityDistribution.low || 0) /
                                        (showReportDetail.reportData.totalTasks || 1)) *
                                        100,
                                      100
                                    )}%`,
                                  },
                                ]}
                              />
                            </View>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Generate Report Modal
  const renderGenerateModal = () => {
    const canGenerate = 
      (reportTypeToGenerate === "project_summary" && selectedProject) ||
      (reportTypeToGenerate === "team_performance" && selectedTeam) ||
      (reportTypeToGenerate === "task_bottlenecks");

    return (
      <Modal
        visible={showGenerateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGenerateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => {
                  setShowGenerateModal(false);
                  setSelectedProject(null);
                  setSelectedTeam(null);
                  setReportTypeToGenerate("project_summary");
                }}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
              <AppText variant="h3" style={styles.modalTitle}>Generate Report</AppText>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Report Type Selection */}
              <AppText style={styles.generateLabel}>Select Report Type:</AppText>
              <View style={styles.reportTypeSelector}>
                <TouchableOpacity
                  style={[
                    styles.reportTypeOption,
                    reportTypeToGenerate === "project_summary" && styles.reportTypeOptionSelected,
                  ]}
                  onPress={() => {
                    setReportTypeToGenerate("project_summary");
                    setSelectedTeam(null);
                  }}
                >
                  <Ionicons
                    name="folder"
                    size={22}
                    color={reportTypeToGenerate === "project_summary" ? theme.colors.brandBlue : theme.colors.textMuted}
                  />
                  <AppText style={[
                    styles.reportTypeText,
                    reportTypeToGenerate === "project_summary" && styles.reportTypeTextSelected
                  ]}>
                    Project
                  </AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.reportTypeOption,
                    reportTypeToGenerate === "team_performance" && styles.reportTypeOptionSelected,
                  ]}
                  onPress={() => {
                    setReportTypeToGenerate("team_performance");
                    setSelectedProject(null);
                  }}
                >
                  <Ionicons
                    name="people"
                    size={22}
                    color={reportTypeToGenerate === "team_performance" ? theme.colors.accentOrange : theme.colors.textMuted}
                  />
                  <AppText style={[
                    styles.reportTypeText,
                    reportTypeToGenerate === "team_performance" && { color: theme.colors.accentOrange }
                  ]}>
                    Team
                  </AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.reportTypeOption,
                    reportTypeToGenerate === "task_bottlenecks" && styles.reportTypeOptionSelected,
                  ]}
                  onPress={() => {
                    setReportTypeToGenerate("task_bottlenecks");
                    setSelectedProject(null);
                    setSelectedTeam(null);
                  }}
                >
                  <Ionicons
                    name="warning"
                    size={22}
                    color={reportTypeToGenerate === "task_bottlenecks" ? theme.colors.danger : theme.colors.textMuted}
                  />
                  <AppText style={[
                    styles.reportTypeText,
                    reportTypeToGenerate === "task_bottlenecks" && { color: theme.colors.danger }
                  ]}>
                    Bottlenecks
                  </AppText>
                </TouchableOpacity>
              </View>

              {/* Project Selection (for project_summary) */}
              {reportTypeToGenerate === "project_summary" && (
                <>
                  <AppText style={styles.generateSubLabel}>Select a project:</AppText>
                  {projects.length === 0 ? (
                    <View style={styles.noProjects}>
                      <Ionicons name="folder-outline" size={40} color={theme.colors.textMuted} />
                      <AppText style={styles.noProjectsText}>No projects available</AppText>
                    </View>
                  ) : (
                    projects.map((project) => (
                      <TouchableOpacity
                        key={project.id}
                        style={[
                          styles.projectOption,
                          selectedProject?.id === project.id && styles.projectOptionSelected,
                        ]}
                        onPress={() => setSelectedProject(project)}
                      >
                        <View style={styles.projectOptionIcon}>
                          <Ionicons
                            name="folder"
                            size={20}
                            color={
                              selectedProject?.id === project.id
                                ? theme.colors.brandBlue
                                : theme.colors.textMuted
                            }
                          />
                        </View>
                        <View style={styles.projectOptionInfo}>
                          <AppText
                            style={[
                              styles.projectOptionName,
                              selectedProject?.id === project.id && styles.projectOptionNameSelected,
                            ]}
                          >
                            {project.name}
                          </AppText>
                          <AppText style={styles.projectOptionStatus}>
                            {project.status || "active"} • {project.progress || 0}% complete
                          </AppText>
                        </View>
                        {selectedProject?.id === project.id && (
                          <Ionicons name="checkmark-circle" size={22} color={theme.colors.brandBlue} />
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </>
              )}

              {/* Team Selection (for team_performance) */}
              {reportTypeToGenerate === "team_performance" && (
                <>
                  <AppText style={styles.generateSubLabel}>Select a team:</AppText>
                  {teams.length === 0 ? (
                    <View style={styles.noProjects}>
                      <Ionicons name="people-outline" size={40} color={theme.colors.textMuted} />
                      <AppText style={styles.noProjectsText}>No teams available</AppText>
                    </View>
                  ) : (
                    teams.map((team) => (
                      <TouchableOpacity
                        key={team.id}
                        style={[
                          styles.projectOption,
                          selectedTeam?.id === team.id && { ...styles.projectOptionSelected, borderColor: theme.colors.accentOrange },
                        ]}
                        onPress={() => setSelectedTeam(team)}
                      >
                        <View style={[styles.projectOptionIcon, { backgroundColor: theme.colors.accentOrange + "20" }]}>
                          <Ionicons
                            name="people"
                            size={20}
                            color={
                              selectedTeam?.id === team.id
                                ? theme.colors.accentOrange
                                : theme.colors.textMuted
                            }
                          />
                        </View>
                        <View style={styles.projectOptionInfo}>
                          <AppText
                            style={[
                              styles.projectOptionName,
                              selectedTeam?.id === team.id && { color: theme.colors.accentOrange },
                            ]}
                          >
                            {team.name}
                          </AppText>
                          <AppText style={styles.projectOptionStatus}>
                            {team.department || "No department"} • {team.currentMemberCount || 0} members
                          </AppText>
                        </View>
                        {selectedTeam?.id === team.id && (
                          <Ionicons name="checkmark-circle" size={22} color={theme.colors.accentOrange} />
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </>
              )}

              {/* Task Bottlenecks Info */}
              {reportTypeToGenerate === "task_bottlenecks" && (
                <View style={styles.bottleneckInfo}>
                  <View style={styles.bottleneckInfoIcon}>
                    <Ionicons name="analytics" size={32} color={theme.colors.danger} />
                  </View>
                  <AppText style={styles.bottleneckInfoTitle}>Task Bottleneck Analysis</AppText>
                  <AppText style={styles.bottleneckInfoText}>
                    This report will analyze all tasks and identify:
                  </AppText>
                  <View style={styles.bottleneckList}>
                    <View style={styles.bottleneckListItem}>
                      <Ionicons name="time" size={16} color={theme.colors.warning} />
                      <AppText style={styles.bottleneckListText}>Overdue tasks</AppText>
                    </View>
                    <View style={styles.bottleneckListItem}>
                      <Ionicons name="ban" size={16} color={theme.colors.danger} />
                      <AppText style={styles.bottleneckListText}>Blocked tasks</AppText>
                    </View>
                    <View style={styles.bottleneckListItem}>
                      <Ionicons name="alert-circle" size={16} color={theme.colors.accentOrange} />
                      <AppText style={styles.bottleneckListText}>High priority pending items</AppText>
                    </View>
                    <View style={styles.bottleneckListItem}>
                      <Ionicons name="trending-down" size={16} color={theme.colors.accentPink} />
                      <AppText style={styles.bottleneckListText}>Slow progress tasks</AppText>
                    </View>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[styles.generateButton, !canGenerate && styles.generateButtonDisabled]}
                onPress={handleGenerateReport}
                disabled={!canGenerate || generating}
              >
                <LinearGradient
                  colors={
                    canGenerate
                      ? reportTypeToGenerate === "project_summary"
                        ? [theme.colors.brandGreen, theme.colors.brandBlue]
                        : reportTypeToGenerate === "team_performance"
                        ? [theme.colors.accentOrange, theme.colors.warning]
                        : [theme.colors.danger, theme.colors.accentPink]
                      : [theme.colors.glass, theme.colors.glass]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.generateButtonGradient}
                >
                  {generating ? (
                    <ActivityIndicator color={theme.colors.textPrimary} />
                  ) : (
                    <>
                      <Ionicons name="analytics" size={20} color={theme.colors.textPrimary} />
                      <AppText style={styles.generateButtonText}>
                        Generate {reportTypeToGenerate === "project_summary" ? "Project" : 
                                  reportTypeToGenerate === "team_performance" ? "Team" : "Bottleneck"} Report
                      </AppText>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
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
        <AppText variant="h2" style={styles.title}>Reports</AppText>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowGenerateModal(true)}
        >
          <Ionicons name="add" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.brandBlue + "20" }]}>
          <Ionicons name="folder" size={20} color={theme.colors.brandBlue} />
          <AppText style={[styles.statValue, { color: theme.colors.brandBlue }]}>
            {reports.filter((r) => r.type === "project_summary").length}
          </AppText>
          <AppText style={styles.statLabel}>Project</AppText>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.accentOrange + "20" }]}>
          <Ionicons name="people" size={20} color={theme.colors.accentOrange} />
          <AppText style={[styles.statValue, { color: theme.colors.accentOrange }]}>
            {reports.filter((r) => r.type === "team_performance").length}
          </AppText>
          <AppText style={styles.statLabel}>Team</AppText>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.danger + "20" }]}>
          <Ionicons name="warning" size={20} color={theme.colors.danger} />
          <AppText style={[styles.statValue, { color: theme.colors.danger }]}>
            {reports.filter((r) => r.type === "task_bottlenecks").length}
          </AppText>
          <AppText style={styles.statLabel}>Bottleneck</AppText>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.brandGreen + "20" }]}>
          <Ionicons name="checkmark-circle" size={20} color={theme.colors.brandGreen} />
          <AppText style={[styles.statValue, { color: theme.colors.brandGreen }]}>
            {reports.filter((r) => r.status === "completed").length}
          </AppText>
          <AppText style={styles.statLabel}>Done</AppText>
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {REPORT_TYPES.map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[styles.filterTab, activeFilter === type.key && styles.filterTabActive]}
            onPress={() => setActiveFilter(type.key)}
          >
            <Ionicons
              name={type.icon}
              size={16}
              color={activeFilter === type.key ? theme.colors.textPrimary : theme.colors.textMuted}
            />
            <AppText
              style={[styles.filterTabText, activeFilter === type.key && styles.filterTabTextActive]}
            >
              {type.label}
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
          data={filteredReports}
          renderItem={renderReport}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={filteredReports.length > 0 ? styles.list : styles.emptyList}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="analytics-outline" size={48} color={theme.colors.textMuted} />
              </View>
              <AppText style={styles.emptyTitle}>No Reports Yet</AppText>
              <AppText style={styles.emptyText}>
                Generate your first project summary report{"\n"}to get insights and analytics.
              </AppText>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setShowGenerateModal(true)}
              >
                <Ionicons name="add-circle" size={20} color={theme.colors.brandBlue} />
                <AppText style={styles.emptyButtonText}>Generate Report</AppText>
              </TouchableOpacity>
            </View>
          }
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      )}

      {renderGenerateModal()}
      {renderReportDetailModal()}
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
  statsRow: {
    flexDirection: "row",
    marginBottom: theme.spacing.sm,
    height: 70,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: theme.spacing.sm,
    marginHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
    height: 70,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  filterScroll: {
    marginBottom: theme.spacing.sm,
    maxHeight: 60,
    minHeight: 60,
  },
  filterContainer: {
    paddingVertical: theme.spacing.xs,
    alignItems: "center",
  },
  filterTab: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: theme.colors.glass,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: 75,
    height: 50,
  },
  filterTabActive: {
    backgroundColor: theme.colors.brandBlue + "30",
    borderColor: theme.colors.brandBlue,
  },
  filterTabText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  filterTabTextActive: {
    color: theme.colors.textPrimary,
  },
  list: {
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  reportInfo: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  reportTitle: {
    fontWeight: "600",
    fontSize: 15,
  },
  reportType: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  dataPreview: {
    flexDirection: "row",
    backgroundColor: theme.colors.glassDark,
    borderRadius: 10,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  dataItem: {
    flex: 1,
    alignItems: "center",
  },
  dataValue: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  dataLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    color: theme.colors.danger,
    marginVertical: theme.spacing.md,
    textAlign: "center",
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
  emptyText: {
    color: theme.colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: 12,
    backgroundColor: theme.colors.brandBlue + "20",
    borderWidth: 1,
    borderColor: theme.colors.brandBlue,
  },
  emptyButtonText: {
    color: theme.colors.brandBlue,
    fontWeight: "500",
    marginLeft: theme.spacing.sm,
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
    maxHeight: "85%",
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
  modalDeleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.danger + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontWeight: "600",
  },
  generateLabel: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    fontWeight: "500",
  },
  generateSubLabel: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
    fontSize: 13,
  },
  reportTypeSelector: {
    flexDirection: "row",
    marginBottom: theme.spacing.md,
  },
  reportTypeOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  reportTypeOptionSelected: {
    backgroundColor: theme.colors.brandBlue + "20",
    borderColor: theme.colors.brandBlue,
  },
  reportTypeText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  reportTypeTextSelected: {
    color: theme.colors.brandBlue,
    fontWeight: "500",
  },
  bottleneckInfo: {
    alignItems: "center",
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.glass,
    borderRadius: 14,
    marginTop: theme.spacing.md,
  },
  bottleneckInfoIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.danger + "20",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  bottleneckInfoTitle: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: theme.spacing.sm,
  },
  bottleneckInfoText: {
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  bottleneckList: {
    alignSelf: "stretch",
  },
  bottleneckListItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.glassDark,
    borderRadius: 8,
    marginBottom: 6,
  },
  bottleneckListText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginLeft: theme.spacing.sm,
  },
  noProjects: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
  },
  noProjectsText: {
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
  projectOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    borderRadius: 12,
    backgroundColor: theme.colors.glass,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  projectOptionSelected: {
    backgroundColor: theme.colors.brandBlue + "20",
    borderColor: theme.colors.brandBlue,
  },
  projectOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.colors.glassDark,
    alignItems: "center",
    justifyContent: "center",
  },
  projectOptionInfo: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  projectOptionName: {
    fontWeight: "500",
  },
  projectOptionNameSelected: {
    color: theme.colors.brandBlue,
  },
  projectOptionStatus: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    textTransform: "capitalize",
  },
  generateButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
  },
  generateButtonText: {
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
  },
  // Detail modal
  detailSection: {
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  detailIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  detailTitle: {
    fontWeight: "700",
    textAlign: "center",
    marginBottom: theme.spacing.sm,
  },
  detailTypeBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
  },
  detailTypeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  detailLabel: {
    color: theme.colors.textSecondary,
  },
  detailValue: {
    fontWeight: "500",
  },
  reportDataSection: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
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
  prioritySection: {
    marginTop: theme.spacing.lg,
  },
  subSectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginBottom: theme.spacing.md,
  },
  priorityBars: {},
  priorityItem: {
    marginBottom: theme.spacing.md,
  },
  priorityLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  priorityLabel: {
    fontSize: 13,
  },
  priorityCount: {
    fontSize: 13,
    fontWeight: "600",
  },
  priorityBarBg: {
    height: 8,
    backgroundColor: theme.colors.glass,
    borderRadius: 4,
    overflow: "hidden",
  },
  priorityBarFill: {
    height: "100%",
    borderRadius: 4,
  },
});

export default ReportsScreen;
