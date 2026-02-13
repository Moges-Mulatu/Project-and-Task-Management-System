import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AppText from "./AppText";
import theme from "../theme";

const { width } = Dimensions.get("window");

// ── Global alert trigger ────────────────────────────────
let _showAlert = null;

/**
 * Show a themed alert dialog.
 *
 * @param {"success"|"error"|"warning"|"confirm"|"info"} type
 * @param {string} title
 * @param {string} message
 * @param {object} [options]
 * @param {string}  [options.confirmText]  Label for the action button (confirm type)
 * @param {function} [options.onConfirm]   Called when the action button is pressed
 * @param {function} [options.onDismiss]   Called when the alert is dismissed
 */
export const showAlert = (type, title, message, options = {}) => {
  if (_showAlert) {
    _showAlert({ type, title, message, ...options });
  }
};

// ── Icon & colour map ───────────────────────────────────
const ALERT_CONFIG = {
  success: {
    icon: "checkmark-circle",
    colors: [theme.colors.brandGreen, "#14b87a"],
    glowColor: theme.colors.glowGreen,
  },
  error: {
    icon: "alert-circle",
    colors: [theme.colors.danger, "#ff6b6b"],
    glowColor: "rgba(239,68,68,0.35)",
  },
  warning: {
    icon: "warning",
    colors: ["#f59e0b", "#fbbf24"],
    glowColor: "rgba(245,158,11,0.35)",
  },
  confirm: {
    icon: "help-circle",
    colors: [theme.colors.brandBlue, theme.colors.accentBlue],
    glowColor: theme.colors.glowBlue,
  },
  info: {
    icon: "information-circle",
    colors: [theme.colors.brandBlue, theme.colors.accentBlue],
    glowColor: theme.colors.glowBlue,
  },
};

// ── Component ───────────────────────────────────────────
const CustomAlert = () => {
  const [visible, setVisible] = useState(false);
  const [alertData, setAlertData] = useState({});
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const show = useCallback((data) => {
    setAlertData(data);
    setVisible(true);
  }, []);

  useEffect(() => {
    _showAlert = show;
    return () => {
      _showAlert = null;
    };
  }, [show]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      alertData.onDismiss?.();
    });
  }, [alertData]);

  const handleConfirm = useCallback(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      alertData.onConfirm?.();
    });
  }, [alertData]);

  const config = ALERT_CONFIG[alertData.type] || ALERT_CONFIG.info;
  const isConfirm = alertData.type === "confirm";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <BlurView intensity={40} tint="dark" style={styles.blur}>
            <View style={styles.card}>
              {/* Glow behind icon */}
              <View
                style={[styles.iconGlow, { shadowColor: config.colors[0] }]}
              >
                <LinearGradient
                  colors={config.colors}
                  style={styles.iconCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={config.icon} size={32} color="#fff" />
                </LinearGradient>
              </View>

              {/* Title */}
              <AppText variant="h3" style={styles.title}>
                {alertData.title}
              </AppText>

              {/* Message */}
              <AppText style={styles.message}>{alertData.message}</AppText>

              {/* Buttons */}
              <View style={styles.buttonRow}>
                {isConfirm ? (
                  <>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={dismiss}
                      activeOpacity={0.7}
                    >
                      <AppText style={styles.cancelText}>Cancel</AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.confirmButton}
                      onPress={handleConfirm}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={config.colors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.confirmGradient}
                      >
                        <AppText style={styles.confirmText}>
                          {alertData.confirmText || "Confirm"}
                        </AppText>
                      </LinearGradient>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.okButton}
                    onPress={dismiss}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={config.colors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.okGradient}
                    >
                      <AppText style={styles.okText}>OK</AppText>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  container: {
    width: width - 60,
    maxWidth: 340,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  blur: {
    overflow: "hidden",
    borderRadius: 20,
  },
  card: {
    backgroundColor: "rgba(13, 20, 32, 0.85)",
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  iconGlow: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 18,
    elevation: 12,
    marginBottom: 16,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: theme.colors.textPrimary,
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
  },
  // ── Cancel (confirm dialog) ──
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  cancelText: {
    color: theme.colors.textSecondary,
    fontWeight: "600",
    fontSize: 15,
  },
  // ── Confirm action button ──
  confirmButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  confirmGradient: {
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  confirmText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  // ── OK button (info/success/error) ──
  okButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  okGradient: {
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  okText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});

export default CustomAlert;
