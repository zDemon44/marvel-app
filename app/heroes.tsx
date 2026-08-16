import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  Pressable,
  Alert,
} from "react-native";

import api from "@/services/api";

interface Heroe {
  id: number;
  nombre: string;
  nombre_real: string;
  poder_principal: string;
  nivel_poder: number;
  imagen_url: string | null;
  estado: "ACTIVO" | "INACTIVO";
}

export default function HeroesScreen() {
  const [heroes, setHeroes] = useState<Heroe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarHeroes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/heroes");

      console.log("Respuesta API:", response.data);

      setHeroes(response.data.data || []);
    } catch (error: any) {
      console.log("Error:", error);

      setError(
        error.response?.data?.message ||
          "No se pudieron cargar los superhéroes."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHeroes();
  }, []);

  const mostrarHeroe = (heroe: Heroe) => {
    Alert.alert(
      heroe.nombre,
      `Nombre real: ${heroe.nombre_real}\n\nPoder: ${heroe.poder_principal}\n\nNivel de poder: ${heroe.nivel_poder}\n\nEstado: ${heroe.estado}`
    );
  };

  const renderHeroe = ({ item }: { item: Heroe }) => {
    return (
      <Pressable
        style={styles.card}
        onPress={() => mostrarHeroe(item)}
      >
        {item.imagen_url ? (
          <Image
            source={{ uri: item.imagen_url }}
            style={styles.image}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>MARVEL</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.name}>{item.nombre}</Text>

          <Text style={styles.realName}>
            {item.nombre_real}
          </Text>

          <Text style={styles.power}>
            {item.poder_principal}
          </Text>

          <View style={styles.bottomRow}>
            <Text style={styles.level}>
              Poder: {item.nivel_poder}/100
            </Text>

            <Text
              style={[
                styles.status,
                item.estado === "ACTIVO"
                  ? styles.active
                  : styles.inactive,
              ]}
            >
              {item.estado}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#e62429"
        />

        <Text style={styles.loadingText}>
          Cargando superhéroes...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          Error
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={cargarHeroes}
        >
          <Text style={styles.retryText}>
            REINTENTAR
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>MARVEL</Text>

        <Text style={styles.title}>
          SUPERHÉROES
        </Text>

        <Text style={styles.subtitle}>
          {heroes.length} héroes registrados
        </Text>
      </View>

      {heroes.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>
            No hay superhéroes
          </Text>

          <Text style={styles.emptyText}>
            La API no contiene héroes registrados.
          </Text>
        </View>
      ) : (
        <FlatList
          data={heroes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderHeroe}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onRefresh={cargarHeroes}
          refreshing={loading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },

  logo: {
    color: "#e62429",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 3,
  },

  title: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 5,
  },

  subtitle: {
    color: "#888",
    fontSize: 14,
    marginTop: 5,
  },

  list: {
    padding: 16,
  },

  card: {
    backgroundColor: "#151515",
    borderRadius: 14,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#292929",
  },

  image: {
    width: "100%",
    height: 220,
    backgroundColor: "#222",
  },

  imagePlaceholder: {
    width: "100%",
    height: 220,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderText: {
    color: "#e62429",
    fontSize: 28,
    fontWeight: "900",
  },

  info: {
    padding: 16,
  },

  name: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },

  realName: {
    color: "#999",
    fontSize: 14,
    marginTop: 4,
  },

  power: {
    color: "#ddd",
    fontSize: 15,
    marginTop: 12,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },

  level: {
    color: "#e62429",
    fontSize: 14,
    fontWeight: "800",
  },

  status: {
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    overflow: "hidden",
  },

  active: {
    color: "#7CFC00",
    backgroundColor: "#163016",
  },

  inactive: {
    color: "#ff6b6b",
    backgroundColor: "#351515",
  },

  center: {
    flex: 1,
    backgroundColor: "#080808",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  loadingText: {
    color: "#aaa",
    marginTop: 15,
    fontSize: 15,
  },

  errorTitle: {
    color: "#e62429",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 10,
  },

  errorText: {
    color: "#aaa",
    textAlign: "center",
    fontSize: 15,
  },

  retryButton: {
    backgroundColor: "#e62429",
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 8,
    marginTop: 20,
  },

  retryText: {
    color: "#fff",
    fontWeight: "900",
  },

  emptyTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },

  emptyText: {
    color: "#888",
    marginTop: 8,
    textAlign: "center",
  },
});