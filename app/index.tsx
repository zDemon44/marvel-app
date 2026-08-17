import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const storedToken = await AsyncStorage.getItem("token");

      setToken(storedToken);
      setLoading(false);
    };

    checkSession();
  }, []);

  if (loading) {
    return null;
  }

  if (token) {
    return <Redirect href="/home" />;
  }

  return <Redirect href="/login" />;
}