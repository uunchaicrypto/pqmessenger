import { createContext, useEffect, useState, useContext } from "react";
import { AxiosClient } from "../utils/AxiosClient";
import toast from "react-hot-toast";

const AuthContext = createContext({
  user: null,
  fetchUserProfile: () => {},
  logout: () => {},
});

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const response = await AxiosClient.get("/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      const data = response.data;
      setUser(data);
      return data; // Full user object
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUser(null);
    toast.success("Logout successful!");
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <AuthContext.Provider value={{ user, fetchUserProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => useContext(AuthContext);
