import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let authConfig = {
  getAccessToken: () => null,
  getRefreshToken: () => null,
  onAuthUpdate: () => {},
  onLogout: () => {},
};

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const onRefreshFailed = () => {
  refreshSubscribers.forEach((callback) => callback(null));
  refreshSubscribers = [];
};

export const configureAuth = ({
  getAccessToken,
  getRefreshToken,
  onAuthUpdate,
  onLogout,
}) => {
  authConfig = {
    getAccessToken: getAccessToken ?? (() => null),
    getRefreshToken: getRefreshToken ?? (() => null),
    onAuthUpdate: onAuthUpdate ?? (() => {}),
    onLogout: onLogout ?? (() => {}),
  };
};

api.interceptors.request.use(
  (config) => {
    if (config.headers?.Authorization) {
      return config;
    }

    const token = authConfig.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry ||
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const attemptedRefreshToken = authConfig.getRefreshToken();
      if (!attemptedRefreshToken) {
        throw new Error("Missing refresh token");
      }

      let payload;

      try {
        const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken: attemptedRefreshToken,
        });
        payload = refreshResponse.data;
      } catch (firstRefreshError) {
        const latestRefreshToken = authConfig.getRefreshToken();

        if (
          !latestRefreshToken ||
          latestRefreshToken === attemptedRefreshToken
        ) {
          throw firstRefreshError;
        }

        const secondRefreshResponse = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {
            refreshToken: latestRefreshToken,
          },
        );
        payload = secondRefreshResponse.data;
      }

      authConfig.onAuthUpdate(payload);
      onRefreshed(payload.accessToken);
      api.defaults.headers.common.Authorization = `Bearer ${payload.accessToken}`;

      originalRequest.headers.Authorization = `Bearer ${payload.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      onRefreshFailed();
      authConfig.onLogout();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
