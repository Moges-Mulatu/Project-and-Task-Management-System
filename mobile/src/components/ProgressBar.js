import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import theme from "../theme";

const ProgressBar = ({ value = 0, color = theme.colors.brandBlue, height = 6 }) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <View style={[styles.track, { height }]}>
      <LinearGradient
        colors={[color, color + "80"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fill, { width: `${clampedValue}%`, height }]}
      />
      {/* Glow effect */}
      {clampedValue > 0 && (
        <View
          style={[
            styles.glow,
            {
              left: `${clampedValue}%`,
              backgroundColor: color,
              marginLeft: -4,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    backgroundColor: theme.colors.glassDark,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  fill: {
    borderRadius: 10,
  },
  glow: {
    position: "absolute",
    top: -2,
    width: 8,
    height: 10,
    borderRadius: 5,
    opacity: 0.6,
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});

export default ProgressBar;
