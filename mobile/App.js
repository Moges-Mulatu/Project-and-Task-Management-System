import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import RootNavigator from "./src/navigation/RootNavigator";
import { api, clearAuth, loadAuth, saveAuth } from "./src/services/api";

export default function App() {
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const auth = await loadAuth();
        if (auth.user) {
          setUser(auth.user);
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

  const handleRegister = async ({ firstName, lastName, email, password, role }) => {
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
    </>
  );
}
