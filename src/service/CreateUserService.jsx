// src/service/CreateUserService.js
import { axiosInstance } from "../api/axiosInstance";

export const CreateUserService = {
  // Create new user
  createUser: async (username, password) => {
    try {
      const payload = {
        name: username,
        password: password,
      };

      const response = await axiosInstance.post("/achead", payload);

      return response.data;
    } catch (error) {
      console.log("Create User Error", error);
      if (error.response) {
        return error.response.data;
      }
      return {
        success: false,
        message: "Network Error",
        data: null,
      };
    }
  },

  // Get all users
  getAllUsers: async () => {
    try {
      const response = await axiosInstance.get("/achead");

      return response.data;
    } catch (error) {
      console.log("Get All Users Error", error);
      if (error.response) {
        return error.response.data;
      }
      return {
        success: false,
        message: "Network Error",
        data: null,
      };
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await axiosInstance.get(`/achead/${id}`);

      return response.data;
    } catch (error) {
      console.log("Get User Error", error);
      if (error.response) {
        return error.response.data;
      }
      return {
        success: false,
        message: "Network Error",
        data: null,
      };
    }
  },

  // Update password
  updatePassword: async (id, oldPassword, newPassword) => {
    try {
      const response = await axiosInstance.put(`/achead/${id}/password`, {
        oldPassword,
        newPassword,
      });

      return response.data;
    } catch (error) {
      console.log("Update Password Error", error);
      if (error.response) {
        return error.response.data;
      }
      return {
        success: false,
        message: "Network Error",
        data: null,
      };
    }
  },
};