import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AppText from "../components/AppText";
import AppCard from "../components/AppCard";
import ScreenContainer from "../components/ScreenContainer";
import theme from "../theme";
import { api } from "../services/api";

const ProfileScreen = ({ navigation, user, onLogout }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
  });
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ projects: 0, tasks: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        api.getProjects(),
        api.getTasks(),
      ]);
      setStats({
        projects: projectsRes.data?.length || 0,
        tasks: tasksRes.data?.length || 0,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async () => {
    if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setSaving(true);
    // Note: Backend would need an update profile endpoint
    // For now, just close the modal
    setTimeout(() => {
      setSaving(false);
      setShowEditModal(false);
      Alert.alert("Info", "Profile update requires backend implementation");
    }, 500);
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: onLogout },
      ]
    );
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

  const menuItems = [
    { 
      icon: "person-outline", 
      label: "Edit Profile", 
      onPress: () => setShowEditModal(true),
      color: theme.colors.brandBlue,
    },
    { 
      icon: "information-circle-outline", 
      label: "About App", 
      onPress: () => setShowAboutModal(true),
      color: theme.colors.brandGreen,
    },
  ];

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <AppText variant="h3" style={styles.headerTitle}>Profile</AppText>
          <View style={{ width: 40 }} />
        </View>

        {/* Profile Card */}
        <AppCard accentColor={theme.colors.brandBlue} glowIntensity="high">
          <View style={styles.profileContent}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarGlow} />
              <LinearGradient
                colors={[theme.colors.brandBlue, theme.colors.brandGreen]}
                style={styles.avatarGradient}
              >
                <AppText style={styles.avatarText}>
                  {user?.firstName?.[0] || "U"}{user?.lastName?.[0] || ""}
                </AppText>
              </LinearGradient>
            </View>

            <AppText variant="h2" style={styles.userName}>
              {user?.firstName || "User"} {user?.lastName || ""}
            </AppText>
            <AppText style={styles.userEmail}>{user?.email || "No email"}</AppText>

            <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(user?.role) + "30" }]}>
              <AppText style={[styles.roleText, { color: getRoleBadgeColor(user?.role) }]}>
                {user?.role?.replace("_", " ") || "Team Member"}
              </AppText>
            </View>
          </View>
        </AppCard>

        {/* Stats */}
        <View style={styles.statsRow}>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => {
              navigation.navigate("MainTabs", { screen: "Projects" });
            }}
          >
            <View style={[styles.statIcon, { backgroundColor: theme.colors.brandBlue + "30" }]}>
              <Ionicons name="briefcase" size={20} color={theme.colors.brandBlue} />
            </View>
            <AppText style={styles.statValue}>{stats.projects}</AppText>
            <AppText style={styles.statLabel}>Projects</AppText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => {
              navigation.navigate("MainTabs", { screen: "Tasks" });
            }}
          >
            <View style={[styles.statIcon, { backgroundColor: theme.colors.brandGreen + "30" }]}>
              <Ionicons name="checkbox" size={20} color={theme.colors.brandGreen} />
            </View>
            <AppText style={styles.statValue}>{stats.tasks}</AppText>
            <AppText style={styles.statLabel}>Tasks</AppText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => {
              navigation.navigate("MainTabs", { screen: "Teams" });
            }}
          >
            <View style={[styles.statIcon, { backgroundColor: theme.colors.accentPink + "30" }]}>
              <Ionicons name="people" size={20} color={theme.colors.accentPink} />
            </View>
            <AppText style={styles.statValue}>→</AppText>
            <AppText style={styles.statLabel}>Teams</AppText>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <AppCard showAccent={false}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, index < menuItems.length - 1 && styles.menuItemBorder]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconBg, { backgroundColor: item.color + "20" }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <AppText style={styles.menuItemText}>{item.label}</AppText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          ))}
        </AppCard>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <View style={styles.logoutContent}>
            <Ionicons name="log-out-outline" size={22} color={theme.colors.danger} />
            <AppText style={styles.logoutText}>Log Out</AppText>
          </View>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AppText variant="h3" style={styles.modalTitle}>Edit Profile</AppText>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <AppText style={styles.inputLabel}>First Name</AppText>
                <TextInput
                  style={styles.modalInput}
                  value={editForm.firstName}
                  onChangeText={(text) => setEditForm({ ...editForm, firstName: text })}
                  placeholder="Enter first name"
                  placeholderTextColor={theme.colors.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <AppText style={styles.inputLabel}>Last Name</AppText>
                <TextInput
                  style={styles.modalInput}
                  value={editForm.lastName}
                  onChangeText={(text) => setEditForm({ ...editForm, lastName: text })}
                  placeholder="Enter last name"
                  placeholderTextColor={theme.colors.textMuted}
                />
              </View>

              <View style={styles.inputGroup}>
                <AppText style={styles.inputLabel}>Email</AppText>
                <View style={[styles.modalInput, styles.disabledInput]}>
                  <AppText style={styles.disabledText}>{user?.email}</AppText>
                </View>
                <AppText style={styles.inputHint}>Email cannot be changed</AppText>
              </View>

              <View style={styles.inputGroup}>
                <AppText style={styles.inputLabel}>Role</AppText>
                <View style={[styles.modalInput, styles.disabledInput]}>
                  <AppText style={styles.disabledText}>{user?.role?.replace("_", " ")}</AppText>
                </View>
                <AppText style={styles.inputHint}>Contact admin to change role</AppText>
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile} disabled={saving}>
              <LinearGradient
                colors={[theme.colors.brandBlue, theme.colors.brandGreen]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButtonGradient}
              >
                {saving ? (
                  <ActivityIndicator color={theme.colors.textPrimary} />
                ) : (
                  <AppText style={styles.saveButtonText}>Save Changes</AppText>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={showAboutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setShowAboutModal(false)}
        >
          <View style={styles.aboutContent}>
            <View style={styles.aboutIcon}>
              <LinearGradient
                colors={[theme.colors.brandBlue, theme.colors.brandGreen]}
                style={styles.aboutIconGradient}
              >
                <AppText style={styles.aboutIconText}>D</AppText>
              </LinearGradient>
            </View>
            
            <AppText variant="h2" style={styles.aboutTitle}>Debo Task Manager</AppText>
            <AppText style={styles.aboutVersion}>Version 1.0.0</AppText>
            
            <View style={styles.aboutDivider} />
            
            <AppText style={styles.aboutDesc}>
              A project and task management system for Debo Engineering interns.
            </AppText>
            
            <View style={styles.aboutInfo}>
              <View style={styles.aboutInfoRow}>
                <Ionicons name="code-slash" size={16} color={theme.colors.brandBlue} />
                <AppText style={styles.aboutInfoText}>React Native + Expo</AppText>
              </View>
              <View style={styles.aboutInfoRow}>
                <Ionicons name="server" size={16} color={theme.colors.brandGreen} />
                <AppText style={styles.aboutInfoText}>Node.js + MySQL</AppText>
              </View>
            </View>
            
            <AppText style={styles.aboutCopyright}>© 2026 Debo Engineering</AppText>
          </View>
        </TouchableOpacity>
      </Modal>
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
  profileContent: {
    alignItems: "center",
    paddingVertical: theme.spacing.md,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: theme.spacing.lg,
  },
  avatarGlow: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.glowBlue,
    opacity: 0.5,
    top: -5,
    left: -5,
  },
  avatarGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: theme.colors.glassBorder,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  userName: {
    fontWeight: "700",
    marginBottom: 4,
  },
  userEmail: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  roleBadge: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
  },
  roleText: {
    fontWeight: "600",
    textTransform: "capitalize",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.glass,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemText: {
    marginLeft: theme.spacing.md,
    fontSize: 15,
  },
  logoutButton: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.danger + "15",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.danger + "30",
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.lg,
  },
  logoutText: {
    color: theme.colors.danger,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.spacing.lg,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontWeight: "600",
  },
  modalBody: {
    marginBottom: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginBottom: theme.spacing.sm,
  },
  modalInput: {
    backgroundColor: theme.colors.glassDark,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  disabledInput: {
    opacity: 0.6,
  },
  disabledText: {
    color: theme.colors.textSecondary,
    textTransform: "capitalize",
  },
  inputHint: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  saveButton: {
    borderRadius: 14,
    overflow: "hidden",
  },
  saveButtonGradient: {
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
  },
  saveButtonText: {
    fontWeight: "600",
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  // About Modal
  aboutContent: {
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.xl,
    borderRadius: 24,
    padding: theme.spacing.xl,
    alignItems: "center",
  },
  aboutIcon: {
    marginBottom: theme.spacing.md,
  },
  aboutIconGradient: {
    width: 70,
    height: 70,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  aboutIconText: {
    fontSize: 32,
    fontWeight: "700",
    color: theme.colors.textPrimary,
  },
  aboutTitle: {
    fontWeight: "700",
  },
  aboutVersion: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  aboutDivider: {
    width: 50,
    height: 2,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
  },
  aboutDesc: {
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  aboutInfo: {
    marginBottom: theme.spacing.md,
  },
  aboutInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  aboutInfoText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginLeft: theme.spacing.sm,
  },
  aboutCopyright: {
    color: theme.colors.textMuted,
    fontSize: 11,
  },
});

export default ProfileScreen;
