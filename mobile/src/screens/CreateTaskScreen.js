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
import { Formik } from "formik";
import * as Yup from "yup";
import AppText from "../components/AppText";
import AppCard from "../components/AppCard";
import ScreenContainer from "../components/ScreenContainer";
import theme from "../theme";
import { api } from "../services/api";

const PRIORITIES = [
  { id: "low", label: "Low", color: theme.colors.textMuted },
  { id: "medium", label: "Medium", color: theme.colors.warning },
  { id: "high", label: "High", color: theme.colors.accentOrange },
];

const TYPES = [
  { id: "feature", label: "Feature", icon: "sparkles" },
  { id: "bug", label: "Bug", icon: "bug" },
  { id: "task", label: "Task", icon: "checkbox" },
];

const HOURS_OPTIONS = [1, 2, 4, 8, 16, 24, 40];

const CreateTaskSchema = Yup.object().shape({
  title: Yup.string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters")
    .required("Task title is required"),
  description: Yup.string()
    .trim()
    .max(500, "Description cannot exceed 500 characters"),
  projectId: Yup.string().required("Please select a project"),
  priority: Yup.string()
    .oneOf(["low", "medium", "high"], "Invalid priority")
    .required("Priority is required"),
  type: Yup.string()
    .oneOf(["feature", "bug", "task"], "Invalid task type")
    .required("Task type is required"),
  assignedTo: Yup.string().required("Please assign to a user"),
  deadline: Yup.object()
    .shape({
      day: Yup.string().test(
        "valid-day",
        "Day must be between 1 and 31",
        function (value) {
          if (!value) return true;
          const { month, year } = this.parent;
          if (value || month || year) {
            if (!value || !month || !year) {
              return this.createError({
                message: "Complete the date (DD/MM/YYYY)",
              });
            }
            const d = parseInt(value);
            return d >= 1 && d <= 31;
          }
          return true;
        },
      ),
      month: Yup.string().test(
        "valid-month",
        "Month must be between 1 and 12",
        function (value) {
          if (!value) return true;
          const { day, year } = this.parent;
          if (value || day || year) {
            if (!value || !day || !year) {
              return this.createError({
                message: "Complete the date (DD/MM/YYYY)",
              });
            }
            const m = parseInt(value);
            return m >= 1 && m <= 12;
          }
          return true;
        },
      ),
      year: Yup.string().test(
        "valid-year",
        "Year must be between 2024 and 2030",
        function (value) {
          if (!value) return true;
          const { day, month } = this.parent;
          if (value || day || month) {
            if (!value || !day || !month) {
              return this.createError({
                message: "Complete the date (DD/MM/YYYY)",
              });
            }
            const y = parseInt(value);
            return y >= 2024 && y <= 2030;
          }
          return true;
        },
      ),
    })
    .test("deadline-required", "Deadline is required", function (value) {
      return !!(value?.day && value?.month && value?.year);
    }),
  estimatedHours: Yup.string().test(
    "valid-hours",
    "Hours must be between 1 and 999",
    function (value) {
      if (!value) return true;
      const hours = parseInt(value);
      return hours >= 1 && hours <= 999;
    },
  ),
});

