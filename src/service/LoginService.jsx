import { axiosInstance } from "../api/axiosInstance";

export const LoginService = {

  login: async (username, password) => {
    try {

      const payload = {
        name: username,      // ⚠️ match backend field
        password: password
      };

      const response = await axiosInstance.post("/achead/login", payload);
      console.log("Login Response:", response.data);

      return response.data;
      

    } catch (error) {

      console.log("Login Error:", error);

      return {
        success: false,
        message: error.response?.data?.message || "Server Error",
        data: null
      };
    }
  }

};