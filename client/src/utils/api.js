import axios from "axios";

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api" });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("ps_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || "";
    const isAuthCall = url.includes("/auth/login") || url.includes("/auth/register");
    // An expired session sends the user to log in. A wrong password on the login
    // form must not trigger this, or the error message would be lost in a reload.
    if (err.response?.status === 401 && !isAuthCall && localStorage.getItem("ps_token")) {
      localStorage.removeItem("ps_token");
      localStorage.removeItem("ps_user");
      const quiet = err.config?.skipAuthRedirect;
      if (!quiet && !window.location.pathname.startsWith("/login")) window.location.href = "/login?expired=1";
    }
    return Promise.reject(err);
  }
);

export const errorMessage = (err, fallback = "Something went wrong. Try again.") =>
  err?.response?.data?.message || (err?.request && !err?.response ? "Can't reach the server. Check that the API is running." : fallback);

export default API;
