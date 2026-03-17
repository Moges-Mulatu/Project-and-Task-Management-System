import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import Svg, { Path } from "react-native-svg";
import HomeScreen from "../screens/HomeScreen";
import ProjectsScreen from "../screens/ProjectsScreen";
import TasksScreen from "../screens/TasksScreen";
import TeamsScreen from "../screens/TeamsScreen";
import CreateScreen from "../screens/CreateScreen";
import theme from "../theme";

const Tab = createBottomTabNavigator();

const CurvedTabBar = ({ state, descriptors, navigation }) => {
  const tabWidth = 70;
  const tabBarWidth = tabWidth * state.routes.length;
  const curveHeight = 30;
  const fabSize = 56;

  return (
    <View style={styles.tabBarContainer}>
      {/* SVG Curved Background */}
      <View style={styles.curveContainer}>
        <Svg width={tabBarWidth} height={80} style={styles.svg}>
          <Path
            d={`
              M0,${curveHeight}
              L${tabBarWidth * 0.35},${curveHeight}
              C${tabBarWidth * 0.4},${curveHeight} ${tabBarWidth * 0.42},0 ${tabBarWidth * 0.5},0
              C${tabBarWidth * 0.58},0 ${tabBarWidth * 0.6},${curveHeight} ${tabBarWidth * 0.65},${curveHeight}
              L${tabBarWidth},${curveHeight}
              L${tabBarWidth},80
              L0,80
              Z
            `}
            fill={theme.colors.navBackground}
          />
        </Svg>
      </View>

      {/* Blur overlay */}
      <BlurView intensity={30} tint="dark" style={styles.blurOverlay} />

      {/* Tab Items */}
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const isCenter = route.name === "Create";

          const iconMap = {
            Home: "home",
            Projects: "briefcase",
            Create: "add",
            Tasks: "checkbox",
            Teams: "people",
          };

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (isCenter) {
            return (
              <View key={route.key} style={styles.fabContainer}>
                <TouchableOpacity onPress={onPress} style={styles.fabTouchable}>
                  <View style={styles.fabGlow} />
                  <View style={styles.fab}>
                    <Ionicons
                      name="add"
                      size={30}
                      color={theme.colors.textPrimary}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
            >
              <Ionicons
                name={
                  isFocused
                    ? iconMap[route.name]
                    : `${iconMap[route.name]}-outline`
                }
                size={24}
                color={
                  isFocused ? theme.colors.accentBlue : theme.colors.textMuted
                }
              />
              {isFocused && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const MainTabs = ({ user, onLogout }) => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CurvedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home">
        {(props) => <HomeScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Projects">
        {(props) => <ProjectsScreen {...props} user={user} />}
      </Tab.Screen>
      {user?.role !== "team_member" && (
        <Tab.Screen name="Create">
          {(props) => <CreateScreen {...props} user={user} />}
        </Tab.Screen>
      )}
      <Tab.Screen name="Tasks">
        {(props) => <TasksScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Teams">
        {(props) => <TeamsScreen {...props} user={user} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
  },
  curveContainer: {
    display: "none",
  },
  svg: {
    display: "none",
  },
  blurOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
  },
  tabBar: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingBottom: 10,
    backgroundColor: theme.colors.navBackground,
    borderTopWidth: 1,
    borderTopColor: theme.colors.glassBorder,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.accentBlue,
    marginTop: 4,
  },
  fabContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: -30,
  },
  fabTouchable: {
    alignItems: "center",
    justifyContent: "center",
  },
  fabGlow: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.brandBlue,
    opacity: 0.4,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.brandBlue,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.brandBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 4,
    borderColor: theme.colors.background,
  },
});

export default MainTabs;
