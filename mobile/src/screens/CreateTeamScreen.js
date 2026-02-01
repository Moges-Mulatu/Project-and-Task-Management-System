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

const CreateTeamScreen = ({ navigation, user }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [teamLeadId, setTeamLeadId] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const toggleMember = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleCreate = async () => {
    setError("");
    if (!name.trim()) {
      setError("Please enter a team name");
      return;
    }
    if (!department) {
      setError("Please select a department");
      return;
    }
    if (!teamLeadId) {
      setError("Please select a team lead");
      return;
    }

    setLoading(true);
    try {
      // Create the team
      const response = await api.createTeam({
        name: name.trim(),
        description: description.trim() || null,
        department,
        teamLeadId,
      });

      // If we have the team ID and selected members, add them
      if (response.data?.id && selectedMembers.length > 0) {
        for (const memberId of selectedMembers) {
          if (memberId !== teamLeadId) {
            try {
              await api.addTeamMember(response.data.id, { userId: memberId });
            } catch (err) {
              console.log("Failed to add member:", memberId);
            }
          }
        }
      }

      navigation.goBack();
    } catch (err) {
      setError(err.message || "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return theme.colors.accentPink;
      case "project_manager":
        return theme.colors.brandBlue;
      default:
        return theme.colors.brandGreen;
    }
  };

  // Filter users who can be team leads (admins and PMs)
  const potentialLeads = users.filter(
    (u) => u.role === "admin" || u.role === "project_manager"
  );

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <AppText variant="h3" style={styles.headerTitle}>New Team</AppText>
          <View style={{ width: 40 }} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Team Name */}
          <View style={styles.inputGroup}>
            <AppText style={styles.label}>Team Name</AppText>
            <TextInput
              style={styles.input}
              placeholder="Enter team name..."
              placeholderTextColor={theme.colors.textMuted}
              value={name}
              onChangeText={setName}
              maxLength={50}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <AppText style={styles.label}>Description</AppText>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="What does this team work on?"
              placeholderTextColor={theme.colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={200}
            />
          </View>

          {/* Department */}
          <View style={styles.inputGroup}>
            <AppText style={styles.label}>Department</AppText>
            <View style={styles.optionsRow}>
              {DEPARTMENTS.map((dept) => (
                <TouchableOpacity
                  key={dept}
                  style={[styles.deptChip, department === dept && styles.deptChipActive]}
                  onPress={() => setDepartment(dept)}
                >
                  <AppText
                    style={[styles.deptText, department === dept && styles.deptTextActive]}
                  >
                    {dept}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Team Lead */}
          <View style={styles.inputGroup}>
            <AppText style={styles.label}>Team Lead</AppText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {potentialLeads.map((u) => {
                const isSelected = teamLeadId === u.id;
                return (
                  <TouchableOpacity
                    key={u.id}
                    style={[styles.leadCard, isSelected && styles.leadCardSelected]}
                    onPress={() => setTeamLeadId(u.id)}
                  >
                    <LinearGradient
                      colors={isSelected 
                        ? [theme.colors.brandBlue, theme.colors.brandGreen]
                        : [theme.colors.glassDark, theme.colors.glassDark]
                      }
                      style={styles.leadAvatar}
                    >
                      <AppText style={styles.leadAvatarText}>
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </AppText>
                    </LinearGradient>
                    <AppText style={[styles.leadName, isSelected && styles.leadNameActive]}>
                      {u.firstName}
                    </AppText>
                    <AppText style={styles.leadRole}>
                      {u.role === "project_manager" ? "PM" : "Admin"}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
              {potentialLeads.length === 0 && (
                <AppText style={styles.noUsers}>No eligible team leads</AppText>
              )}
            </ScrollView>
          </View>

          {/* Add Members (Optional) */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <AppText style={styles.label}>Add Members (Optional)</AppText>
              <AppText style={styles.selectedCount}>
                {selectedMembers.length} selected
              </AppText>
            </View>
            
            <View style={styles.membersGrid}>
              {users.filter(u => u.id !== teamLeadId).map((u) => {
                const isSelected = selectedMembers.includes(u.id);
                return (
                  <TouchableOpacity
                    key={u.id}
                    style={[styles.memberCard, isSelected && styles.memberCardSelected]}
                    onPress={() => toggleMember(u.id)}
                  >
                    {isSelected && (
                      <View style={styles.memberCheckbox}>
                        <Ionicons name="checkmark" size={12} color={theme.colors.textPrimary} />
                      </View>
                    )}
                    <View style={[styles.memberAvatar, isSelected && styles.memberAvatarSelected]}>
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
                  <Ionicons name="people" size={22} color={theme.colors.textPrimary} />
                  <AppText style={styles.createButtonText}>Create Team</AppText>
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
});

export default CreateTeamScreen;
