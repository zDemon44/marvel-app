import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import api from "@/services/api";
import { colors, radii, shadowOffset } from "@/constants/theme";
import { Tag, HardShadowCard, Input } from "@/components/UI";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Campos requeridos", "Ingresa tu correo y contraseña.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user } = response.data;

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      router.replace("/home");
    } catch (error: any) {
      console.log(error);

      if (error.response?.data?.message) {
        Alert.alert("Error", error.response.data.message);
      } else {
        Alert.alert("Error", "No se pudo conectar con el servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoWrap}>
              <View style={styles.logoShadow} />
              <View style={styles.logo}>
                <Text style={styles.logoText}>M</Text>
              </View>
            </View>

            <Tag style={styles.eyebrow}>MARVEL MANAGER</Tag>

            <Text style={styles.title}>ACCESO AL SISTEMA</Text>

            <Text style={styles.subtitle}>
              Gestión de superhéroes y misiones
            </Text>
          </View>

          <HardShadowCard contentStyle={styles.card}>
            <Text style={styles.cardTitle}>Iniciar sesión</Text>

            <Text style={styles.cardSubtitle}>
              Ingresa tus credenciales para continuar
            </Text>

            <Input
              label="Email"
              icon="mail"
              placeholder="correo@ejemplo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.field}
            />

            <Input
              label="Contraseña"
              icon="lock"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              rightIcon={showPassword ? "eye-off" : "eye"}
              onRightIconPress={() => setShowPassword((v) => !v)}
              style={styles.fieldLast}
            />

            <Pressable
              style={({ pressed }) => [
                styles.button,
                loading && styles.buttonDisabled,
                pressed && !loading && styles.buttonPressed,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>INICIAR SESIÓN →</Text>
              )}
            </Pressable>
          </HardShadowCard>

          <Text style={styles.footer}>MARVEL MANAGER • API REST • JWT</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },

  logoWrap: {
    position: "relative",
  },
  logoShadow: {
    position: "absolute",
    top: shadowOffset,
    left: shadowOffset,
    width: 72,
    height: 72,
    backgroundColor: colors.ink,
    borderRadius: radii.sm,
    transform: [{ skewX: "-8deg" }],
  },
  logo: {
    width: 72,
    height: 72,
    backgroundColor: colors.red,
    borderRadius: radii.sm,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ skewX: "-8deg" }],
  },
  logoText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "900",
    transform: [{ skewX: "8deg" }],
  },

  eyebrow: {
    marginTop: 18,
    marginBottom: 10,
  },

  title: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: 1,
    textAlign: "center",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13.5,
    marginTop: 8,
    textAlign: "center",
  },

  card: {
    padding: 24,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 6,
  },
  cardSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 22,
  },

  field: {
    marginBottom: 16,
  },
  fieldLast: {
    marginBottom: 24,
  },

  button: {
    backgroundColor: colors.red,
    paddingVertical: 15,
    borderRadius: radii.sm,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },

  footer: {
    color: colors.textFaint,
    textAlign: "center",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 26,
    letterSpacing: 1,
  },
});