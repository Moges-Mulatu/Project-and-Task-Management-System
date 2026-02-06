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
import ScreenContainer from "../components/ScreenContainer";
import theme from "../theme";
import { api } from "../services/api";

const DEPARTMENTS = [
  "Engineering",
  "Design",
  "Product",
  "Marketing",
  "Operations",
  "Other",
];

const CreateTeamSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .min(2, "Team name must be at least 2 characters")
    .max(50, "Team name cannot exceed 50 characters")
    .required("Team name is required"),
  description: Yup.string()
    .trim()
    .max(200, "Description cannot exceed 200 characters"),
  department: Yup.string()
    .oneOf(DEPARTMENTS, "Please select a valid department")
    .required("Department is required"),
  teamLeadId: Yup.string().required("Team lead is required"),
  selectedMembers: Yup.array()
    .min(1, "At least 1 team member is required")
    .required("At least 1 team member is required"),
});

const CreateTeamScreen = ({ navigation, user }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await api.getUsers();
        setUsers(response.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadUsers();
  }, []);

  // Check admin permission
  if (user?.role !== "admin") {
    return (
      <ScreenContainer>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <AppText variant="h3" style={styles.headerTitle}>
            New Team
          </AppText>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.permissionDenied}>
          <Ionicons name="lock-closed" size={64} color={theme.colors.danger} />
          <AppText variant="h3" style={styles.permissionTitle}>
            Admin Access Required
          </AppText>
          <AppText style={styles.permissionText}>
            Only administrators can create new teams. Contact your admin if you need a team created.
          </AppText>
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => navigation.goBack()}
          >
            <AppText style={styles.goBackButtonText}>Go Back</AppText>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  // Filter users who can be team leads (admins and PMs)
  const potentialLeads = users.filter(
    (u) => u.role === "admin" || u.role === "project_manager",
  );

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
            New Team
          </AppText>
          <View style={{ width: 40 }} />
        </View>

        <Formik
          initialValues={{
            name: "",
            description: "",
            department: "",
            teamLeadId: "",
            selectedMembers: [],
          }}
          validationSchema={CreateTeamSchema}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={async (values, { setSubmitting, setStatus }) => {
            setStatus("");
            try {
              // Create the team
              const response = await api.createTeam({
                name: values.name.trim(),
                description: values.description.trim() || null,
                department: values.department,
                teamLeadId: values.teamLeadId,
              });

              // If we have the team ID and selected members, add them
              if (response.data?.id && values.selectedMembers.length > 0) {
                for (const memberId of values.selectedMembers) {
                  if (memberId !== values.teamLeadId) {
                    try {
                      await api.addTeamMember(response.data.id, {
                        userId: memberId,
                      });
                    } catch (err) {
                      console.log("Failed to add member:", memberId);
                    }
                  }
                }
              }

              navigation.goBack();
            } catch (err) {
              setStatus(err.message || "Failed to create team");
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
              {/* Team Name */}
              <View style={styles.inputGroup}>
                <AppText style={styles.label}>Team Name</AppText>
                <TextInput
                  style={styles.input}
                  placeholder="Enter team name..."
                  placeholderTextColor={theme.colors.textMuted}
                  value={values.name}
                  onChangeText={handleChange("name")}
                  onBlur={handleBlur("name")}
                  maxLength={50}
                />
                {touched.name && errors.name && (
                  <AppText style={styles.fieldError}>{errors.name}</AppText>
                )}
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <AppText style={styles.label}>Description</AppText>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="What does this team work on?"
                  placeholderTextColor={theme.colors.textMuted}
                  value={values.description}
                  onChangeText={handleChange("description")}
                  onBlur={handleBlur("description")}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  maxLength={200}
                />
                {touched.description && errors.description && (
                  <AppText style={styles.fieldError}>
                    {errors.description}
                  </AppText>
                )}
              </View>

              {/* Department */}
              <View style={styles.inputGroup}>
                <AppText style={styles.label}>Department</AppText>
                <View style={styles.optionsRow}>
                  {DEPARTMENTS.map((dept) => (
                    <TouchableOpacity
                      key={dept}
                      style={[
                        styles.deptChip,
                        values.department === dept && styles.deptChipActive,
                      ]}
                      onPress={() => {
                        setFieldValue("department", dept);
                        setFieldTouched("department", true);
                      }}
                    >
                      <AppText
                        style={[
                          styles.deptText,
                          values.department === dept && styles.deptTextActive,
                        ]}
                      >
                        {dept}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </View>
                {touched.department && errors.department && (
                  <AppText style={styles.fieldError}>
                    {errors.department}
                  </AppText>
                )}
              </View>

              {/* Team Lead */}
              <View style={styles.inputGroup}>
                <AppText style={styles.label}>Team Lead</AppText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {potentialLeads.map((u) => {
                    const isSelected = values.teamLeadId === u.id;
                    return (
                      <TouchableOpacity
                        key={u.id}
                        style={[
                          styles.leadCard,
                          isSelected && styles.leadCardSelected,
                        ]}
                        onPress={() => {
                          setFieldValue("teamLeadId", u.id);
                          setFieldTouched("teamLeadId", true);
                        }}
                      >
                        <LinearGradient
                          colors={
                            isSelected
                              ? [
                                  theme.colors.brandBlue,
                                  theme.colors.brandGreen,
                                ]
                              : [theme.colors.glassDark, theme.colors.glassDark]
                          }
                          style={styles.leadAvatar}
                        >
                          <AppText style={styles.leadAvatarText}>
                            {u.firstName?.[0]}
                            {u.lastName?.[0]}
                          </AppText>
                        </LinearGradient>
                        <AppText
                          style={[
                            styles.leadName,
                            isSelected && styles.leadNameActive,
                          ]}
                        >
                          {u.firstName}
                        </AppText>
                        <AppText style={styles.leadRole}>
                          {u.role === "project_manager" ? "PM" : "Admin"}
                        </AppText>
                      </TouchableOpacity>
                    );
                  })}
                  {potentialLeads.length === 0 && (
                    <AppText style={styles.noUsers}>
                      No eligible team leads
                    </AppText>
                  )}
                </ScrollView>
                {touched.teamLeadId && errors.teamLeadId && (
                  <AppText style={styles.fieldError}>
                    {errors.teamLeadId}
                  </AppText>
                )}
              </View>

              {/* Add Members */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <AppText style={styles.label}>Add Members</AppText>
                  <AppText style={styles.selectedCount}>
                    {values.selectedMembers.length} selected
                  </AppText>
                </View>

                <View style={styles.membersGrid}>
                  {users
                    .filter((u) => u.id !== values.teamLeadId)
                    .map((u) => {
                      const isSelected = values.selectedMembers.includes(u.id);
                      return (
                        <TouchableOpacity
                          key={u.id}
                          style={[
                            styles.memberCard,
                            isSelected && styles.memberCardSelected,
                          ]}
                          onPress={() => {
                            const newMembers = isSelected
                              ? values.selectedMembers.filter(
                                  (id) => id !== u.id,
                                )
                              : [...values.selectedMembers, u.id];
                            setFieldValue("selectedMembers", newMembers);
                            setFieldTouched("selectedMembers", true);
                          }}
                        >
                          {isSelected && (
                            <View style={styles.memberCheckbox}>
                              <Ionicons
                                name="checkmark"
                                size={12}
                                color={theme.colors.textPrimary}
                              />
                            </View>
                          )}
                          <View
                            style={[
                              styles.memberAvatar,
                              isSelected && styles.memberAvatarSelected,
                            ]}
                          >
                            <AppText style={styles.memberAvatarText}>
                              {u.firstName?.[0]}
                            </AppText>
                          </View>
                          <AppText style={styles.memberName} numberOfLines={1}>
                            {u.firstName}
                          </AppText>
                        </TouchableOpacity>
                      );
                    })}
                </View>
                {touched.selectedMembers && errors.selectedMembers && (
                  <AppText style={styles.fieldError}>
                    {errors.selectedMembers}
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
                        name="people"
                        size={22}
                        color={theme.colors.textPrimary}
                      />
                      <AppText style={styles.createButtonText}>
                        Create Team
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
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
    marginBottom: theme.spacing.sm,
  },
  selectedCount: {
    color: theme.colors.brandGreen,
    fontSize: 12,
    fontWeight: "500",
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.glassDark,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  fieldError: {
    color: theme.colors.danger,
    fontSize: 12,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  textArea: {
    minHeight: 80,
    paddingTop: theme.spacing.md,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  deptChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.glassDark,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  deptChipActive: {
    backgroundColor: theme.colors.brandBlue,
    borderColor: theme.colors.brandBlue,
  },
  deptText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  deptTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
  leadCard: {
    alignItems: "center",
    marginRight: theme.spacing.md,
    padding: theme.spacing.sm,
    borderRadius: 12,
    backgroundColor: theme.colors.glassDark,
    borderWidth: 2,
    borderColor: "transparent",
    minWidth: 80,
  },
  leadCardSelected: {
    borderColor: theme.colors.brandBlue,
    backgroundColor: theme.colors.brandBlue + "20",
  },
  leadAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  leadAvatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  leadName: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  leadNameActive: {
    color: theme.colors.brandBlue,
    fontWeight: "500",
  },
  leadRole: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  membersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  memberCard: {
    alignItems: "center",
    padding: theme.spacing.sm,
    borderRadius: 10,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    position: "relative",
  },
  memberCardSelected: {
    backgroundColor: theme.colors.brandGreen + "20",
  },
  memberCheckbox: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.brandGreen,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.glassDark,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  memberAvatarSelected: {
    backgroundColor: theme.colors.brandGreen,
  },
  memberAvatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  memberName: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    maxWidth: 50,
    textAlign: "center",
  },
  noUsers: {
    color: theme.colors.textMuted,
    fontStyle: "italic",
    padding: theme.spacing.md,
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
  permissionDenied: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  permissionTitle: {
    fontWeight: "700",
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  permissionText: {
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  goBackButton: {
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  },
  goBackButtonText: {
    color: theme.colors.textPrimary,
    fontWeight: "600",
  },
});

export default CreateTeamScreen;
