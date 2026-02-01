import React from "react";
import { View, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import theme from "../theme";

const AppCard = ({
  children,
  style,
  accentColor = theme.colors.brandBlue,
  variant = "glass",
  showAccent = true,
  glowIntensity = "medium",
}) => {
  const glowColor =
    accentColor === theme.colors.brandGreen
      ? theme.colors.glowGreen
      : theme.colors.glowBlue;

  const shadowOpacity =
    glowIntensity === "high" ? 0.6 : glowIntensity === "low" ? 0.2 : 0.4;

  return (
    <View style={[styles.wrapper, { shadowColor: glowColor, shadowOpacity }, style]}>
      <View style={styles.cardOuter}>
        {variant === "glass" ? (
          <BlurView intensity={25} tint="dark" style={styles.blurContainer}>
            <View style={styles.cardGlass}>
              {/* Short decorative accent line */}
              {showAccent && (
                <View style={styles.accentContainer}>
                  <View style={[styles.accentLine, { backgroundColor: accentColor }]} />
                  <View 
                    style={[
                      styles.accentGlow, 
                      { shadowColor: accentColor }
                    ]} 
                  />
                </View>
              )}
              <View style={styles.content}>{children}</View>
            </View>
          </BlurView>
        ) : (
          <View style={styles.cardSolid}>
            {showAccent && (
              <View style={styles.accentContainer}>
                <View style={[styles.accentLine, { backgroundColor: accentColor }]} />
                <View 
                  style={[
                    styles.accentGlow, 
                    { shadowColor: accentColor }
                  ]} 
                />
              </View>
            )}
            <View style={styles.content}>{children}</View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 10,
    marginVertical: theme.spacing.sm,
  },
  cardOuter: {
    borderRadius: 20,
    overflow: "hidden",
  },
  blurContainer: {
    borderRadius: 20,
    overflow: "hidden",
  },
  cardGlass: {
    backgroundColor: theme.colors.glass,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    overflow: "hidden",
  },
  cardSolid: {
    backgroundColor: theme.colors.cardSolid,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  accentContainer: {
    position: "absolute",
    left: 0,
    top: 16,
    height: 40,
    width: 4,
    zIndex: 10,
  },
  accentLine: {
    width: 4,
    height: 40,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  accentGlow: {
    position: "absolute",
    top: 5,
    left: 0,
    width: 4,
    height: 30,
    borderRadius: 2,
    shadowOffset: { width: 8, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  content: {
    padding: theme.spacing.lg,
  },
});

export default AppCard;
