import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  Modal,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import api from "@/services/api";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from "@/services/favorites";
import HeroFormModal from "@/components/HeroFormModal";
import { colors } from "@/constants/theme";

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
  const [refreshing, setRefreshing] = useState(false);

  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  const [heroeSeleccionado, setHeroeSeleccionado] =
    useState<Heroe | null>(null);

  // MODAL FORMULARIO
  const [formModalVisible, setFormModalVisible] =
    useState(false);
  const [heroeEdicion, setHeroeEdicion] =
    useState<Heroe | null>(null);

  // =========================
  // CARGAR HÉROES
  // =========================

  const cargarHeroes = async (isRefresh: boolean | any = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
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
      setRefreshing(false);
    }
  };

  // =========================
  // CARGAR FAVORITOS
  // =========================

  const cargarFavoritos = async () => {
    try {
      const favoritos = await getFavorites();

      setFavoriteIds(
        favoritos.map((hero: Heroe) => hero.id)
      );
    } catch (error) {
      console.log("Error cargando favoritos:", error);
    }
  };

  // =========================
  // AGREGAR / QUITAR FAVORITO
  // =========================

  const toggleFavorito = async (heroe: Heroe) => {
    const esFavorito = favoriteIds.includes(heroe.id);

    if (esFavorito) {
      await removeFavorite(heroe.id);

      setFavoriteIds((prev) =>
        prev.filter((id) => id !== heroe.id)
      );
    } else {
      await addFavorite(heroe);

      setFavoriteIds((prev) => [
        ...prev,
        heroe.id,
      ]);
    }
  };

  // =========================
  // CRUD OPERATIONS
  // =========================

  const abrirFormularioCrear = () => {
    setHeroeEdicion(null);
    setFormModalVisible(true);
  };

  const abrirFormularioEditar = (heroe: Heroe) => {
    setHeroeEdicion(heroe);
    setFormModalVisible(true);
    setHeroeSeleccionado(null);
  };

  const eliminarHeroe = async (heroeId: number, nombreHeroe: string) => {
    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de que deseas eliminar a ${nombreHeroe}? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", onPress: () => {}, style: "cancel" },
        {
          text: "Eliminar",
          onPress: async () => {
            try {
              await api.delete(`/heroes/${heroeId}`);
              Alert.alert("Éxito", "Superhéroe eliminado correctamente");
              cargarHeroes();
              setHeroeSeleccionado(null);
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.response?.data?.message ||
                  "No se pudo eliminar el superhéroe"
              );
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  // =========================
  // INICIO
  // =========================

  useEffect(() => {
    cargarHeroes();
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarFavoritos();
    }, [])
  );

  // =========================
  // MOSTRAR DETALLES
  // =========================

  const mostrarHeroe = (heroe: Heroe) => {
    setHeroeSeleccionado(heroe);
  };

  // =========================
  // TARJETA DEL HÉROE
  // =========================

  const renderHeroe = ({ item }: { item: Heroe }) => {
    const esFavorito = favoriteIds.includes(item.id);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
        onPress={() => mostrarHeroe(item)}
      >
        {/* IMAGEN */}
        <View style={styles.imageContainer}>
          {item.imagen_url ? (
            <Image
              source={{ uri: item.imagen_url }}
              style={styles.image}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>
                MARVEL
              </Text>
            </View>
          )}

          {/* FAVORITO */}
          <Pressable
            style={styles.favoriteButton}
            onPress={(event) => {
              event.stopPropagation();
              toggleFavorito(item);
            }}
          >
            <Text
              style={[
                styles.favoriteIcon,
                esFavorito && styles.favoriteActive,
              ]}
            >
              {esFavorito ? "★" : "☆"}
            </Text>
          </Pressable>

          {/* ESTADO */}
          <View
            style={[
              styles.statusBadge,
              item.estado === "ACTIVO"
                ? styles.activeBadge
                : styles.inactiveBadge,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                item.estado === "ACTIVO"
                  ? styles.activeDot
                  : styles.inactiveDot,
              ]}
            />

            <Text
              style={[
                styles.statusText,
                item.estado === "ACTIVO"
                  ? styles.activeText
                  : styles.inactiveText,
              ]}
            >
              {item.estado}
            </Text>
          </View>

          {/* NIVEL DE PODER */}
          <View style={styles.powerBadge}>
            <Text style={styles.powerBadgeNumber}>
              {item.nivel_poder}
            </Text>

            <Text style={styles.powerBadgeText}>
              PODER
            </Text>
          </View>
        </View>

        {/* INFORMACIÓN */}
        <View style={styles.info}>
          <Text style={styles.name}>
            {item.nombre}
          </Text>

          <Text style={styles.realName}>
            {item.nombre_real}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.powerLabel}>
            PODER PRINCIPAL
          </Text>

          <Text style={styles.power}>
            {item.poder_principal}
          </Text>

          {/* BARRA DE PODER */}
          <View style={styles.powerHeader}>
            <Text style={styles.powerTitle}>
              NIVEL DE PODER
            </Text>

            <Text style={styles.powerValue}>
              {item.nivel_poder}/100
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(
                    item.nivel_poder,
                    100
                  )}%`,
                },
              ]}
            />
          </View>

          <View style={styles.detailsRow}>
            <Text style={styles.detailsText}>
              ID #{item.id}
            </Text>

            <Text style={styles.detailsAction}>
              VER DETALLES ›
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  // =========================
  // CARGANDO
  // =========================

  if (loading && heroes.length === 0) {
    return (
      <View style={styles.center}>
        <View style={styles.loadingLogo}>
          <Text style={styles.loadingLogoText}>
            M
          </Text>
        </View>

        <ActivityIndicator
          size="large"
          color="#e62429"
        />

        <Text style={styles.loadingTitle}>
          Cargando superhéroes
        </Text>

        <Text style={styles.loadingText}>
          Conectando con Marvel API...
        </Text>
      </View>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error && heroes.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>
          !
        </Text>

        <Text style={styles.errorTitle}>
          Error
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={() => cargarHeroes(false)}
        >
          <Text style={styles.retryText}>
            REINTENTAR
          </Text>
        </Pressable>
      </View>
    );
  }

  // =========================
  // PANTALLA PRINCIPAL
  // =========================

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSmall}>
            MARVEL
          </Text>

          <Text style={styles.headerTitle}>
            SUPERHÉROES
          </Text>

          <Text style={styles.headerSubtitle}>
            {heroes.length} héroes registrados
          </Text>
        </View>

        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeNumber}>
            {heroes.length}
          </Text>

          <Text style={styles.headerBadgeText}>
            HÉROES
          </Text>
        </View>
      </View>

      {/* LISTA */}
      <FlatList
        data={heroes}
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={renderHeroe}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => cargarHeroes(true)}
            tintColor="#e62429"
            colors={["#e62429"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>
              ?
            </Text>

            <Text style={styles.emptyTitle}>
              No hay superhéroes
            </Text>

            <Text style={styles.emptyText}>
              La API todavía no contiene héroes registrados.
            </Text>
          </View>
        }
      />

      {/* =========================
          MODAL DETALLES
         ========================= */}

      <Modal
        visible={heroeSeleccionado !== null}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setHeroeSeleccionado(null)
        }
      >
        <View style={styles.modalOverlay}>

          {/* FONDO */}
          <Pressable
            style={styles.modalBackground}
            onPress={() =>
              setHeroeSeleccionado(null)
            }
          />

          {heroeSeleccionado && (
            <View style={styles.detailCard}>

              {/* CERRAR */}
              <Pressable
                style={styles.closeButton}
                onPress={() =>
                  setHeroeSeleccionado(null)
                }
              >
                <Text style={styles.closeButtonText}>
                  ×
                </Text>
              </Pressable>

              {/* IMAGEN */}
              <View style={styles.detailImageContainer}>

                {heroeSeleccionado.imagen_url ? (
                  <Image
                    source={{
                      uri: heroeSeleccionado.imagen_url,
                    }}
                    style={styles.detailImage}
                  />
                ) : (
                  <View
                    style={
                      styles.detailImagePlaceholder
                    }
                  >
                    <Text
                      style={styles.placeholderText}
                    >
                      MARVEL
                    </Text>
                  </View>
                )}

                <View
                  style={styles.detailImageOverlay}
                />

                <View
                  style={styles.detailHeroName}
                >
                  <Text style={styles.detailName}>
                    {heroeSeleccionado.nombre}
                  </Text>

                  <Text
                    style={styles.detailRealName}
                  >
                    {heroeSeleccionado.nombre_real}
                  </Text>
                </View>
              </View>

              {/* INFORMACIÓN */}
              <View style={styles.detailContent}>

                <Text
                  style={styles.detailSectionTitle}
                >
                  INFORMACIÓN DEL HÉROE
                </Text>

                {/* FAVORITO */}
                <Pressable
                  style={styles.modalFavoriteButton}
                  onPress={() =>
                    toggleFavorito(
                      heroeSeleccionado
                    )
                  }
                >
                  <Text
                    style={styles.modalFavoriteIcon}
                  >
                    {favoriteIds.includes(
                      heroeSeleccionado.id
                    )
                      ? "★"
                      : "☆"}
                  </Text>

                  <Text
                    style={styles.modalFavoriteText}
                  >
                    {favoriteIds.includes(
                      heroeSeleccionado.id
                    )
                      ? "EN FAVORITOS"
                      : "AGREGAR A FAVORITOS"}
                  </Text>
                </Pressable>

                {/* PODER */}
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>
                    ⚡ PODER PRINCIPAL
                  </Text>

                  <Text style={styles.detailValue}>
                    {
                      heroeSeleccionado.poder_principal
                    }
                  </Text>
                </View>

                {/* NIVEL */}
                <View style={styles.detailItem}>
                  <View
                    style={
                      styles.detailPowerHeader
                    }
                  >
                    <Text
                      style={styles.detailLabel}
                    >
                      💥 NIVEL DE PODER
                    </Text>

                    <Text
                      style={styles.detailPowerValue}
                    >
                      {
                        heroeSeleccionado.nivel_poder
                      }
                      /100
                    </Text>
                  </View>

                  <View
                    style={
                      styles.detailProgressBackground
                    }
                  >
                    <View
                      style={[
                        styles.detailProgressBar,
                        {
                          width: `${Math.min(
                            heroeSeleccionado.nivel_poder,
                            100
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* ESTADO */}
                <View style={styles.detailRow}>
                  <View>
                    <Text
                      style={styles.detailLabel}
                    >
                      ESTADO
                    </Text>

                    <Text
                      style={
                        styles.detailSmallText
                      }
                    >
                      Estado actual del héroe
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.detailStatus,
                      heroeSeleccionado.estado ===
                      "ACTIVO"
                        ? styles.detailActive
                        : styles.detailInactive,
                    ]}
                  >
                    <View
                      style={[
                        styles.detailStatusDot,
                        heroeSeleccionado.estado ===
                        "ACTIVO"
                          ? styles.detailActiveDot
                          : styles.detailInactiveDot,
                      ]}
                    />

                    <Text
                      style={[
                        styles.detailStatusText,
                        heroeSeleccionado.estado ===
                        "ACTIVO"
                          ? styles.detailActiveText
                          : styles.detailInactiveText,
                      ]}
                    >
                      {heroeSeleccionado.estado}
                    </Text>
                  </View>
                </View>

                {/* ID */}
                <View
                  style={styles.detailIdContainer}
                >
                  <Text
                    style={styles.detailIdLabel}
                  >
                    IDENTIFICADOR
                  </Text>

                  <Text style={styles.detailId}>
                    #{heroeSeleccionado.id}
                  </Text>
                </View>

                {/* CERRAR */}
                <Pressable
                  style={styles.closeMainButton}
                  onPress={() =>
                    setHeroeSeleccionado(null)
                  }
                >
                  <Text
                    style={styles.closeMainButtonText}
                  >
                    CERRAR
                  </Text>
                </Pressable>

                {/* ACCIONES CRUD */}
                <View style={styles.actionButtons}>
                  <Pressable
                    style={styles.editButton}
                    onPress={() =>
                      abrirFormularioEditar(
                        heroeSeleccionado
                      )
                    }
                  >
                    <Feather
                      name="edit-2"
                      size={16}
                      color="#fff"
                    />
                    <Text
                      style={styles.editButtonText}
                    >
                      EDITAR
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.deleteButton}
                    onPress={() =>
                      eliminarHeroe(
                        heroeSeleccionado.id,
                        heroeSeleccionado.nombre
                      )
                    }
                  >
                    <Feather
                      name="trash-2"
                      size={16}
                      color="#fff"
                    />
                    <Text
                      style={styles.deleteButtonText}
                    >
                      ELIMINAR
                    </Text>
                  </Pressable>
                </View>

              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* =========================
          MODAL FORMULARIO
         ========================= */}
      <HeroFormModal
        visible={formModalVisible}
        onClose={() => setFormModalVisible(false)}
        onSuccess={() => {
          cargarHeroes();
          cargarFavoritos();
        }}
        heroe={heroeEdicion}
      />

      {/* BOTÓN CREAR */}
      <Pressable
        style={styles.createButton}
        onPress={abrirFormularioCrear}
      >
        <Feather name="plus" size={24} color="#fff" />
      </Pressable>
    </View>
  );
}

