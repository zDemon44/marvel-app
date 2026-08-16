import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Pressable,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "expo-router";

import {
  getFavorites,
  removeFavorite,
} from "@/services/favorites";

interface Heroe {
  id: number;
  nombre: string;
  nombre_real: string;
  poder_principal: string;
  nivel_poder: number;
  imagen_url: string | null;
  estado: "ACTIVO" | "INACTIVO";
}

export default function FavoritosScreen() {
  const [favoritos, setFavoritos] = useState<Heroe[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarFavoritos = async () => {
    try {
      setLoading(true);

      const data = await getFavorites();

      setFavoritos(data);
    } catch (error) {
      console.log("Error cargando favoritos:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarFavoritos();
    }, [])
  );

  const eliminarFavorito = async (id: number) => {
    await removeFavorite(id);

    setFavoritos((prev) =>
      prev.filter((hero) => hero.id !== id)
    );
  };

  const renderFavorito = ({
    item,
  }: {
    item: Heroe;
  }) => {
    return (
      <View style={styles.card}>
        {item.imagen_url ? (
          <Image
            source={{ uri: item.imagen_url }}
            style={styles.image}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              M
            </Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.name}>
            {item.nombre}
          </Text>

          <Text style={styles.realName}>
            {item.nombre_real}
          </Text>

          <Text style={styles.power}>
            ⚡ {item.poder_principal}
          </Text>

          <View style={styles.bottomRow}>
            <Text style={styles.level}>
              Poder {item.nivel_poder}/100
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

        <Pressable
          style={styles.removeButton}
          onPress={() =>
            eliminarFavorito(item.id)
          }
        >
          <Text style={styles.removeText}>
            ★
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.headerSmall}>
          MARVEL
        </Text>

        <Text style={styles.title}>
          FAVORITOS
        </Text>

        <Text style={styles.subtitle}>
          {favoritos.length} héroes guardados
        </Text>
      </View>

      {/* LISTA */}

      {favoritos.length === 0 && !loading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>
            ☆
          </Text>

          <Text style={styles.emptyTitle}>
            No tienes favoritos
          </Text>

          <Text style={styles.emptyText}>
            Ve a la sección de superhéroes y pulsa
            la estrella para agregar uno.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favoritos}
          keyExtractor={(item) =>
            item.id.toString()
          }
          renderItem={renderFavorito}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={cargarFavoritos}
              tintColor="#e62429"
              colors={["#e62429"]}
            />
          }
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
    paddingTop: 58,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#0d0d0d",
    borderBottomWidth: 1,
    borderBottomColor: "#242424",
  },

  headerSmall: {
    color: "#e62429",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 4,
  },

  title: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 3,
  },

  subtitle: {
    color: "#777",
    fontSize: 13,
    marginTop: 5,
  },

  list: {
    padding: 16,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#151515",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#292929",
    flexDirection: "row",
    position: "relative",
  },

  image: {
    width: 115,
    height: 145,
    resizeMode: "cover",
  },

  placeholder: {
    width: 115,
    height: 145,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderText: {
    color: "#e62429",
    fontSize: 42,
    fontWeight: "900",
  },

  info: {
    flex: 1,
    padding: 15,
    paddingRight: 45,
  },

  name: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "900",
  },

  realName: {
    color: "#777",
    fontSize: 13,
    marginTop: 3,
  },

  power: {
    color: "#ccc",
    fontSize: 13,
    marginTop: 14,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
  },

  level: {
    color: "#e62429",
    fontSize: 11,
    fontWeight: "800",
  },

  status: {
    fontSize: 9,
    fontWeight: "900",
  },

  active: {
    color: "#65d66f",
  },

  inactive: {
    color: "#ff5c5c",
  },

  removeButton: {
    position: "absolute",
    right: 12,
    top: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#252525",
    justifyContent: "center",
    alignItems: "center",
  },

  removeText: {
    color: "#e62429",
    fontSize: 22,
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 35,
  },

  emptyIcon: {
    color: "#e62429",
    fontSize: 70,
    marginBottom: 15,
  },

  emptyTitle: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "900",
  },

  emptyText: {
    color: "#777",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    textAlignVertical: "center",
  },
});