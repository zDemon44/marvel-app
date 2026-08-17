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
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import api from "@/services/api";

import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from "@/services/favorites";

import HeroFormModal from "@/components/HeroFormModal";

import {
  colors,
  radii,
} from "@/constants/theme";

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
  // ==========================================
  // ESTADOS
  // ==========================================

  const [heroes, setHeroes] = useState<Heroe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  const [heroeSeleccionado, setHeroeSeleccionado] =
    useState<Heroe | null>(null);

  const [formModalVisible, setFormModalVisible] =
    useState(false);

  const [heroeEdicion, setHeroeEdicion] =
    useState<Heroe | null>(null);

  // ==========================================
  // USUARIO / ROL
  // ==========================================

  const [userRole, setUserRole] = useState("");

  const isAdmin = userRole === "ADMIN";

  // ==========================================
  // CARGAR USUARIO
  // ==========================================

  const cargarUsuario = async () => {
    try {
      const raw = await AsyncStorage.getItem("user");

      if (raw) {
        const user = JSON.parse(raw);

        setUserRole(user?.rol ?? "");
      }
    } catch (error) {
      console.error(
        "Error cargando usuario:",
        error
      );
    }
  };

  // ==========================================
  // CARGAR HÉROES
  // ==========================================

  const cargarHeroes = async (
    isRefresh = false
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/heroes");

      setHeroes(response.data.data || []);
    } catch (error: any) {
      console.error(
        "Error cargando héroes:",
        error
      );

      setError(
        error.response?.data?.message ||
          "No se pudieron cargar los superhéroes."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==========================================
  // CARGAR FAVORITOS
  // ==========================================

  const cargarFavoritos = async () => {
    try {
      const favoritos = await getFavorites();

      setFavoriteIds(
        favoritos.map(
          (hero: Heroe) => hero.id
        )
      );
    } catch (error) {
      console.log(
        "Error cargando favoritos:",
        error
      );
    }
  };

  // ==========================================
  // FAVORITOS
  // ==========================================

  const toggleFavorito = async (
    heroe: Heroe
  ) => {
    try {
      const esFavorito =
        favoriteIds.includes(heroe.id);

      if (esFavorito) {
        await removeFavorite(heroe.id);

        setFavoriteIds((prev) =>
          prev.filter(
            (id) => id !== heroe.id
          )
        );
      } else {
        await addFavorite(heroe);

        setFavoriteIds((prev) => [
          ...prev,
          heroe.id,
        ]);
      }
    } catch (error) {
      console.error(
        "Error cambiando favorito:",
        error
      );
    }
  };

  // ==========================================
  // CREAR HÉROE
  // ==========================================

  const abrirFormularioCrear = () => {
    if (!isAdmin) {
      Alert.alert(
        "Acceso denegado",
        "Solo los administradores pueden crear superhéroes."
      );

      return;
    }

    setHeroeEdicion(null);
    setFormModalVisible(true);
  };

  // ==========================================
  // EDITAR HÉROE
  // ==========================================

  const abrirFormularioEditar = (
    heroe: Heroe
  ) => {
    if (!isAdmin) {
      Alert.alert(
        "Acceso denegado",
        "Solo los administradores pueden editar superhéroes."
      );

      return;
    }

    setHeroeEdicion(heroe);
    setFormModalVisible(true);
    setHeroeSeleccionado(null);
  };

  // ==========================================
  // ELIMINAR HÉROE
  // ==========================================

  const eliminarHeroe = async (
    heroeId: number,
    nombreHeroe: string
  ) => {
    if (!isAdmin) {
      Alert.alert(
        "Acceso denegado",
        "Solo los administradores pueden eliminar superhéroes."
      );

      return;
    }

    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de que deseas eliminar a ${nombreHeroe}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",

          onPress: async () => {
            try {
              await api.delete(
                `/heroes/${heroeId}`
              );

              Alert.alert(
                "Éxito",
                "Superhéroe eliminado correctamente."
              );

              await cargarHeroes();

              setHeroeSeleccionado(null);
            } catch (error: any) {
              console.error(error);

              Alert.alert(
                "Error",
                error.response?.data?.message ||
                  "Error al eliminar el superhéroe."
              );
            }
          },
        },
      ]
    );
  };

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================

  useEffect(() => {
    cargarUsuario();
    cargarHeroes();
  }, []);

  // ==========================================
  // FAVORITOS AL VOLVER
  // ==========================================

  useFocusEffect(
    useCallback(() => {
      cargarFavoritos();
    }, [])
  );

  // ==========================================
  // RENDER HÉROE
  // ==========================================

  const renderHeroe = ({
    item,
  }: {
    item: Heroe;
  }) => {
    const esFavorito =
      favoriteIds.includes(item.id);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
        onPress={() =>
          setHeroeSeleccionado(item)
        }
      >
        {/* ================= IMAGEN ================= */}

        <View style={styles.imageContainer}>
          {item.imagen_url ? (
            <Image
              source={{
                uri: item.imagen_url,
              }}
              style={styles.image}
            />
          ) : (
            <View
              style={styles.imagePlaceholder}
            >
              <Feather
                name="shield"
                size={42}
                color={colors.red}
              />

              <Text
                style={
                  styles.placeholderText
                }
              >
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
            <Feather
              name={
                esFavorito
                  ? "star"
                  : "star"
              }
              size={22}
              color={
                esFavorito
                  ? colors.gold
                  : "#fff"
              }
            />
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
            <Text
              style={styles.powerBadgeNumber}
            >
              {item.nivel_poder}
            </Text>

            <Text
              style={styles.powerBadgeText}
            >
              PODER
            </Text>
          </View>
        </View>

        {/* ================= INFORMACIÓN ================= */}

        <View style={styles.info}>
          <Text
            style={styles.name}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.nombre}
          </Text>

          <Text
            style={styles.realName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.nombre_real}
          </Text>

          <View style={styles.divider} />

          <Text style={styles.powerLabel}>
            PODER PRINCIPAL
          </Text>

          <Text
            style={styles.power}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.poder_principal}
          </Text>

          <View style={styles.powerHeader}>
            <Text style={styles.powerTitle}>
              NIVEL DE PODER
            </Text>

            <Text style={styles.powerValue}>
              {item.nivel_poder}/100
            </Text>
          </View>

          <View
            style={styles.progressBackground}
          >
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

            <View
              style={styles.detailsActionBox}
            >
              <Text
                style={styles.detailsAction}
              >
                VER DETALLES
              </Text>

              <Feather
                name="arrow-right"
                size={13}
                color={colors.red}
              />
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (
    loading &&
    heroes.length === 0
  ) {
    return (
      <SafeAreaView
        style={styles.center}
        edges={["top"]}
      >
        <View style={styles.loadingLogo}>
          <Text
            style={styles.loadingLogoText}
          >
            M
          </Text>
        </View>

        <ActivityIndicator
          size="large"
          color={colors.red}
        />

        <Text style={styles.loadingTitle}>
          Cargando superhéroes
        </Text>

        <Text style={styles.loadingText}>
          Conectando con Marvel API...
        </Text>
      </SafeAreaView>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (
    error &&
    heroes.length === 0
  ) {
    return (
      <SafeAreaView
        style={styles.center}
        edges={["top"]}
      >
        <View style={styles.errorIcon}>
          <Feather
            name="alert-triangle"
            size={26}
            color={colors.red}
          />
        </View>

        <Text style={styles.errorTitle}>
          Algo salió mal
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={() =>
            cargarHeroes(false)
          }
        >
          <Text style={styles.retryText}>
            REINTENTAR
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // ==========================================
  // PANTALLA PRINCIPAL
  // ==========================================

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
    >
      <FlatList
        data={heroes}
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={renderHeroe}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              cargarHeroes(true)
            }
            tintColor={colors.red}
            colors={[colors.red]}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            {/* CABECERA */}

            <View style={styles.headerTop}>
              <View
                style={styles.headerTitleArea}
              >
                <Text
                  style={styles.headerSmall}
                >
                  MARVEL MANAGER
                </Text>

                <Text
                  style={styles.headerTitle}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.75}
                >
                  SUPERHÉROES
                </Text>

                <Text
                  style={
                    styles.headerSubtitle
                  }
                  numberOfLines={1}
                >
                  {heroes.length}{" "}
                  {heroes.length === 1
                    ? "héroe"
                    : "héroes"}{" "}
                  registrados
                </Text>
              </View>

              <View
                style={styles.headerBadge}
              >
                <Feather
                  name="shield"
                  size={18}
                  color="#fff"
                />

                <Text
                  style={
                    styles.headerBadgeNumber
                  }
                >
                  {heroes.length}
                </Text>

                <Text
                  style={
                    styles.headerBadgeText
                  }
                >
                  HÉROES
                </Text>
              </View>
            </View>

            {/* INFORMACIÓN DE ROL */}

            <View style={styles.roleRow}>
              <View
                style={styles.roleIcon}
              >
                <Feather
                  name={
                    isAdmin
                      ? "shield"
                      : "eye"
                  }
                  size={13}
                  color={colors.red}
                />
              </View>

              <Text
                style={styles.roleText}
              >
                {isAdmin
                  ? "ADMINISTRADOR"
                  : "MODO CONSULTA"}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View
              style={styles.emptyIcon}
            >
              <Feather
                name="users"
                size={25}
                color={colors.red}
              />
            </View>

            <Text
              style={styles.emptyTitle}
            >
              No hay superhéroes
            </Text>

            <Text
              style={styles.emptyText}
            >
              La API todavía no contiene
              héroes registrados.
            </Text>
          </View>
        }
      />

      {/* ========================================
          MODAL DE DETALLES
      ======================================== */}

      <Modal
        visible={
          heroeSeleccionado !== null
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setHeroeSeleccionado(null)
        }
      >
        <View
          style={styles.modalOverlay}
        >
          <Pressable
            style={styles.modalBackground}
            onPress={() =>
              setHeroeSeleccionado(null)
            }
          />

          {heroeSeleccionado && (
            <View
              style={styles.detailCard}
            >
              {/* CERRAR */}

              <Pressable
                style={styles.closeButton}
                onPress={() =>
                  setHeroeSeleccionado(
                    null
                  )
                }
              >
                <Feather
                  name="x"
                  size={20}
                  color="#fff"
                />
              </Pressable>

              {/* IMAGEN */}

              <View
                style={
                  styles.detailImageContainer
                }
              >
                {heroeSeleccionado.imagen_url ? (
                  <Image
                    source={{
                      uri: heroeSeleccionado.imagen_url,
                    }}
                    style={
                      styles.detailImage
                    }
                  />
                ) : (
                  <View
                    style={
                      styles.detailImagePlaceholder
                    }
                  >
                    <Feather
                      name="shield"
                      size={50}
                      color={colors.red}
                    />

                    <Text
                      style={
                        styles.placeholderText
                      }
                    >
                      MARVEL
                    </Text>
                  </View>
                )}

                <View
                  style={
                    styles.detailImageOverlay
                  }
                />

                <View
                  style={
                    styles.detailHeroName
                  }
                >
                  <Text
                    style={
                      styles.detailName
                    }
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                  >
                    {
                      heroeSeleccionado.nombre
                    }
                  </Text>

                  <Text
                    style={
                      styles.detailRealName
                    }
                    numberOfLines={1}
                  >
                    {
                      heroeSeleccionado.nombre_real
                    }
                  </Text>
                </View>
              </View>

              {/* CONTENIDO */}

              <View
                style={styles.detailContent}
              >
                <Text
                  style={
                    styles.detailSectionTitle
                  }
                >
                  INFORMACIÓN DEL HÉROE
                </Text>

                {/* FAVORITO */}

                <Pressable
                  style={
                    styles.modalFavoriteButton
                  }
                  onPress={() =>
                    toggleFavorito(
                      heroeSeleccionado
                    )
                  }
                >
                  <Feather
                    name="star"
                    size={19}
                    color={
                      favoriteIds.includes(
                        heroeSeleccionado.id
                      )
                        ? colors.gold
                        : "#fff"
                    }
                  />

                  <Text
                    style={
                      styles.modalFavoriteText
                    }
                  >
                    {favoriteIds.includes(
                      heroeSeleccionado.id
                    )
                      ? "EN FAVORITOS"
                      : "AGREGAR A FAVORITOS"}
                  </Text>
                </Pressable>

                {/* PODER */}

                <View
                  style={styles.detailItem}
                >
                  <Text
                    style={
                      styles.detailLabel
                    }
                  >
                    PODER PRINCIPAL
                  </Text>

                  <Text
                    style={
                      styles.detailValue
                    }
                    numberOfLines={3}
                  >
                    {
                      heroeSeleccionado.poder_principal
                    }
                  </Text>
                </View>

                {/* NIVEL */}

                <View
                  style={styles.detailItem}
                >
                  <View
                    style={
                      styles.detailPowerHeader
                    }
                  >
                    <Text
                      style={
                        styles.detailLabel
                      }
                    >
                      NIVEL DE PODER
                    </Text>

                    <Text
                      style={
                        styles.detailPowerValue
                      }
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

                <View
                  style={styles.detailRow}
                >
                  <View
                    style={
                      styles.detailStatusInfo
                    }
                  >
                    <Text
                      style={
                        styles.detailLabel
                      }
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
                      {
                        heroeSeleccionado.estado
                      }
                    </Text>
                  </View>
                </View>

                {/* ID */}

                <View
                  style={
                    styles.detailIdContainer
                  }
                >
                  <Text
                    style={
                      styles.detailIdLabel
                    }
                  >
                    IDENTIFICADOR
                  </Text>

                  <Text
                    style={styles.detailId}
                  >
                    #{heroeSeleccionado.id}
                  </Text>
                </View>

                {/* CERRAR */}

                <Pressable
                  style={
                    styles.closeMainButton
                  }
                  onPress={() =>
                    setHeroeSeleccionado(
                      null
                    )
                  }
                >
                  <Text
                    style={
                      styles.closeMainButtonText
                    }
                  >
                    CERRAR
                  </Text>
                </Pressable>

                {/* ACCIONES ADMIN */}

                {isAdmin && (
                  <View
                    style={
                      styles.actionButtons
                    }
                  >
                    <Pressable
                      style={
                        styles.editButton
                      }
                      onPress={() =>
                        abrirFormularioEditar(
                          heroeSeleccionado
                        )
                      }
                    >
                      <Feather
                        name="edit-2"
                        size={15}
                        color="#fff"
                      />

                      <Text
                        style={
                          styles.editButtonText
                        }
                      >
                        EDITAR
                      </Text>
                    </Pressable>

                    <Pressable
                      style={
                        styles.deleteButton
                      }
                      onPress={() =>
                        eliminarHeroe(
                          heroeSeleccionado.id,
                          heroeSeleccionado.nombre
                        )
                      }
                    >
                      <Feather
                        name="trash-2"
                        size={15}
                        color="#fff"
                      />

                      <Text
                        style={
                          styles.deleteButtonText
                        }
                      >
                        ELIMINAR
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* ========================================
          FORMULARIO CREAR / EDITAR
      ======================================== */}

      {isAdmin && (
        <HeroFormModal
          visible={formModalVisible}
          onClose={() =>
            setFormModalVisible(false)
          }
          onSuccess={() => {
            cargarHeroes();
            cargarFavoritos();
          }}
          heroe={heroeEdicion}
        />
      )}

      {/* ========================================
          BOTÓN CREAR
      ======================================== */}

      {isAdmin && (
        <Pressable
          style={({ pressed }) => [
            styles.createButton,
            pressed &&
              styles.createButtonPressed,
          ]}
          onPress={abrirFormularioCrear}
        >
          <Feather
            name="plus"
            size={25}
            color="#fff"
          />
        </Pressable>
      )}
    </SafeAreaView>
  );
}

// =====================================================
// ESTILOS
// =====================================================

const styles = StyleSheet.create({
  // ===================================================
  // GENERAL
  // ===================================================

  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  center: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  list: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },

  // ===================================================
  // HEADER
  // ===================================================

  header: {
    marginBottom: 20,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitleArea: {
    flex: 1,
    minWidth: 0,
    paddingRight: 14,
  },

  headerSmall: {
    color: colors.red,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 6,
  },

  headerTitle: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  headerSubtitle: {
    color: colors.textMuted,
    fontSize: 12.5,
    marginTop: 6,
  },

  headerBadge: {
    width: 68,
    height: 68,
    borderRadius: radii.md,
    backgroundColor: colors.red,
    borderWidth: 1.5,
    borderColor: colors.ink,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },

  headerBadgeNumber: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "900",
    marginTop: 1,
  },

  headerBadgeText: {
    color: "#fff",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1,
  },

  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radii.sm,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.panelBorder,
  },

  roleIcon: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: colors.redSoft,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  roleText: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  // ===================================================
  // CARD
  // ===================================================

  card: {
    backgroundColor: colors.panel,
    borderRadius: radii.lg,
    marginBottom: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.panelBorder,

    shadowColor: colors.ink,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,

    elevation: 4,
  },

  cardPressed: {
    opacity: 0.92,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  // ===================================================
  // IMAGEN
  // ===================================================

  imageContainer: {
    width: "100%",
    height: 235,
    backgroundColor: colors.ink,
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
    backgroundColor: colors.ink,
  },

  placeholderText: {
    color: colors.red,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 3,
    marginTop: 8,
  },

  // ===================================================
  // FAVORITO
  // ===================================================

  favoriteButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.78)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  // ===================================================
  // ESTADO
  // ===================================================

  statusBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  activeBadge: {
    backgroundColor: "rgba(20,70,30,0.94)",
  },

  inactiveBadge: {
    backgroundColor: "rgba(90,25,25,0.94)",
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  activeDot: {
    backgroundColor: colors.green,
  },

  inactiveDot: {
    backgroundColor: colors.red,
  },

  statusText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  activeText: {
    color: "#7ee787",
  },

  inactiveText: {
    color: "#ff8585",
  },

  // ===================================================
  // POWER BADGE
  // ===================================================

  powerBadge: {
    position: "absolute",
    right: 14,
    bottom: 14,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(0,0,0,0.86)",
    borderWidth: 2,
    borderColor: colors.red,
    justifyContent: "center",
    alignItems: "center",
  },

  powerBadgeNumber: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },

  powerBadgeText: {
    color: colors.red,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1,
  },

  // ===================================================
  // INFO
  // ===================================================

  info: {
    padding: 18,
  },

  name: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "900",
  },

  realName: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: colors.panelBorder,
    marginVertical: 14,
  },

  powerLabel: {
    color: colors.red,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  power: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },

  // ===================================================
  // POWER
  // ===================================================

  powerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 17,
    marginBottom: 7,
  },

  powerTitle: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  powerValue: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "900",
  },

  progressBackground: {
    width: "100%",
    height: 7,
    backgroundColor: colors.panelBorder,
    borderRadius: 10,
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    backgroundColor: colors.red,
    borderRadius: 10,
  },

  // ===================================================
  // DETAILS
  // ===================================================

  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },

  detailsText: {
    color: colors.textFaint,
    fontSize: 10,
    fontWeight: "800",
  },

  detailsActionBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  detailsAction: {
    color: colors.red,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  // ===================================================
  // LOADING
  // ===================================================

  loadingLogo: {
    width: 68,
    height: 68,
    borderRadius: radii.md,
    backgroundColor: colors.red,
    borderWidth: 1.5,
    borderColor: colors.ink,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  loadingLogoText: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "900",
  },

  loadingTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 15,
  },

  loadingText: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 6,
  },

  // ===================================================
  // ERROR
  // ===================================================

  errorIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.redSoft,
    borderWidth: 1.5,
    borderColor: colors.red,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  errorTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 8,
  },

  errorText: {
    color: colors.textMuted,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    maxWidth: 320,
  },

  retryButton: {
    backgroundColor: colors.red,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: radii.sm,
    marginTop: 22,
  },

  retryText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },

  // ===================================================
  // EMPTY
  // ===================================================

  empty: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.redSoft,
    borderWidth: 1,
    borderColor: colors.red,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 18,
  },

  emptyText: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 7,
    lineHeight: 20,
    fontSize: 13,
  },

  // ===================================================
  // MODAL
  // ===================================================

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
    backgroundColor: "rgba(0,0,0,0.88)",
  },

  detailCard: {
    width: "100%",
    maxWidth: 430,
    maxHeight: "92%",
    backgroundColor: colors.panel,
    borderRadius: radii.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.panelBorder,

    shadowColor: colors.ink,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.45,
    shadowRadius: 15,

    elevation: 12,
  },

  closeButton: {
    position: "absolute",
    right: 14,
    top: 14,
    zIndex: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  // ===================================================
  // DETAIL IMAGE
  // ===================================================

  detailImageContainer: {
    width: "100%",
    height: 265,
    position: "relative",
    backgroundColor: colors.ink,
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
    backgroundColor: colors.ink,
  },

  detailImageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 140,
    backgroundColor: "rgba(0,0,0,0.58)",
  },

  detailHeroName: {
    position: "absolute",
    left: 20,
    bottom: 18,
    right: 60,
  },

  detailName: {
    color: "#fff",
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
  },

  detailRealName: {
    color: "#bbb",
    fontSize: 13,
    marginTop: 4,
  },

  // ===================================================
  // DETAIL CONTENT
  // ===================================================

  detailContent: {
    padding: 20,
  },

  detailSectionTitle: {
    color: colors.red,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 16,
  },

  modalFavoriteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ink,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: radii.sm,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
  },

  modalFavoriteText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginLeft: 10,
  },

  detailItem: {
    marginBottom: 18,
  },

  detailLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 6,
  },

  detailValue: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
  },

  detailPowerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  detailPowerValue: {
    color: colors.red,
    fontSize: 15,
    fontWeight: "900",
  },

  detailProgressBackground: {
    width: "100%",
    height: 8,
    backgroundColor: colors.panelBorder,
    borderRadius: 10,
    overflow: "hidden",
  },

  detailProgressBar: {
    height: "100%",
    backgroundColor: colors.red,
    borderRadius: 10,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },

  detailStatusInfo: {
    flex: 1,
    minWidth: 0,
  },

  detailSmallText: {
    color: colors.textFaint,
    fontSize: 10,
    marginTop: 2,
  },

  detailStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    marginLeft: 12,
  },

  detailActive: {
    backgroundColor: colors.greenSoft,
  },

  detailInactive: {
    backgroundColor: colors.redSoft,
  },

  detailStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 7,
  },

  detailActiveDot: {
    backgroundColor: colors.green,
  },

  detailInactiveDot: {
    backgroundColor: colors.red,
  },

  detailStatusText: {
    fontSize: 9,
    fontWeight: "900",
  },

  detailActiveText: {
    color: colors.green,
  },

  detailInactiveText: {
    color: colors.red,
  },

  detailIdContainer: {
    marginTop: 18,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.panelBorder,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  detailIdLabel: {
    color: colors.textFaint,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  detailId: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },

  // ===================================================
  // MODAL BUTTONS
  // ===================================================

  closeMainButton: {
    backgroundColor: colors.red,
    borderRadius: radii.sm,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 20,
  },

  closeMainButtonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },

  editButton: {
    flex: 1,
    backgroundColor: colors.blue,
    borderRadius: radii.sm,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  editButtonText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  deleteButton: {
    flex: 1,
    backgroundColor: colors.red,
    borderRadius: radii.sm,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  deleteButtonText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  // ===================================================
  // CREATE BUTTON
  // ===================================================

  createButton: {
    position: "absolute",
    right: 20,
    bottom: 25,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.red,
    borderWidth: 1.5,
    borderColor: colors.ink,
    justifyContent: "center",
    alignItems: "center",

    shadowColor: colors.ink,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,

    elevation: 8,
  },

  createButtonPressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.94,
      },
    ],
  },
});