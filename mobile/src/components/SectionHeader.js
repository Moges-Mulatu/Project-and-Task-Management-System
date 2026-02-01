import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "./AppText";
import theme from "../theme";

const SectionHeader = ({ title, action }) => {
  return (
    <View style={styles.container}>
      <AppText variant="h3" style={styles.title}>
        {title}
      </AppText>
      {action ? <AppText style={styles.action}>{action}</AppText> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontWeight: "600",
  },
  action: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.small,
  },
});

export default SectionHeader;
