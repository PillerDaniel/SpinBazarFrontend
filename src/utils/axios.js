import axios from "axios";

const getToken = () => localStorage.getItem("token");
const setToken = (token) => localStorage.setItem("token", token);
const removeToken = () => localStorage.removeItem("token");

const axiosInstance = axios.create({
  baseURL: "http://localhost:5051/api",
  withCredentials: true, 
});

// --- Request Interceptor ---
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token && !config.url.endsWith("/auth/refresh")) {
      config.headers.Authorization = `Bearer ${token}`;
    } 
    return config;
  },
  (error) => {
    console.error("Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error); 
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 403) {
      console.log("Received 403 Forbidden, logging out user");
      removeToken();
      window.location = '/login';
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      originalRequest.url !== "/auth/refresh" && 
      !originalRequest._retry
    ) {

      if (isRefreshing) {
        console.log("Refresh already in progress, queueing request:", originalRequest.url);
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            console.log("Retrying queued request with new token:", originalRequest.url);
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return axiosInstance(originalRequest); 
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      console.log("Received 401, attempting token refresh...");
      originalRequest._retry = true; 
      isRefreshing = true;

      try {
        const { data } = await axiosInstance.post("/auth/refresh");

        const newAccessToken = data.token; 
        console.log("Token refreshed successfully.");
        setToken(newAccessToken); 

        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        console.log("Retrying original request with new token:", originalRequest.url);
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        console.error("Unable to refresh token:", refreshError.response?.data || refreshError.message);
        removeToken();
        processQueue(refreshError, null);
        isRefreshing = false;

        window.location = '/login';
        console.log("Redirecting to login due to refresh failure...");

        return Promise.reject(refreshError);
      } 
    }

    console.error("API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      retryFlag: originalRequest?._retry,
    });
    return Promise.reject(error);
  }
);

export default axiosInstance;