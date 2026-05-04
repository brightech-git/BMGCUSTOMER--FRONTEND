import { axiosInstance } from "../api/axiosInstance";

export const CreateUserService = {

  createUser: async (username, password) => {

    try {

      const payload = {
        name: username,
        password: password
      };

      const response = await axiosInstance.post("/achead", payload);

      return response.data;

    } catch (error) {

      if (error.response) {
        return error.response.data;
      }

      return {
        success: false,
        message: "Server Error",
        data: null
      };
    }

  }

};