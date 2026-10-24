import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import API from "../utils/api";

const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    const stored = localStorage.getItem("ps_user");
    const token = localStorage.getItem("ps_token");
    return stored && token ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const save = (token, user) => {
  if (token) localStorage.setItem("ps_token", token);
  localStorage.setItem("ps_user", JSON.stringify(user));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(true);

  // Refresh the stored profile once on load so role and wishlist are current.
  useEffect(() => {
    if (!localStorage.getItem("ps_token")) {
      setLoading(false);
      return;
    }
    API.get("/auth/profile", { skipAuthRedirect: true })
      .then(({ data }) => {
        const u = { ...data.user, wishlist: (data.user.wishlist || []).map((w) => (typeof w === "string" ? w : w._id)) };
        save(null, u);
        setUser(u);
      })
      .catch((err) => {
        if (err.response?.status === 401) setUser(null); // session expired: browse as a guest
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });
    save(data.token, data.user);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await API.post("/auth/register", { name, email, password });
    save(data.token, data.user);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("ps_token");
    localStorage.removeItem("ps_user");
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const { data } = await API.get("/auth/profile");
    const u = { ...data.user, wishlist: (data.user.wishlist || []).map((w) => (typeof w === "string" ? w : w._id)) };
    save(null, u);
    setUser(u);
    return u;
  }, []);

  const setWishlist = useCallback((ids) => {
    setUser((prev) => {
      if (!prev) return prev;
      const u = { ...prev, wishlist: ids };
      save(null, u);
      return u;
    });
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser, setWishlist }),
    [user, loading, login, register, logout, refreshUser, setWishlist]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
