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
import AppText from "../components/AppText";
import AppCard from "../components/AppCard";
import ScreenContainer from "../components/ScreenContainer";
import theme from "../theme";
import { api } from "../services/api";

const PRIORITIES = ["low", "medium", "high"];

const CreateProjectScreen = ({ navigation, user }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [teamId, setTeamId] = useState("");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Start date state
  const [startDay, setStartDay] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [startYear, setStartYear] = useState("");

  // End date state
  const [endDay, setEndDay] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [endYear, setEndYear] = useState("");

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
  const setDateFromObj = (date, type) => {
    const d = date.getDate().toString();
    const m = (date.getMonth() + 1).toString();
    const y = date.getFullYear().toString();
    
    if (type === "start") {
      setStartDay(d);
      setStartMonth(m);
      setStartYear(y);
    } else {
      setEndDay(d);
      setEndMonth(m);
      setEndYear(y);
    }
  };

  // Quick date presets
  const setStartToday = () => setDateFromObj(new Date(), "start");
  
  const setEndPreset = (daysFromNow) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    setDateFromObj(date, "end");
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = "Project name is required";
    } else if (name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    // Validate start date if any field is filled
    if (startDay || startMonth || startYear) {
      if (!startDay || !startMonth || !startYear) {
        newErrors.startDate = "Please complete all date fields";
      } else {
        const d = parseInt(startDay);
        const m = parseInt(startMonth);
        const y = parseInt(startYear);
        if (d < 1 || d > 31) newErrors.startDate = "Invalid day (1-31)";
        else if (m < 1 || m > 12) newErrors.startDate = "Invalid month (1-12)";
        else if (y < 2024 || y > 2030) newErrors.startDate = "Invalid year";
      }
    }

    // Validate end date if any field is filled
    if (endDay || endMonth || endYear) {
      if (!endDay || !endMonth || !endYear) {
        newErrors.endDate = "Please complete all date fields";
      } else {
        const d = parseInt(endDay);
        const m = parseInt(endMonth);
        const y = parseInt(endYear);
        if (d < 1 || d > 31) newErrors.endDate = "Invalid day (1-31)";
        else if (m < 1 || m > 12) newErrors.endDate = "Invalid month (1-12)";
        else if (y < 2024 || y > 2030) newErrors.endDate = "Invalid year";
      }
    }

    // Validate end date is after start date
    const startDate = formatDate(startDay, startMonth, startYear);
    const endDate = formatDate(endDay, endMonth, endYear);
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = "End date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const startDate = formatDate(startDay, startMonth, startYear);
      const endDate = formatDate(endDay, endMonth, endYear);

      await api.createProject({
        name: name.trim(),
        description: description.trim(),
        priority,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        teamId: teamId || undefined,
      });
      navigation.goBack();
    } catch (err) {
      setErrors({ general: err.message || "Failed to create project" });
    } finally {
      setLoading(false);
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <AppText variant="h3" style={styles.headerTitle}>New Project</AppText>
          <View style={{ width: 40 }} />
        </View>

        <AppCard accentColor={theme.colors.brandGreen}>
          {/* Project Name */}
          <View style={styles.inputGroup}>
            <AppText style={styles.label}>Project Name</AppText>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter project name..."
                placeholderTextColor={theme.colors.textMuted}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (text.length >= 3) {
                    setErrors((prev) => ({ ...prev, name: "" }));
                  }
                }}
                maxLength={100}
              />
              <AppText style={styles.charCount}>{name.length}/100</AppText>
            </View>
            {errors.name ? <AppText style={styles.errorText}>{errors.name}</AppText> : null}
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <AppText style={styles.label}>Description</AppText>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your project goals and scope..."
                placeholderTextColor={theme.colors.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
              <AppText style={styles.charCount}>{description.length}/500</AppText>
            </View>
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
                    priority === p && { 
                      backgroundColor: getPriorityColor(p) + "25", 
                      borderColor: getPriorityColor(p) 
                    },
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Ionicons
                    name={getPriorityIcon(p)}
                    size={16}
                    color={priority === p ? getPriorityColor(p) : theme.colors.textMuted}
                    style={{ marginRight: 6 }}
                  />
                  <AppText
                    style={[
                      styles.chipText, 
                      priority === p && { color: getPriorityColor(p), fontWeight: "600" }
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
              <TouchableOpacity onPress={setStartToday} style={styles.todayButton}>
                <Ionicons name="today" size={14} color={theme.colors.brandBlue} />
                <AppText style={styles.todayText}>Today</AppText>
              </TouchableOpacity>
            </View>
            <View style={styles.dateInputRow}>
              <View style={styles.dateInputWrapper}>
                <TextInput
                  style={styles.dateInput}
                  placeholder="DD"
                  placeholderTextColor={theme.colors.textMuted}
                  value={startDay}
                  onChangeText={(text) => setStartDay(text.replace(/[^0-9]/g, "").slice(0, 2))}
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
                  value={startMonth}
                  onChangeText={(text) => setStartMonth(text.replace(/[^0-9]/g, "").slice(0, 2))}
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
                  value={startYear}
                  onChangeText={(text) => setStartYear(text.replace(/[^0-9]/g, "").slice(0, 4))}
                  keyboardType="numeric"
                  maxLength={4}
                />
                <AppText style={styles.dateLabel}>Year</AppText>
              </View>
            </View>
            {errors.startDate ? <AppText style={styles.errorText}>{errors.startDate}</AppText> : null}
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
                  value={endDay}
                  onChangeText={(text) => setEndDay(text.replace(/[^0-9]/g, "").slice(0, 2))}
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
                  value={endMonth}
                  onChangeText={(text) => setEndMonth(text.replace(/[^0-9]/g, "").slice(0, 2))}
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
                  value={endYear}
                  onChangeText={(text) => setEndYear(text.replace(/[^0-9]/g, "").slice(0, 4))}
                  keyboardType="numeric"
                  maxLength={4}
                />
                <AppText style={styles.dateLabel}>Year</AppText>
              </View>
            </View>
            <View style={styles.datePresetsRow}>
              <TouchableOpacity 
                style={styles.datePreset} 
                onPress={() => setEndPreset(7)}
              >
                <AppText style={styles.datePresetText}>+1 Week</AppText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.datePreset} 
                onPress={() => setEndPreset(14)}
              >
                <AppText style={styles.datePresetText}>+2 Weeks</AppText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.datePreset} 
                onPress={() => setEndPreset(30)}
              >
                <AppText style={styles.datePresetText}>+1 Month</AppText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.datePreset} 
                onPress={() => setEndPreset(90)}
              >
                <AppText style={styles.datePresetText}>+3 Months</AppText>
              </TouchableOpacity>
            </View>
            {errors.endDate ? <AppText style={styles.errorText}>{errors.endDate}</AppText> : null}
          </View>

          {/* Assign Team */}
          <View style={styles.inputGroup}>
            <AppText style={styles.label}>Assign Team</AppText>
            {teams.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {teams.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.teamChip, teamId === t.id && styles.teamChipActive]}
                    onPress={() => setTeamId(teamId === t.id ? "" : t.id)}
                  >
                    <View style={[styles.teamIcon, teamId === t.id && styles.teamIconActive]}>
                      <Ionicons
                        name="people"
                        size={18}
                        color={teamId === t.id ? theme.colors.textPrimary : theme.colors.textSecondary}
                      />
                    </View>
                    <AppText
                      style={[styles.teamName, teamId === t.id && styles.teamNameActive]}
                      numberOfLines={1}
                    >
                      {t.name}
                    </AppText>
                    {teamId === t.id && (
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
                <Ionicons name="people-outline" size={24} color={theme.colors.textMuted} />
                <AppText style={styles.noTeams}>No teams available</AppText>
              </View>
            )}
          </View>

          {errors.general ? <AppText style={styles.error}>{errors.general}</AppText> : null}
        </AppCard>

        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
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
                <Ionicons name="folder-open" size={22} color={theme.colors.textPrimary} />
                <AppText style={styles.createButtonText}>Create Project</AppText>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

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
  error: {
    color: theme.colors.danger,
    textAlign: "center",
    marginTop: theme.spacing.sm,
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
