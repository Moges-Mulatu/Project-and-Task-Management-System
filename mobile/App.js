import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import RootNavigator from "./src/navigation/RootNavigator";
import CustomAlert from "./src/components/CustomAlert";
import {
  api,
  clearAuth,
  loadAuth,
  saveAuth,
  setOnUnauthorized,
} from "./src/services/api";

export default function App() {
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // When the backend returns 401, auto-logout the user
    setOnUnauthorized(() => {
      setUser(null);
    });

    const bootstrap = async () => {
      try {
        const auth = await loadAuth();
        if (auth.user && auth.token) {
          // Validate the stored token by fetching the profile
          try {
            const response = await api.getProfile();
            const freshUser = response.data;
            await saveAuth({ user: freshUser, token: auth.token });
            setUser(freshUser);
          } catch {
            // Token is invalid or expired — force re-login
            await clearAuth();
            setUser(null);
          }
        }
      } finally {
        setIsReady(true);
      }
    };
    bootstrap();
  }, []);

  const handleLogin = async ({ email, password }) => {
    const response = await api.login({ email, password });
    const { user: loggedInUser, token } = response.data;
    await saveAuth({ user: loggedInUser, token });
    setUser(loggedInUser);
  };

  const handleRegister = async ({
    firstName,
    lastName,
    email,
    password,
    role,
  }) => {
    const response = await api.register({
      firstName,
      lastName,
      email,
      password,
      role,
    });
    const { user: registeredUser, token } = response.data;
    await saveAuth({ user: registeredUser, token });
    setUser(registeredUser);
  };

  const handleLogout = async () => {
    await clearAuth();
    setUser(null);
  };

  return (
    <>
      <StatusBar style="light" />
      {isReady ? (
        <RootNavigator
          user={user}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onLogout={handleLogout}
        />
      ) : null}
      <CustomAlert />
    </>
  );
}
