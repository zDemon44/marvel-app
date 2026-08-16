import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import api from "@/services/api";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(
        "Campos requeridos",
        "Ingresa tu correo y contraseña."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      router.replace("/home");
    } catch (error: any) {
      console.log(error);

      if (error.response?.data?.message) {
        Alert.alert(
          "Error",
          error.response.data.message
        );
      } else {
        Alert.alert(
          "Error",
          "No se pudo conectar con el servidor."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>M</Text>
          </View>

          <Text style={styles.marvel}>MARVEL</Text>

          <Text style={styles.title}>MANAGER</Text>

          <Text style={styles.subtitle}>
            Gestión de superhéroes y misiones
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Iniciar sesión
          </Text>

          <Text style={styles.cardSubtitle}>
            Ingresa tus credenciales para continuar
          </Text>

          <Text style={styles.label}>
            Email
          </Text>

          <TextInput
            style={styles.input}
            placeholder="correo@ejemplo.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>
            Contraseña
          </Text>

          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Pressable
            style={[
              styles.button,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                INICIAR SESIÓN →
              </Text>
            )}
          </Pressable>
        </View>

        <Text style={styles.footer}>
          MARVEL MANAGER • API REST • JWT
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 35,
  },

  logo: {
    width: 75,
    height: 75,
    backgroundColor: "#e62429",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 12,
  },

  logoText: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "900",
  },

  marvel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 4,
  },

  title: {
    color: "#e62429",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 2,
  },

  subtitle: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#151515",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#292929",
  },

  cardTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
  },

  cardSubtitle: {
    color: "#999",
    fontSize: 14,
    marginBottom: 25,
  },

  label: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#222",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    color: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 18,
  },

  button: {
    backgroundColor: "#e62429",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1,
  },

  footer: {
    color: "#666",
    textAlign: "center",
    fontSize: 11,
    marginTop: 25,
    letterSpacing: 1,
  },
});