const CreateTaskScreen = ({ navigation, route, user }) => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsRes, usersRes, teamsRes] = await Promise.all([
          api.getProjects(),
          api.getUsers(),
          api.getTeams(),
        ]);
        setProjects(projectsRes.data || []);
        setUsers(usersRes.data || []);
        setTeams(teamsRes.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <AppText variant="h3" style={styles.headerTitle}>
            New Task
          </AppText>
          <View style={{ width: 40 }} />
        </View>

        <Formik
          initialValues={{
            title: "",
            description: "",
            priority: "medium",
            type: "task",
            projectId: route.params?.projectId || "",
            assignedTo: "",
            deadline: { day: "", month: "", year: "" },
            estimatedHours: "",
          }}
          validationSchema={CreateTaskSchema}
          validateOnChange={true}
          validateOnBlur={true}
          onSubmit={async (values, { setSubmitting, setStatus }) => {
            setStatus("");
            try {
              const { year, month, day } = values.deadline;
              const formattedDeadline =
                year && month && day
                  ? `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
                  : undefined;

              await api.createTask({
                title: values.title.trim(),
                description: values.description.trim(),
                priority: values.priority,
                type: values.type,
                projectId: values.projectId,
                assignedTo: values.assignedTo,
                deadline: formattedDeadline,
                estimatedHours: values.estimatedHours
                  ? parseInt(values.estimatedHours)
                  : undefined,
              });
              navigation.goBack();
            } catch (err) {
              setStatus(err.message || "Failed to create task");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            isSubmitting,
            status,
            setFieldValue,
            setFieldTouched,
          }) => (
            <View style={styles.form}>
              {/* Title */}
              <View style={styles.inputGroup}>
                <AppText style={styles.label}>Title</AppText>
                <TextInput
                  style={[styles.input, styles.titleInput]}
                  placeholder="Enter task title..."
                  placeholderTextColor={theme.colors.textMuted}
                  value={values.title}
                  onChangeText={handleChange("title")}
                  onBlur={handleBlur("title")}
                  maxLength={100}
                />
                <View style={styles.inputFooter}>
                  <AppText style={styles.charCount}>
                    {values.title.length}/100
                  </AppText>
                  {touched.title && errors.title && (
                    <AppText style={styles.fieldError}>{errors.title}</AppText>
                  )}
                </View>
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <AppText style={styles.label}>Description</AppText>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Add more details about this task..."
                  placeholderTextColor={theme.colors.textMuted}
                  value={values.description}
                  onChangeText={handleChange("description")}
                  onBlur={handleBlur("description")}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  maxLength={500}
                />
                {touched.description && errors.description && (
                  <AppText style={styles.fieldError}>
                    {errors.description}
                  </AppText>
                )}
              </View>

              {/* Project Selection */}
              <View style={styles.inputGroup}>
                <AppText style={styles.label}>Project</AppText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontalScroll}
                >
                  {projects.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.projectChip,
                        values.projectId === p.id && styles.projectChipActive,
                      ]}
                      onPress={() => {
                        setFieldValue("projectId", p.id);
                        setFieldTouched("projectId", true);
                      }}
                    >
                      <Ionicons
                        name="folder"
                        size={14}
                        color={
                          values.projectId === p.id
                            ? theme.colors.textPrimary
                            : theme.colors.textSecondary
                        }
                      />
                      <AppText
                        style={[
                          styles.projectChipText,
                          values.projectId === p.id &&
                            styles.projectChipTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {p.name}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                  {projects.length === 0 && (
                    <AppText style={styles.noData}>
                      No projects available
                    </AppText>
                  )}
                </ScrollView>
                {touched.projectId && errors.projectId && (
                  <AppText style={styles.fieldError}>
                    {errors.projectId}
                  </AppText>
                )}
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
                        values.priority === p.id && {
                          backgroundColor: p.color,
                          borderColor: p.color,
                        },
                      ]}
                      onPress={() => {
                        setFieldValue("priority", p.id);
                        setFieldTouched("priority", true);
                      }}
                    >
                      <View
                        style={[
                          styles.priorityDot,
                          { backgroundColor: p.color },
                        ]}
                      />
                      <AppText
                        style={[
                          styles.priorityText,
                          values.priority === p.id && styles.priorityTextActive,
                        ]}
                      >
                        {p.label}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </View>
                {touched.priority && errors.priority && (
                  <AppText style={styles.fieldError}>{errors.priority}</AppText>
                )}
              </View>

              {/* Type */}
              <View style={styles.inputGroup}>
                <AppText style={styles.label}>Type</AppText>
                <View style={styles.optionsRow}>
                  {TYPES.map((t) => (
                    <TouchableOpacity
                      key={t.id}
                      style={[
                        styles.typeChip,
                        values.type === t.id && styles.typeChipActive,
                      ]}
                      onPress={() => {
                        setFieldValue("type", t.id);
                        setFieldTouched("type", true);
                      }}
                    >
                      <Ionicons
                        name={t.icon}
                        size={16}
                        color={
                          values.type === t.id
                            ? theme.colors.textPrimary
                            : theme.colors.textMuted
                        }
                      />
                      <AppText
                        style={[
                          styles.typeText,
                          values.type === t.id && styles.typeTextActive,
                        ]}
                      >
                        {t.label}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </View>
                {touched.type && errors.type && (
                  <AppText style={styles.fieldError}>{errors.type}</AppText>
                )}
              </View>

              {/* Deadline - Required */}
              <View style={styles.inputGroup}>
                <AppText style={styles.label}>Deadline *</AppText>
                <View style={styles.dateRow}>
                  <View style={styles.dateInput}>
                    <AppText style={styles.dateLabel}>Day</AppText>
                    <TextInput
                      style={styles.dateField}
                      placeholder="DD"
                      placeholderTextColor={theme.colors.textMuted}
                      value={values.deadline.day}
                      onChangeText={(text) => {
                        setFieldValue(
                          "deadline.day",
                          text.replace(/[^0-9]/g, "").slice(0, 2),
                        );
                        setFieldTouched("deadline.day", true);
                      }}
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
                      value={values.deadline.month}
                      onChangeText={(text) => {
                        setFieldValue(
                          "deadline.month",
                          text.replace(/[^0-9]/g, "").slice(0, 2),
                        );
                        setFieldTouched("deadline.month", true);
                      }}
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
                      value={values.deadline.year}
                      onChangeText={(text) => {
                        setFieldValue(
                          "deadline.year",
                          text.replace(/[^0-9]/g, "").slice(0, 4),
                        );
                        setFieldTouched("deadline.year", true);
                      }}
                      keyboardType="number-pad"
                      maxLength={4}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.todayButton}
                    onPress={() => {
                      const today = new Date();
                      setFieldValue("deadline", {
                        day: String(today.getDate()),
                        month: String(today.getMonth() + 1),
                        year: String(today.getFullYear()),
                      });
                      setFieldTouched("deadline", true);
                    }}
                  >
                    <Ionicons
                      name="today"
                      size={18}
                      color={theme.colors.brandGreen}
                    />
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
                        setFieldValue("deadline", {
                          day: String(date.getDate()),
                          month: String(date.getMonth() + 1),
                          year: String(date.getFullYear()),
                        });
                        setFieldTouched("deadline", true);
                      }}
                    >
                      <AppText style={styles.quickDateText}>
                        {option.label}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </View>
                {touched.deadline &&
                  (errors.deadline?.day ||
                    errors.deadline?.month ||
                    errors.deadline?.year ||
                    errors.deadline) && (
                    <AppText style={styles.fieldError}>
                      {errors.deadline?.day ||
                        errors.deadline?.month ||
                        errors.deadline?.year ||
                        (typeof errors.deadline === "string"
                          ? errors.deadline
                          : "")}
                    </AppText>
                  )}
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
                        values.estimatedHours === String(hours) &&
                          styles.hoursChipActive,
                      ]}
                      onPress={() => {
                        setFieldValue("estimatedHours", String(hours));
                        setFieldTouched("estimatedHours", true);
                      }}
                    >
                      <AppText
                        style={[
                          styles.hoursText,
                          values.estimatedHours === String(hours) &&
                            styles.hoursTextActive,
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
                      value={
                        HOURS_OPTIONS.includes(parseInt(values.estimatedHours))
                          ? ""
                          : values.estimatedHours
                      }
                      onChangeText={(text) => {
                        setFieldValue(
                          "estimatedHours",
                          text.replace(/[^0-9]/g, ""),
                        );
                        setFieldTouched("estimatedHours", true);
                      }}
                      keyboardType="number-pad"
                      maxLength={3}
                    />
                    <AppText style={styles.customHoursLabel}>hrs</AppText>
                  </View>
                </View>
                {touched.estimatedHours && errors.estimatedHours && (
                  <AppText style={styles.fieldError}>
                    {errors.estimatedHours}
                  </AppText>
                )}
              </View>

              {/* Assign To (Single User) */}
              <View style={styles.inputGroup}>
                <AppText style={styles.label}>Assign To *</AppText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontalScroll}
                >
                  {users.filter((u) => u.role !== "admin").map((u) => {
                    const isSelected = values.assignedTo === u.id;
                    return (
                      <TouchableOpacity
                        key={u.id}
                        style={[
                          styles.userChip,
                          isSelected && styles.userChipActive,
                        ]}
                        onPress={() => {
                          setFieldValue("assignedTo", u.id);
                          setFieldTouched("assignedTo", true);
                        }}
                      >
                        <View
                          style={[
                            styles.userAvatar,
                            isSelected && styles.userAvatarActive,
                          ]}
                        >
                          <AppText style={styles.userAvatarText}>
                            {u.firstName?.[0]}
                          </AppText>
                        </View>
                        <AppText
                          style={[
                            styles.userName,
                            isSelected && styles.userNameActive,
                          ]}
                        >
                          {u.firstName}
                        </AppText>
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color={theme.colors.brandGreen}
                            style={{ marginLeft: 4 }}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                {touched.assignedTo && errors.assignedTo && (
                  <AppText style={styles.fieldError}>
                    {errors.assignedTo}
                  </AppText>
                )}
              </View>

              {/* Error Message */}
              {status ? (
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="alert-circle"
                    size={18}
                    color={theme.colors.danger}
                  />
                  <AppText style={styles.errorText}>{status}</AppText>
                </View>
              ) : null}

              {/* Create Button */}
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <LinearGradient
                  colors={[theme.colors.brandGreen, theme.colors.brandBlue]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={theme.colors.textPrimary} />
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={theme.colors.textPrimary}
                      />
                      <AppText style={styles.createButtonText}>
                        Create Task
                      </AppText>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </Formik>

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
  inputFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  fieldError: {
    color: theme.colors.danger,
    fontSize: 12,
    marginTop: theme.spacing.xs,
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
  orDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: theme.spacing.lg,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.glassDark,
  },
  orText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginHorizontal: theme.spacing.md,
    fontWeight: "500",
  },
  teamChip: {
    alignItems: "center",
    marginRight: theme.spacing.md,
    padding: theme.spacing.sm,
    borderRadius: 12,
  },
  teamAvatar: {
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
