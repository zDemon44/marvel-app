import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: "http://192.168.100.17:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    if (error?.response?.status === 401) {
      console.log("401 detectado: sesión expirada");

      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");

      error.sessionExpired = true;
    }

    return Promise.reject(error);
  }
);

export default api;