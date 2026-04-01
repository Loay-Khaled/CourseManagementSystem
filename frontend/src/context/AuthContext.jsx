import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { configureAuth } from "../api/api";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const login = (data) => {
    setUser({
      username: data.username,
      role: data.role,
      accessToken: data.accessToken,
    });
    localStorage.setItem("refreshToken", data.refreshToken);
  };

  const syncFromRefresh = (data) => {
    setUser((prev) => ({
      username: data.username ?? prev?.username ?? "",
      role: data.role ?? prev?.role ?? "",
      accessToken: data.accessToken,
    }));
    if (data.refreshToken) {
      localStorage.setItem("refreshToken", data.refreshToken);
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Ignore logout errors to ensure local auth state is always cleared.
    } finally {
      setUser(null);
      localStorage.removeItem("refreshToken");
    }
  };

  const localLogout = () => {
    setUser(null);
    localStorage.removeItem("refreshToken");
  };

  const isAuthenticated = () => Boolean(user?.accessToken);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        if (isMounted) {
          setIsInitializing(false);
        }
        return;
      }

      try {
        const data = await authService.refresh(refreshToken);
        if (isMounted) {
          syncFromRefresh(data);
        }
      } catch {
        if (isMounted) {
          localLogout();
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    configureAuth({
      getAccessToken: () => user?.accessToken ?? null,
      getRefreshToken: () => localStorage.getItem("refreshToken"),
      onAuthUpdate: syncFromRefresh,
      onLogout: localLogout,
    });
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isAuthenticated,
      isInitializing,
    }),
    [user, isInitializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