// =====================================================
// ESTILOS
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808",
  },

  // HEADER

  header: {
    paddingTop: 58,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#0d0d0d",
    borderBottomWidth: 1,
    borderBottomColor: "#242424",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerSmall: {
    color: "#e62429",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 4,
  },

  headerTitle: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 3,
    letterSpacing: 1,
  },

  headerSubtitle: {
    color: "#777",
    fontSize: 13,
    marginTop: 5,
  },

  headerBadge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#e62429",
    justifyContent: "center",
    alignItems: "center",
  },

  headerBadgeNumber: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "900",
  },

  headerBadgeText: {
    color: "#ffffff",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1,
  },

  // LISTA

  list: {
    padding: 16,
    paddingBottom: 30,
  },

  // CARD

  card: {
    backgroundColor: "#151515",
    borderRadius: 18,
    marginBottom: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#292929",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },

  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
  },

  // IMAGEN

  imageContainer: {
    width: "100%",
    height: 245,
    backgroundColor: "#222",
    position: "relative",
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#202020",
  },

  placeholderText: {
    color: "#e62429",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 3,
  },

  // FAVORITO

  favoriteButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(0,0,0,0.78)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  favoriteIcon: {
    color: "#ffffff",
    fontSize: 30,
  },

  favoriteActive: {
    color: "#FFD700",
  },

  // ESTADO

  statusBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  activeBadge: {
    backgroundColor: "rgba(15, 70, 25, 0.95)",
  },

  inactiveBadge: {
    backgroundColor: "rgba(80, 20, 20, 0.95)",
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  activeDot: {
    backgroundColor: "#65d66f",
  },

  inactiveDot: {
    backgroundColor: "#ff5c5c",
  },

  statusText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  activeText: {
    color: "#7ee787",
  },

  inactiveText: {
    color: "#ff8585",
  },

  // PODER

  powerBadge: {
    position: "absolute",
    right: 14,
    bottom: 14,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(0,0,0,0.85)",
    borderWidth: 2,
    borderColor: "#e62429",
    justifyContent: "center",
    alignItems: "center",
  },

  powerBadgeNumber: {
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "900",
  },

  powerBadgeText: {
    color: "#e62429",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1,
  },

  // INFO

  info: {
    padding: 17,
  },

  name: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
  },

  realName: {
    color: "#777",
    fontSize: 14,
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: "#292929",
    marginVertical: 14,
  },

  powerLabel: {
    color: "#e62429",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  power: {
    color: "#dddddd",
    fontSize: 15,
    marginTop: 6,
    lineHeight: 21,
  },

  powerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 17,
    marginBottom: 7,
  },

  powerTitle: {
    color: "#999",
    fontSize: 12,
    fontWeight: "600",
  },

  powerValue: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },

  progressBackground: {
    width: "100%",
    height: 7,
    backgroundColor: "#2a2a2a",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    backgroundColor: "#e62429",
    borderRadius: 10,
  },

  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },

  detailsText: {
    color: "#555",
    fontSize: 11,
    fontWeight: "700",
  },

  detailsAction: {
    color: "#e62429",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  // LOADING

  center: {
    flex: 1,
    backgroundColor: "#080808",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  loadingLogo: {
    width: 70,
    height: 70,
    backgroundColor: "#e62429",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },

  loadingLogoText: {
    color: "#ffffff",
    fontSize: 44,
    fontWeight: "900",
  },

  loadingTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 15,
  },

  loadingText: {
    color: "#777",
    fontSize: 13,
    marginTop: 6,
  },

  // ERROR

  errorIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#e62429",
    color: "#e62429",
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 56,
    marginBottom: 18,
  },

  errorTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8,
  },

  errorText: {
    color: "#888",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
  },

  retryButton: {
    backgroundColor: "#e62429",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 9,
    marginTop: 22,
  },

  retryText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },

  // EMPTY

  empty: {
    alignItems: "center",
    paddingTop: 100,
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "#222",
    color: "#e62429",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 55,
  },

  emptyTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 18,
  },

  emptyText: {
    color: "#777",
    textAlign: "center",
    marginTop: 7,
    lineHeight: 20,
  },

  // =========================
  // MODAL
  // =========================

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },

  modalBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.88)",
  },

  detailCard: {
    width: "100%",
    maxWidth: 430,
    backgroundColor: "#151515",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#303030",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.6,
    shadowRadius: 15,
  },

  closeButton: {
    position: "absolute",
    right: 14,
    top: 14,
    zIndex: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#555",
  },

  closeButtonText: {
    color: "#fff",
    fontSize: 27,
    fontWeight: "300",
    lineHeight: 30,
  },

  detailImageContainer: {
    width: "100%",
    height: 280,
    position: "relative",
    backgroundColor: "#222",
  },

  detailImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  detailImagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222",
  },

  detailImageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 130,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },

  detailHeroName: {
    position: "absolute",
    left: 20,
    bottom: 18,
    right: 60,
  },

  detailName: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "900",
  },

  detailRealName: {
    color: "#bbb",
    fontSize: 14,
    marginTop: 3,
  },

  detailContent: {
    padding: 20,
  },

  detailSectionTitle: {
    color: "#e62429",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 18,
  },

  // FAVORITO DEL MODAL

  modalFavoriteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
  },

  modalFavoriteIcon: {
    color: "#FFD700",
    fontSize: 23,
    marginRight: 10,
  },

  modalFavoriteText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  detailItem: {
    marginBottom: 18,
  },

  detailLabel: {
    color: "#888",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 6,
  },

  detailValue: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
  },

  detailPowerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  detailPowerValue: {
    color: "#e62429",
    fontSize: 16,
    fontWeight: "900",
  },

  detailProgressBackground: {
    width: "100%",
    height: 9,
    backgroundColor: "#2a2a2a",
    borderRadius: 10,
    overflow: "hidden",
  },

  detailProgressBar: {
    height: "100%",
    backgroundColor: "#e62429",
    borderRadius: 10,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },

  detailSmallText: {
    color: "#555",
    fontSize: 11,
    marginTop: 2,
  },

  detailStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },

  detailActive: {
    backgroundColor: "#163016",
  },

  detailInactive: {
    backgroundColor: "#351515",
  },

  detailStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 7,
  },

  detailActiveDot: {
    backgroundColor: "#65d66f",
  },

  detailInactiveDot: {
    backgroundColor: "#ff5c5c",
  },

  detailStatusText: {
    fontSize: 10,
    fontWeight: "900",
  },

  detailActiveText: {
    color: "#7ee787",
  },

  detailInactiveText: {
    color: "#ff8585",
  },

  detailIdContainer: {
    marginTop: 18,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#292929",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  detailIdLabel: {
    color: "#555",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },

  detailId: {
    color: "#888",
    fontSize: 13,
    fontWeight: "800",
  },

  closeMainButton: {
    backgroundColor: "#e62429",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },

  closeMainButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  // ACCIONES CRUD

  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },

  editButton: {
    flex: 1,
    backgroundColor: "#3f7fd1",
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  editButtonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  deleteButton: {
    flex: 1,
    backgroundColor: "#e62429",
    borderRadius: 10,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  deleteButtonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  // CREATE BUTTON

  createButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e62429",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});