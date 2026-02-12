import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
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

const PRIORITIES = ["low", "medium", "high"];

const CreateProjectSchema = Yup.object()
  .shape({
    name: Yup.string()
      .trim()
      .min(3, "Project name must be at least 3 characters")
      .max(100, "Project name cannot exceed 100 characters")
      .required("Project name is required"),
    description: Yup.string()
      .trim()
      .max(500, "Description cannot exceed 500 characters"),
    priority: Yup.string()
      .oneOf(["low", "medium", "high"], "Invalid priority")
      .required("Priority is required"),
    teamId: Yup.string().required("Please assign a team to this project"),
    startDate: Yup.object().shape({
      day: Yup.string()
        .test("valid-day", "Day must be between 1 and 31", function (value) {
          if (!value) return true;
          const { month, year } = this.parent;
          if (value || month || year) {
            if (!value || !month || !year) {
              return this.createError({
                message: "Complete the start date (DD/MM/YYYY)",
              });
            }
            const d = parseInt(value);
            return d >= 1 && d <= 31;
          }
          return true;
        })
        .test(
          "not-in-past",
          "Start date cannot be in the past",
          function (value) {
            if (!value) return true;
            const { month, year } = this.parent;
            if (!value || !month || !year) return true;

            const selectedDate = new Date(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(value),
            );
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
              return this.createError({
                message: "Start date must be today or in the future",
              });
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
                message: "Complete the start date (DD/MM/YYYY)",
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
                message: "Complete the start date (DD/MM/YYYY)",
              });
            }
            const y = parseInt(value);
            return y >= 2024 && y <= 2030;
          }
          return true;
        },
      ),
    }),
    endDate: Yup.object().shape({
      day: Yup.string()
        .test("valid-day", "Day must be between 1 and 31", function (value) {
          if (!value) return true;
          const { month, year } = this.parent;
          if (value || month || year) {
            if (!value || !month || !year) {
              return this.createError({
                message: "Complete the end date (DD/MM/YYYY)",
              });
            }
            const d = parseInt(value);
            return d >= 1 && d <= 31;
          }
          return true;
        })
        .test(
          "not-before-tomorrow",
          "End date must be at least tomorrow",
          function (value) {
            if (!value) return true;
            const { month, year } = this.parent;
            if (!value || !month || !year) return true;

            const selectedDate = new Date(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(value),
            );
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            if (selectedDate < tomorrow) {
              return this.createError({
                message: "End date must be tomorrow or later",
              });
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
                message: "Complete the end date (DD/MM/YYYY)",
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
                message: "Complete the end date (DD/MM/YYYY)",
              });
            }
            const y = parseInt(value);
            return y >= 2024 && y <= 2030;
          }
          return true;
        },
      ),
    }),
  })
  .test(
    "end-after-start",
    "End date must be after start date",
    function (values) {
      const { startDate, endDate } = values;
      if (!startDate.year || !startDate.month || !startDate.day) return true;
      if (!endDate.year || !endDate.month || !endDate.day) return true;

      const start = new Date(
        parseInt(startDate.year),
        parseInt(startDate.month) - 1,
        parseInt(startDate.day),
      );
      const end = new Date(
        parseInt(endDate.year),
        parseInt(endDate.month) - 1,
        parseInt(endDate.day),
      );

      if (end < start) {
        return this.createError({
          path: "endDate.year",
          message: "End date must be after start date",
        });
      }
      return true;
    },
  );

