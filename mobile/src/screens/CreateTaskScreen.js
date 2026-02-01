import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AppText from "../components/AppText";
import AppCard from "../components/AppCard";
import ScreenContainer from "../components/ScreenContainer";
import theme from "../theme";
import { api } from "../services/api";

const PRIORITIES = [
  { id: "low", label: "Low", color: theme.colors.textMuted },
  { id: "medium", label: "Medium", color: theme.colors.warning },
  { id: "high", label: "High", color: theme.colors.accentOrange },
  { id: "critical", label: "Critical", color: theme.colors.danger },
];

const TYPES = [
  { id: "feature", label: "Feature", icon: "sparkles" },
  { id: "bug", label: "Bug", icon: "bug" },
  { id: "task", label: "Task", icon: "checkbox" },
];

const HOURS_OPTIONS = [1, 2, 4, 8, 16, 24, 40];

const CreateTaskScreen = ({ navigation, route, user }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [type, setType] = useState("task");
  const [projectId, setProjectId] = useState(route.params?.projectId || "");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState({ day: "", month: "", year: "" });
  const [estimatedHours, setEstimatedHours] = useState("");
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showHoursPicker, setShowHoursPicker] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsRes, usersRes] = await Promise.all([
          api.getProjects(),
          api.getUsers(),
        ]);
        setProjects(projectsRes.data || []);
        setUsers(usersRes.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  const formatDate = () => {
    const { year, month, day } = dueDate;
    if (year && month && day) {
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    return "";
  };

  const validateForm = () => {
    if (!title.trim()) {
      setError("Please enter a task title");
      return false;
    }
    if (title.trim().length < 3) {
      setError("Title must be at least 3 characters");
      return false;
    }
    if (!projectId) {
      setError("Please select a project");
      return false;
    }
    // Validate date if partially filled
    const { year, month, day } = dueDate;
    if (year || month || day) {
      if (!year || !month || !day) {
        setError("Please complete the due date (DD/MM/YYYY)");
        return false;
      }
      const y = parseInt(year);
      const m = parseInt(month);
      const d = parseInt(day);
      if (y < 2024 || y > 2030) {
        setError("Year must be between 2024 and 2030");
        return false;
      }
      if (m < 1 || m > 12) {
        setError("Month must be between 1 and 12");
        return false;
      }
      if (d < 1 || d > 31) {
        setError("Day must be between 1 and 31");
        return false;
      }
    }
    return true;
  };

  const handleCreate = async () => {
    setError("");
    if (!validateForm()) return;

    setLoading(true);
    try {
      await api.createTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        type,
        projectId,
        assignedTo: assignedTo || undefined,
        deadline: formatDate() || undefined,
        estimatedHours: estimatedHours ? parseInt(estimatedHours) : undefined,
      });
      navigation.goBack();
    } catch (err) {
      setError(err.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const selectedProject = projects.find((p) => p.id === projectId);

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <AppText variant="h3" style={styles.headerTitle}>New Task</AppText>
          <View style={{ width: 40 }} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Title */}
          <View style={styles.inputGroup}>
            <AppText style={styles.label}>Title</AppText>
            <TextInput
              style={[styles.input, styles.titleInput]}
              placeholder="Enter task title..."
              placeholderTextColor={theme.colors.textMuted}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            <AppText style={styles.charCount}>{title.length}/100</AppText>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <AppText style={styles.label}>Description</AppText>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add more details about this task..."
              placeholderTextColor={theme.colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Project Selection */}
          <View style={styles.inputGroup}>
            <AppText style={styles.label}>Project</AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {projects.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.projectChip, projectId === p.id && styles.projectChipActive]}
                  onPress={() => setProjectId(p.id)}
                >
                  <Ionicons 
                    name="folder" 
                    size={14} 
                    color={projectId === p.id ? theme.colors.textPrimary : theme.colors.textSecondary} 
                  />
                  <AppText
                    style={[styles.projectChipText, projectId === p.id && styles.projectChipTextActive]}
                    numberOfLines={1}
                  >
                    {p.name}
                  </AppText>
                </TouchableOpacity>
              ))}
              {projects.length === 0 && (
                <AppText style={styles.noData}>No projects available</AppText>
              )}
            </ScrollView>
          </View>

          {/* Priority */}
          <View style={styles.inputGroup}>
            <AppText style={styles.label}>Priority</AppText>
            <View style={styles.optionsRow}>
              {PRIORITIES.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.priorityChip,
                    priority === p.id && { backgroundColor: p.color, borderColor: p.color },
                  ]}
                  onPress={() => setPriority(p.id)}
                >
                  <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
                  <AppText
                    style={[styles.priorityText, priority === p.id && styles.priorityTextActive]}
                  >
                    {p.label}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Type */}
          <View style={styles.inputGroup}>
            <AppText style={styles.label}>Type</AppText>
            <View style={styles.optionsRow}>
              {TYPES.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.typeChip, type === t.id && styles.typeChipActive]}
                  onPress={() => setType(t.id)}
                >
                  <Ionicons 
                    name={t.icon} 
                    size={16} 
                    color={type === t.id ? theme.colors.textPrimary : theme.colors.textMuted} 
                  />
                  <AppText style={[styles.typeText, type === t.id && styles.typeTextActive]}>
                    {t.label}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Due Date - Improved */}
          <View style={styles.inputGroup}>
            <AppText style={styles.label}>Due Date</AppText>
            <View style={styles.dateRow}>
              <View style={styles.dateInput}>
                <AppText style={styles.dateLabel}>Day</AppText>
                <TextInput
                  style={styles.dateField}
                  placeholder="DD"
                  placeholderTextColor={theme.colors.textMuted}
                  value={dueDate.day}
                  onChangeText={(text) => setDueDate({ ...dueDate, day: text.replace(/[^0-9]/g, "").slice(0, 2) })}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
              <AppText style={styles.dateSeparator}>/</AppText>
              <View style={styles.dateInput}>
                <AppText style={styles.dateLabel}>Month</AppText>
                <TextInput
                  style={styles.dateField}
                  placeholder="MM"
                  placeholderTextColor={theme.colors.textMuted}
                  value={dueDate.month}
                  onChangeText={(text) => setDueDate({ ...dueDate, month: text.replace(/[^0-9]/g, "").slice(0, 2) })}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
              <AppText style={styles.dateSeparator}>/</AppText>
              <View style={[styles.dateInput, { flex: 1.5 }]}>
                <AppText style={styles.dateLabel}>Year</AppText>
                <TextInput
                  style={styles.dateField}
                  placeholder="YYYY"
                  placeholderTextColor={theme.colors.textMuted}
                  value={dueDate.year}
                  onChangeText={(text) => setDueDate({ ...dueDate, year: text.replace(/[^0-9]/g, "").slice(0, 4) })}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>
              <TouchableOpacity 
                style={styles.todayButton}
                onPress={() => {
                  const today = new Date();
                  setDueDate({
                    day: String(today.getDate()),
                    month: String(today.getMonth() + 1),
                    year: String(today.getFullYear()),
                  });
                }}
              >
                <Ionicons name="today" size={18} color={theme.colors.brandGreen} />
              </TouchableOpacity>
            </View>
            <View style={styles.quickDates}>
              {[
                { label: "Today", days: 0 },
                { label: "Tomorrow", days: 1 },
                { label: "+1 Week", days: 7 },
                { label: "+2 Weeks", days: 14 },
              ].map((option) => (
                <TouchableOpacity
                  key={option.label}
                  style={styles.quickDateChip}
                  onPress={() => {
                    const date = new Date();
                    date.setDate(date.getDate() + option.days);
                    setDueDate({
                      day: String(date.getDate()),
                      month: String(date.getMonth() + 1),
                      year: String(date.getFullYear()),
                    });
                  }}
                >
                  <AppText style={styles.quickDateText}>{option.label}</AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Estimated Hours - Improved */}
          <View style={styles.inputGroup}>
            <AppText style={styles.label}>Estimated Hours</AppText>
            <View style={styles.hoursContainer}>
              {HOURS_OPTIONS.map((hours) => (
                <TouchableOpacity
                  key={hours}
                  style={[
                    styles.hoursChip,
                    estimatedHours === String(hours) && styles.hoursChipActive,
                  ]}
                  onPress={() => setEstimatedHours(String(hours))}
                >
                  <AppText
                    style={[
                      styles.hoursText,
                      estimatedHours === String(hours) && styles.hoursTextActive,
                    ]}
                  >
                    {hours}h
                  </AppText>
                </TouchableOpacity>
              ))}
              <View style={styles.customHoursWrapper}>
                <TextInput
                  style={styles.customHoursInput}
                  placeholder="Other"
                  placeholderTextColor={theme.colors.textMuted}
                  value={HOURS_OPTIONS.includes(parseInt(estimatedHours)) ? "" : estimatedHours}
                  onChangeText={(text) => setEstimatedHours(text.replace(/[^0-9]/g, ""))}
                  keyboardType="number-pad"
                  maxLength={3}
                />
                <AppText style={styles.customHoursLabel}>hrs</AppText>
              </View>
            </View>
          </View>

          {/* Assign To */}
          <View style={styles.inputGroup}>
            <AppText style={styles.label}>Assign To</AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              <TouchableOpacity
                style={[styles.userChip, !assignedTo && styles.userChipActive]}
                onPress={() => setAssignedTo("")}
              >
                <View style={[styles.userAvatar, !assignedTo && styles.userAvatarActive]}>
                  <Ionicons name="person-outline" size={16} color={theme.colors.textSecondary} />
                </View>
                <AppText style={[styles.userName, !assignedTo && styles.userNameActive]}>
                  Unassigned
                </AppText>
              </TouchableOpacity>
              {users.map((u) => (
                <TouchableOpacity
                  key={u.id}
                  style={[styles.userChip, assignedTo === u.id && styles.userChipActive]}
                  onPress={() => setAssignedTo(u.id)}
                >
                  <View style={[styles.userAvatar, assignedTo === u.id && styles.userAvatarActive]}>
                    <AppText style={styles.userAvatarText}>{u.firstName?.[0]}</AppText>
                  </View>
                  <AppText style={[styles.userName, assignedTo === u.id && styles.userNameActive]}>
                    {u.firstName}
                  </AppText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={18} color={theme.colors.danger} />
              <AppText style={styles.errorText}>{error}</AppText>
            </View>
          ) : null}

          {/* Create Button */}
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreate}
            disabled={loading}
          >
            <LinearGradient
              colors={[theme.colors.brandGreen, theme.colors.brandBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.textPrimary} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={22} color={theme.colors.textPrimary} />
                  <AppText style={styles.createButtonText}>Create Task</AppText>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

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
  form: {
    backgroundColor: theme.colors.glass,
    borderRadius: 20,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
    marginBottom: theme.spacing.sm,
  },
  input: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: 15,
  },
  titleInput: {
    backgroundColor: theme.colors.glassDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  charCount: {
    color: theme.colors.textMuted,
    fontSize: 11,
    textAlign: "right",
    marginTop: 4,
  },
  textArea: {
    minHeight: 80,
    paddingTop: theme.spacing.md,
    backgroundColor: theme.colors.glassDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  horizontalScroll: {
    marginHorizontal: -theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  projectChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.glassDark,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
  },
  projectChipActive: {
    backgroundColor: theme.colors.brandBlue,
    borderColor: theme.colors.brandBlue,
  },
  projectChipText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginLeft: 6,
    maxWidth: 120,
  },
  projectChipTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
  noData: {
    color: theme.colors.textMuted,
    fontStyle: "italic",
    paddingVertical: theme.spacing.sm,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  priorityChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.glassDark,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  priorityTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 12,
    backgroundColor: theme.colors.glassDark,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  typeChipActive: {
    backgroundColor: theme.colors.brandBlue,
    borderColor: theme.colors.brandBlue,
  },
  typeText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginLeft: 6,
  },
  typeTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  dateInput: {
    flex: 1,
  },
  dateLabel: {
    color: theme.colors.textMuted,
    fontSize: 10,
    marginBottom: 4,
  },
  dateField: {
    backgroundColor: theme.colors.glassDark,
    borderRadius: 10,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.textPrimary,
    fontSize: 16,
    textAlign: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dateSeparator: {
    color: theme.colors.textMuted,
    fontSize: 20,
    marginHorizontal: 6,
    marginBottom: 8,
  },
  todayButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.colors.brandGreen + "20",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: theme.spacing.sm,
  },
  quickDates: {
    flexDirection: "row",
    marginTop: theme.spacing.sm,
  },
  quickDateChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: theme.colors.glassDark,
    marginRight: theme.spacing.sm,
  },
  quickDateText: {
    color: theme.colors.brandGreen,
    fontSize: 11,
    fontWeight: "500",
  },
  hoursContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  hoursChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 10,
    backgroundColor: theme.colors.glassDark,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  hoursChipActive: {
    backgroundColor: theme.colors.brandGreen,
    borderColor: theme.colors.brandGreen,
  },
  hoursText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  hoursTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
  customHoursWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  customHoursInput: {
    backgroundColor: theme.colors.glassDark,
    borderRadius: 10,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.textPrimary,
    fontSize: 13,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: 60,
    textAlign: "center",
  },
  customHoursLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginLeft: 4,
  },
  userChip: {
    alignItems: "center",
    marginRight: theme.spacing.md,
    padding: theme.spacing.sm,
    borderRadius: 12,
  },
  userChipActive: {
    backgroundColor: theme.colors.brandGreen + "20",
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.glassDark,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  userAvatarActive: {
    backgroundColor: theme.colors.brandGreen,
    borderColor: theme.colors.brandGreen,
  },
  userAvatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  userName: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  userNameActive: {
    color: theme.colors.brandGreen,
    fontWeight: "500",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.danger + "15",
    borderRadius: 10,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 13,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  createButton: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: theme.colors.glowGreen,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.lg,
  },
  createButtonText: {
    fontWeight: "600",
    fontSize: 16,
    marginLeft: theme.spacing.sm,
  },
});

export default CreateTaskScreen;
