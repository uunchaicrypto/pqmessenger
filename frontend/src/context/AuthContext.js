// src/context/AuthContext.js
import { createContext, useEffect, useState, useContext } from "react";
import { AxiosClient } from "../utils/AxiosClient";
import toast from "react-hot-toast";

const AuthContext = createContext({
  user: null,
  loading: true, // include loading
  fetchUserProfile: () => {},
  logout: () => {},
});

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // loading state

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return null;
    }

    try {
      const response = await AxiosClient.get("/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      const data = response.data;
      setUser(data);
      return data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUser(null); // make sure to reset user
      return null;
    } finally {
      setLoading(false);
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
    <AuthContext.Provider value={{ user, loading, fetchUserProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => useContext(AuthContext);
