import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import theme from "../theme";

const ScreenContainer = ({ children, style }) => {
  return (
    <View style={[styles.container, style]}>
      {/* Background gradient layers */}
      <LinearGradient
        colors={[
          theme.colors.background,
          theme.colors.surface,
          theme.colors.background,
        ]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Subtle blue glow in top right */}
      <View style={styles.glowTopRight} />
      {/* Subtle green glow in bottom left */}
      <View style={styles.glowBottomLeft} />
      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  glowTopRight: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: theme.colors.glowBlue,
    opacity: 0.15,
  },
  glowBottomLeft: {
    position: "absolute",
    bottom: -50,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: theme.colors.glowGreen,
    opacity: 0.1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
});

export default ScreenContainer;
