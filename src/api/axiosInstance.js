import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const axiosInstance = axios.create({
  baseURL: "http://192.168.0.19:8085/api/v0", // ⚠️ change if needed
  headers: {
    "Content-Type": "application/json"
  }
});

// ✅ Attach accode automatically in every request
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const userData = await AsyncStorage.getItem("user");
      const user = userData ? JSON.parse(userData) : null;

      if (user?.accode) {
        config.headers["USERID"] = user.accode;
      }

    } catch (err) {
      console.log("Header Attach Error:", err);
    }

    return config;
  },
  (error) => Promise.reject(error)
);