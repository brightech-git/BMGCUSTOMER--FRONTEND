import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthStorage = {
  setUser: async (user) => {
    await AsyncStorage.setItem("user", JSON.stringify(user));
  },

  getUser: async () => {
    const data = await AsyncStorage.getItem("user");
    return data ? JSON.parse(data) : null;
  },

  getAccode: async () => {
    const user = await AuthStorage.getUser();
    return user?.accode || null;
  },

  getName: async () => {
    const user = await AuthStorage.getUser();
    return user?.name || "User";
  },

  clear: async () => {
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("userToken");
  }
};