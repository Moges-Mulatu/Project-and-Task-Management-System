import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "./AppText";
import theme from "../theme";

const StatPill = ({ label, value, accentColor }) => {
  return (
    <View style={[styles.container, { borderColor: accentColor || theme.colors.border }]}>
      <AppText style={styles.label}>{label}</AppText>
      <AppText variant="h3" style={styles.value}>
        {value}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
  },
  value: {
    marginTop: theme.spacing.xs,
    fontWeight: "600",
  },
});

export default StatPill;