const CreateProjectScreen = ({ navigation, user }) => {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const response = await api.getTeams();
        setTeams(response.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadTeams();
  }, []);

  // Helper to format date from day/month/year
  const formatDate = (day, month, year) => {
    if (!day || !month || !year) return null;
    const d = day.padStart(2, "0");
    const m = month.padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  // Set date from Date object
  const setDateFromObj = (date, type, setFieldValue) => {
    const d = date.getDate().toString();
    const m = (date.getMonth() + 1).toString();
    const y = date.getFullYear().toString();

    if (type === "start") {
      setFieldValue("startDate.day", d);
      setFieldValue("startDate.month", m);
      setFieldValue("startDate.year", y);
    } else {
      setFieldValue("endDate.day", d);
      setFieldValue("endDate.month", m);
      setFieldValue("endDate.year", y);
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case "high":
        return theme.colors.danger;
      case "medium":
        return theme.colors.warning;
      default:
        return theme.colors.brandGreen;
    }
  };

  const getPriorityIcon = (p) => {
    switch (p) {
      case "high":
        return "alert-circle";
      case "medium":
        return "remove-circle";
      default:
        return "checkmark-circle";
    }
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <AppText variant="h3" style={styles.headerTitle}>
            New Project
          </AppText>
          <View style={{ width: 40 }} />
        </View>

        <Formik
          initialValues={{
            name: "",
            description: "",
            priority: "medium",
            teamId: "",
            startDate: { day: "", month: "", year: "" },
            endDate: { day: "", month: "", year: "" },
          }}
          validationSchema={CreateProjectSchema}
          validateOnChange={true}
          validateOnBlur={true}
          onSubmit={async (values, { setSubmitting, setStatus }) => {
            setStatus("");
            try {
              const startDate = formatDate(
                values.startDate.day,
                values.startDate.month,
                values.startDate.year,
              );
              const endDate = formatDate(
                values.endDate.day,
                values.endDate.month,
                values.endDate.year,
              );

              await api.createProject({
                name: values.name.trim(),
                description: values.description.trim(),
                priority: values.priority,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                teamId: values.teamId || undefined,
              });
              navigation.goBack();
            } catch (err) {
              setStatus(err.message || "Failed to create project");
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
          }) => (
            <AppCard accentColor={theme.colors.brandGreen}>
              {/* Project Name */}
              <View style={styles.inputGroup}>
                <AppText style={styles.label}>Project Name</AppText>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter project name..."
                    placeholderTextColor={theme.colors.textMuted}
                    value={values.name}
                    onChangeText={handleChange("name")}
                    onBlur={handleBlur("name")}
                    maxLength={100}
                  />
                  <AppText style={styles.charCount}>
                    {values.name.length}/100
                  </AppText>
                </View>
                {touched.name && errors.name ? (
                  <AppText style={styles.errorText}>{errors.name}</AppText>
                ) : null}
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <AppText style={styles.label}>Description</AppText>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe your project goals and scope..."
                    placeholderTextColor={theme.colors.textMuted}
                    value={values.description}
                    onChangeText={handleChange("description")}
                    onBlur={handleBlur("description")}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    maxLength={500}
                  />
                  <AppText style={styles.charCount}>
                    {values.description.length}/500
                  </AppText>
                </View>
                {touched.description && errors.description ? (
                  <AppText style={styles.errorText}>
                    {errors.description}
                  </AppText>
                ) : null}
              </View>

              {/* Priority */}
              <View style={styles.inputGroup}>
                <AppText style={styles.label}>Priority</AppText>
                <View style={styles.chipRow}>
                  {PRIORITIES.map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.priorityChip,
                        values.priority === p && {
                          backgroundColor: getPriorityColor(p) + "25",
                          borderColor: getPriorityColor(p),
                        },
                      ]}
                      onPress={() => setFieldValue("priority", p)}
                    >
                      <Ionicons
                        name={getPriorityIcon(p)}
                        size={16}
                        color={
                          values.priority === p
                            ? getPriorityColor(p)
                            : theme.colors.textMuted
                        }
                        style={{ marginRight: 6 }}
                      />
                      <AppText
                        style={[
                          styles.chipText,
                          values.priority === p && {
                            color: getPriorityColor(p),
                            fontWeight: "600",
                          },
                        ]}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Start Date */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <AppText style={styles.label}>Start Date</AppText>
                  <TouchableOpacity
                    onPress={() =>
                      setDateFromObj(new Date(), "start", setFieldValue)
                    }
                    style={styles.todayButton}
                  >
                    <Ionicons
                      name="today"
                      size={14}
                      color={theme.colors.brandBlue}
                    />
                    <AppText style={styles.todayText}>Today</AppText>
                  </TouchableOpacity>
                </View>
                <View style={styles.dateInputRow}>
                  <View style={styles.dateInputWrapper}>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="DD"
                      placeholderTextColor={theme.colors.textMuted}
                      value={values.startDate.day}
                      onChangeText={(text) =>
                        setFieldValue(
                          "startDate.day",
                          text.replace(/[^0-9]/g, "").slice(0, 2),
                        )
                      }
                      keyboardType="numeric"
                      maxLength={2}
                    />
                    <AppText style={styles.dateLabel}>Day</AppText>
                  </View>
                  <AppText style={styles.dateSeparator}>/</AppText>
                  <View style={styles.dateInputWrapper}>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="MM"
                      placeholderTextColor={theme.colors.textMuted}
                      value={values.startDate.month}
                      onChangeText={(text) =>
                        setFieldValue(
                          "startDate.month",
                          text.replace(/[^0-9]/g, "").slice(0, 2),
                        )
                      }
                      keyboardType="numeric"
                      maxLength={2}
                    />
                    <AppText style={styles.dateLabel}>Month</AppText>
                  </View>
                  <AppText style={styles.dateSeparator}>/</AppText>
                  <View style={[styles.dateInputWrapper, { flex: 1.5 }]}>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="YYYY"
                      placeholderTextColor={theme.colors.textMuted}
                      value={values.startDate.year}
                      onChangeText={(text) =>
                        setFieldValue(
                          "startDate.year",
                          text.replace(/[^0-9]/g, "").slice(0, 4),
                        )
                      }
                      keyboardType="numeric"
                      maxLength={4}
                    />
                    <AppText style={styles.dateLabel}>Year</AppText>
                  </View>
                </View>
                {touched.startDate &&
                errors.startDate &&
                typeof errors.startDate === "string" ? (
                  <AppText style={styles.errorText}>{errors.startDate}</AppText>
                ) : touched.startDate?.day && errors.startDate?.day ? (
                  <AppText style={styles.errorText}>
                    {errors.startDate.day}
                  </AppText>
                ) : null}
              </View>

              {/* End Date */}
              <View style={styles.inputGroup}>
                <AppText style={styles.label}>End Date</AppText>
                <View style={styles.dateInputRow}>
                  <View style={styles.dateInputWrapper}>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="DD"
                      placeholderTextColor={theme.colors.textMuted}
                      value={values.endDate.day}
                      onChangeText={(text) =>
                        setFieldValue(
                          "endDate.day",
                          text.replace(/[^0-9]/g, "").slice(0, 2),
                        )
                      }
                      keyboardType="numeric"
                      maxLength={2}
                    />
                    <AppText style={styles.dateLabel}>Day</AppText>
                  </View>
                  <AppText style={styles.dateSeparator}>/</AppText>
                  <View style={styles.dateInputWrapper}>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="MM"
                      placeholderTextColor={theme.colors.textMuted}
                      value={values.endDate.month}
                      onChangeText={(text) =>
                        setFieldValue(
                          "endDate.month",
                          text.replace(/[^0-9]/g, "").slice(0, 2),
                        )
                      }
                      keyboardType="numeric"
                      maxLength={2}
                    />
                    <AppText style={styles.dateLabel}>Month</AppText>
                  </View>
                  <AppText style={styles.dateSeparator}>/</AppText>
                  <View style={[styles.dateInputWrapper, { flex: 1.5 }]}>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="YYYY"
                      placeholderTextColor={theme.colors.textMuted}
                      value={values.endDate.year}
                      onChangeText={(text) =>
                        setFieldValue(
                          "endDate.year",
                          text.replace(/[^0-9]/g, "").slice(0, 4),
                        )
                      }
                      keyboardType="numeric"
                      maxLength={4}
                    />
                    <AppText style={styles.dateLabel}>Year</AppText>
                  </View>
                </View>
                <View style={styles.datePresetsRow}>
                  <TouchableOpacity
                    style={styles.datePreset}
                    onPress={() => {
                      const date = new Date();
                      date.setDate(date.getDate() + 7);
                      setDateFromObj(date, "end", setFieldValue);
                    }}
                  >
                    <AppText style={styles.datePresetText}>+1 Week</AppText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.datePreset}
                    onPress={() => {
                      const date = new Date();
                      date.setDate(date.getDate() + 14);
                      setDateFromObj(date, "end", setFieldValue);
                    }}
                  >
                    <AppText style={styles.datePresetText}>+2 Weeks</AppText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.datePreset}
                    onPress={() => {
                      const date = new Date();
                      date.setDate(date.getDate() + 30);
                      setDateFromObj(date, "end", setFieldValue);
                    }}
                  >
                    <AppText style={styles.datePresetText}>+1 Month</AppText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.datePreset}
                    onPress={() => {
                      const date = new Date();
                      date.setDate(date.getDate() + 90);
                      setDateFromObj(date, "end", setFieldValue);
                    }}
                  >
                    <AppText style={styles.datePresetText}>+3 Months</AppText>
                  </TouchableOpacity>
                </View>
                {touched.endDate &&
                errors.endDate &&
                typeof errors.endDate === "string" ? (
                  <AppText style={styles.errorText}>{errors.endDate}</AppText>
                ) : touched.endDate?.day && errors.endDate?.day ? (
                  <AppText style={styles.errorText}>
                    {errors.endDate.day}
                  </AppText>
                ) : touched.endDate?.year && errors.endDate?.year ? (
                  <AppText style={styles.errorText}>
                    {errors.endDate.year}
                  </AppText>
                ) : null}
              </View>

              {/* Assign Team */}
              <View style={styles.inputGroup}>
                <AppText style={styles.label}>Assign Team *</AppText>
                {teams.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {teams.map((t) => (
                      <TouchableOpacity
                        key={t.id}
                        style={[
                          styles.teamChip,
                          values.teamId === t.id && styles.teamChipActive,
                        ]}
                        onPress={() =>
                          setFieldValue(
                            "teamId",
                            values.teamId === t.id ? "" : t.id,
                          )
                        }
                      >
                        <View
                          style={[
                            styles.teamIcon,
                            values.teamId === t.id && styles.teamIconActive,
                          ]}
                        >
                          <Ionicons
                            name="people"
                            size={18}
                            color={
                              values.teamId === t.id
                                ? theme.colors.textPrimary
                                : theme.colors.textSecondary
                            }
                          />
                        </View>
                        <AppText
                          style={[
                            styles.teamName,
                            values.teamId === t.id && styles.teamNameActive,
                          ]}
                          numberOfLines={1}
                        >
                          {t.name}
                        </AppText>
                        {values.teamId === t.id && (
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color={theme.colors.brandGreen}
                            style={{ marginTop: 4 }}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.noTeamsContainer}>
                    <Ionicons
                      name="people-outline"
                      size={24}
                      color={theme.colors.textMuted}
                    />
                    <AppText style={styles.noTeams}>No teams available</AppText>
                  </View>
                )}
                {touched.teamId && errors.teamId ? (
                  <AppText style={styles.errorText}>{errors.teamId}</AppText>
                ) : null}
              </View>

              {status ? (
                <View style={styles.errorContainer}>
                  <Ionicons
                    name="alert-circle"
                    size={18}
                    color={theme.colors.danger}
                  />
                  <AppText style={styles.error}>{status}</AppText>
                </View>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.createButton,
                  isSubmitting && styles.createButtonDisabled,
                ]}
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
                        Create Project
                      </AppText>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </AppCard>
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
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginBottom: theme.spacing.sm,
  },
  inputContainer: {
    position: "relative",
  },
  input: {
    backgroundColor: theme.colors.glassDark,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    paddingRight: 50,
    color: theme.colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textArea: {
    minHeight: 100,
    paddingTop: theme.spacing.md,
    paddingBottom: 30,
  },
  charCount: {
    position: "absolute",
    right: 12,
    bottom: 10,
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  priorityChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: 12,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  // Date inputs
  todayButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: theme.colors.brandBlue + "20",
  },
  todayText: {
    color: theme.colors.brandBlue,
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  dateInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateInputWrapper: {
    flex: 1,
    alignItems: "center",
  },
  dateInput: {
    backgroundColor: theme.colors.glassDark,
    borderRadius: 10,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm + 2,
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "500",
    borderWidth: 1,
    borderColor: theme.colors.border,
    textAlign: "center",
    width: "100%",
  },
  dateLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  dateSeparator: {
    color: theme.colors.textMuted,
    fontSize: 18,
    marginHorizontal: 6,
  },
  datePresetsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: theme.spacing.sm,
    gap: 8,
  },
  datePreset: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  datePresetText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  // Team selection
  teamChip: {
    alignItems: "center",
    marginRight: theme.spacing.md,
    padding: theme.spacing.sm,
    borderRadius: 12,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 85,
  },
  teamChipActive: {
    backgroundColor: theme.colors.brandGreen + "25",
    borderColor: theme.colors.brandGreen,
  },
  teamIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.glassDark,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  teamIconActive: {
    backgroundColor: theme.colors.brandGreen,
  },
  teamName: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  teamNameActive: {
    color: theme.colors.brandGreen,
    fontWeight: "500",
  },
  noTeamsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.glass,
    borderRadius: 12,
  },
  noTeams: {
    color: theme.colors.textMuted,
    fontStyle: "italic",
    marginLeft: 8,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 12,
    marginTop: 6,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.danger + "15",
    borderRadius: 10,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  error: {
    color: theme.colors.danger,
    fontSize: 13,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  createButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: theme.spacing.md,
    shadowColor: theme.colors.glowGreen,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  createButtonDisabled: {
    opacity: 0.7,
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

export default CreateProjectScreen;
