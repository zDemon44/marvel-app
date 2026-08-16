import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>M</Text>
        </View>

        <Text style={styles.marvel}>MARVEL</Text>

        <Text style={styles.title}>MANAGER</Text>

        <Text style={styles.subtitle}>
          Bienvenido al sistema de gestión Marvel
        </Text>
      </View>

      <View style={styles.menu}>
        <Pressable
          style={styles.card}
          onPress={() => router.push("/(tabs)/heroes")}
        >
          <Text style={styles.icon}>⚡</Text>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              Superhéroes
            </Text>

            <Text style={styles.cardText}>
              Consulta los superhéroes registrados
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>
        <Pressable
         style={styles.card}
         onPress={() => router.push("/(tabs)/misiones")}
        >
          <Text style={styles.icon}>🎯</Text>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              Misiones
            </Text>

            <Text style={styles.cardText}>
              Consulta las misiones disponibles
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        <Pressable
  style={styles.card}
  onPress={() => router.push("/(tabs)/favoritos")}
>
          <Text style={styles.icon}>★</Text>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              Favoritos
            </Text>

            <Text style={styles.cardText}>
              Guarda tus superhéroes favoritos
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>
      </View>

      <Text style={styles.footer}>
        MARVEL MANAGER • API REST • JWT
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#080808",
    padding: 24,
    justifyContent: "center",
  },

  header: {
    alignItems: "center",
    marginBottom: 40,
  },

  logo: {
    width: 70,
    height: 70,
    backgroundColor: "#e62429",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  logoText: {
    color: "#fff",
    fontSize: 45,
    fontWeight: "900",
  },

  marvel: {
    color: "#fff",
    fontSize: 17,
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
    color: "#999",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },

  menu: {
    gap: 14,
  },

  card: {
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#292929",
    borderRadius: 14,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    fontSize: 28,
    width: 50,
    textAlign: "center",
  },

  cardContent: {
    flex: 1,
    marginLeft: 12,
  },

  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },

  cardText: {
    color: "#888",
    fontSize: 13,
    marginTop: 4,
  },

  arrow: {
    color: "#e62429",
    fontSize: 32,
    fontWeight: "300",
  },

  footer: {
    color: "#555",
    textAlign: "center",
    fontSize: 10,
    marginTop: 35,
    letterSpacing: 1,
  },
});