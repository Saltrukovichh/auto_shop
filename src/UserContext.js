import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token); // Отладка
    if (token) {
      try {
        const response = await axios.get("http://localhost:5001/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("User data from /api/me:", response.data); // Отладка
        if (response.data && response.data.username && response.data.email) {
            console.log(`HYIIDSA ${JSON.stringify(response.data)}`)
          setUser(response.data);
        } else {
          console.error("Invalid user data structure:", response.data);
          setUser(null);
        }
      } catch (error) {
        console.error("Ошибка загрузки данных пользователя:", error);
        localStorage.removeItem("token"); // Очистка токена
        setUser(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const loginUser = async (credentials) => {
    try {
      const response = await axios.post("http://localhost:5001/api/login", credentials);
      localStorage.setItem("token", response.data.token);
      console.log("Token saved:", response.data.token); // Отладка
      await fetchUserData(); // Повторная загрузка данных пользователя
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loading, loginUser, logoutUser, fetchUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};