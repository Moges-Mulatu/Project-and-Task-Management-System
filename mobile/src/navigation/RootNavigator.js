import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import MainTabs from "./MainTabs";
import UsersScreen from "../screens/UsersScreen";
import ProfileScreen from "../screens/ProfileScreen";
import TaskDetailScreen from "../screens/TaskDetailScreen";
import ProjectDetailScreen from "../screens/ProjectDetailScreen";
import CreateProjectScreen from "../screens/CreateProjectScreen";
import CreateTaskScreen from "../screens/CreateTaskScreen";
import ReportsScreen from "../screens/ReportsScreen";
import TeamDetailScreen from "../screens/TeamDetailScreen";
import CreateTeamScreen from "../screens/CreateTeamScreen";

const Stack = createNativeStackNavigator();

const RootNavigator = ({ user, onLogin, onRegister, onLogout }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLogin={onLogin} />}
            </Stack.Screen>
            <Stack.Screen name="Register">
              {(props) => <RegisterScreen {...props} onRegister={onRegister} />}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs">
              {(props) => <MainTabs {...props} user={user} />}
            </Stack.Screen>
            <Stack.Screen name="Users">
              {(props) => <UsersScreen {...props} user={user} />}
            </Stack.Screen>
            <Stack.Screen name="Profile">
              {(props) => (
                <ProfileScreen {...props} user={user} onLogout={onLogout} />
              )}
            </Stack.Screen>
            <Stack.Screen name="TaskDetail">
              {(props) => <TaskDetailScreen {...props} user={user} />}
            </Stack.Screen>
            <Stack.Screen name="ProjectDetail">
              {(props) => <ProjectDetailScreen {...props} user={user} />}
            </Stack.Screen>
            <Stack.Screen name="CreateProject">
              {(props) => <CreateProjectScreen {...props} user={user} />}
            </Stack.Screen>
            <Stack.Screen name="CreateTask">
              {(props) => <CreateTaskScreen {...props} user={user} />}
            </Stack.Screen>
            <Stack.Screen name="Reports">
              {(props) => <ReportsScreen {...props} user={user} />}
            </Stack.Screen>
            <Stack.Screen name="TeamDetail">
              {(props) => <TeamDetailScreen {...props} user={user} />}
            </Stack.Screen>
            <Stack.Screen name="CreateTeam">
              {(props) => <CreateTeamScreen {...props} user={user} />}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
