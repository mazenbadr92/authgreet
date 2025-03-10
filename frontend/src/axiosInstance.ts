import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "./stores/auth.store";

const API_URL = "http://localhost:3000";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Attach access token from the store to every outgoing request (except login)
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Ensure headers is defined
    if (!config.headers) {
      config.headers = {} as any;
    }
    // Avoid attaching token for login endpoint
    if (config.url && config.url.includes("/authenticate/auth")) {
      return config;
    }
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// We'll queue failed requests while refreshing token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

// Response interceptor: on 401 errors (except for login), try to refresh token and retry the request.
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };
    // If we get a 401 and this isn't the login endpoint, attempt refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url &&
      !originalRequest.url.includes("/authenticate/login")
    ) {
      originalRequest._retry = true;
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers["Authorization"] = "Bearer " + token;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      return new Promise(async (resolve, reject) => {
        try {
          // Call refresh endpoint. No token needed in the request body because the refresh token is in an HttpOnly cookie.
          const refreshResponse = await axiosInstance.post(
            "/tokens/refresh",
            {}
          );
          const newAccessToken = refreshResponse.data.accessToken;
          // Update our Zustand store with the new access token.
          useAuthStore.setState({ accessToken: newAccessToken });
          if (originalRequest.headers) {
            originalRequest.headers["Authorization"] =
              "Bearer " + newAccessToken;
          }
          processQueue(null, newAccessToken);
          resolve(axiosInstance(originalRequest));
        } catch (err) {
          processQueue(err, null);
          // Optionally, clear the store and redirect to login.
          useAuthStore.setState({ accessToken: "" });
          window.location.href = "/auth";
          reject(err);
        } finally {
          isRefreshing = false;
        }
      });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
