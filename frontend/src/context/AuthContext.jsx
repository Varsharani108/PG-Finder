import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { loginRequest, signupRequest, getProfileRequest } from "../api/authApi.js";
import axiosClient from "../api/axiosClient.js";

const TOKEN_KEY = "pgfinder_token";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function hydrate() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await getProfileRequest();
        if (isMounted) setUser(data.user);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    hydrate();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const persistSession = useCallback((data, remember) => {
    setUser(data.user);
    setToken(data.token);
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    if (remember) {
      localStorage.setItem(TOKEN_KEY, data.token);
    } else {
      sessionStorage.setItem(TOKEN_KEY, data.token);
    }
  }, []);

  const login = useCallback(
    async ({ email, password, remember }) => {
      const data = await loginRequest({ email, password });
      persistSession(data, remember);
      return data.user;
    },
    [persistSession]
  );

  const signup = useCallback(
    async (payload) => {
      const data = await signupRequest(payload);
      persistSession(data, true);
      return data.user;
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const { data } = await axiosClient.put("/auth/profile", payload);
    setUser(data.user);
    return data.user;
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user),
    loading,
    login,
    signup,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
