import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Pressable,
  RefreshControl,
  Alert,
  Modal,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";

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
  // =====================================================
  // ESTADOS
  // =====================================================

  const [favoritos, setFavoritos] = useState<Heroe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [heroeSeleccionado, setHeroeSeleccionado] =
    useState<Heroe | null>(null);

  // =====================================================
  // CARGAR FAVORITOS
  // =====================================================

  const cargarFavoritos = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getFavorites();

      setFavoritos(data || []);
    } catch (error) {
      console.log("Error cargando favoritos:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // ACTUALIZAR AL VOLVER A LA PANTALLA
  // =====================================================

  useFocusEffect(
    useCallback(() => {
      cargarFavoritos();
    }, [])
  );

  // =====================================================
  // ELIMINAR FAVORITO
  // =====================================================

  const eliminarFavorito = async (
    id: number,
    nombre: string
  ) => {
    Alert.alert(
      "Quitar de favoritos",
      `¿Quieres quitar a ${nombre} de tus favoritos?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Quitar",
          style: "destructive",
          onPress: async () => {
            try {
              await removeFavorite(id);

              setFavoritos((prev) =>
                prev.filter((hero) => hero.id !== id)
              );

              setHeroeSeleccionado(null);
            } catch (error) {
              console.error(
                "Error eliminando favorito:",
                error
              );

              Alert.alert(
                "Error",
                "No se pudo quitar el héroe de favoritos."
              );
            }
          },
        },
      ]
    );
  };

  // =====================================================
  // RENDER FAVORITO
  // =====================================================

  const renderFavorito = ({
    item,
  }: {
    item: Heroe;
  }) => {
    const porcentaje = Math.min(
      Math.max(item.nivel_poder, 0),
      100
    );

    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
        onPress={() => setHeroeSeleccionado(item)}
      >
        {/* =================================================
            IMAGEN
        ================================================= */}

        <View style={styles.imageContainer}>
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

          {/* OVERLAY */}

          <View style={styles.imageOverlay} />

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

          {/* FAVORITO */}

          <Pressable
            style={styles.favoriteButton}
            onPress={(event) => {
              event.stopPropagation();

              eliminarFavorito(
                item.id,
                item.nombre
              );
            }}
          >
            <Feather
              name="star"
              size={19}
              color="#FFD700"
              fill="#FFD700"
            />
          </Pressable>
        </View>

        {/* =================================================
            INFORMACIÓN
        ================================================= */}

        <View style={styles.info}>
          <Text
            style={styles.name}
            numberOfLines={1}
          >
            {item.nombre}
          </Text>

          <Text
            style={styles.realName}
            numberOfLines={1}
          >
            {item.nombre_real}
          </Text>

          <View style={styles.divider} />

          {/* PODER PRINCIPAL */}

          <Text style={styles.powerLabel}>
            PODER PRINCIPAL
          </Text>

          <Text
            style={styles.power}
            numberOfLines={2}
          >
            {item.poder_principal}
          </Text>

          {/* NIVEL */}

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
                  width: `${porcentaje}%`,
                },
              ]}
            />
          </View>

          {/* FOOTER */}

          <View style={styles.bottomRow}>
            <Text style={styles.idText}>
              ID #{item.id}
            </Text>

            <Text style={styles.detailsText}>
              VER DETALLES ›
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading && favoritos.length === 0) {
    return (
      <View style={styles.center}>
        <View style={styles.loadingLogo}>
          <Feather
            name="star"
            size={34}
            color="#FFD700"
            fill="#FFD700"
          />
        </View>

        <Text style={styles.loadingTitle}>
          Cargando favoritos
        </Text>

        <Text style={styles.loadingText}>
          Preparando tu colección de héroes...
        </Text>
      </View>
    );
  }

  // =====================================================
  // PANTALLA PRINCIPAL
  // =====================================================

  return (
    <View style={styles.container}>
      {/* =================================================
          HEADER
      ================================================= */}

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
                <Text
                  style={styles.headerSmall}
                >
                  MARVEL MANAGER
                </Text>

            <Text style={styles.headerTitle}>
              FAVORITOS
            </Text>

            <Text style={styles.headerSubtitle}>
              Tu colección personal de héroes
            </Text>
          </View>

          {/* CONTADOR */}

          <View style={styles.headerBadge}>
            <Feather
              name="star"
              size={16}
              color="#FFD700"
              fill="#FFD700"
            />

            <Text style={styles.headerBadgeNumber}>
              {favoritos.length}
            </Text>

            <Text style={styles.headerBadgeText}>
              GUARDADOS
            </Text>
          </View>
        </View>

        {/* LINEA DECORATIVA */}

        <View style={styles.headerLine}>
          <View style={styles.headerLineActive} />
        </View>
      </View>

      {/* =================================================
          LISTA
      ================================================= */}

      {favoritos.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconContainer}>
            <Feather
              name="star"
              size={42}
              color="#e62429"
            />
          </View>

          <Text style={styles.emptyTitle}>
            Tu colección está vacía
          </Text>

          <Text style={styles.emptyText}>
            Todavía no tienes superhéroes guardados
            en favoritos.
          </Text>

          <Text style={styles.emptyHint}>
            Ve a la sección de superhéroes y pulsa
            la estrella para agregar tus favoritos.
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
              refreshing={refreshing}
              onRefresh={() =>
                cargarFavoritos(true)
              }
              tintColor="#e62429"
              colors={["#e62429"]}
            />
          }
        />
      )}

      {/* =================================================
          MODAL DETALLES
      ================================================= */}

      <Modal
        visible={heroeSeleccionado !== null}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setHeroeSeleccionado(null)
        }
      >
        <View style={styles.modalOverlay}>
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
                <Feather
                  name="x"
                  size={22}
                  color="#fff"
                />
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
                      style={styles.detailPlaceholderText}
                    >
                      M
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
                    {
                      heroeSeleccionado.nombre_real
                    }
                  </Text>
                </View>
              </View>

              {/* CONTENIDO */}

              <View style={styles.detailContent}>
                <View
                  style={styles.detailHeaderRow}
                >
                  <Text
                    style={
                      styles.detailSectionTitle
                    }
                  >
                    HÉROE FAVORITO
                  </Text>

                  <Feather
                    name="star"
                    size={19}
                    color="#FFD700"
                    fill="#FFD700"
                  />
                </View>

                {/* PODER */}

                <View style={styles.detailItem}>
                  <Text
                    style={styles.detailLabel}
                  >
                    PODER PRINCIPAL
                  </Text>

                  <Text
                    style={styles.detailValue}
                  >
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

                <View style={styles.detailStatusRow}>
                  <View>
                    <Text
                      style={styles.detailLabel}
                    >
                      ESTADO
                    </Text>

                    <Text
                      style={styles.detailSmallText}
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

                {/* QUITAR */}

                <Pressable
                  style={styles.removeFavoriteButton}
                  onPress={() =>
                    eliminarFavorito(
                      heroeSeleccionado.id,
                      heroeSeleccionado.nombre
                    )
                  }
                >
                  <Feather
                    name="star"
                    size={17}
                    color="#FFD700"
                    fill="#FFD700"
                  />

                  <Text
                    style={
                      styles.removeFavoriteText
                    }
                  >
                    QUITAR DE FAVORITOS
                  </Text>
                </Pressable>

                {/* CERRAR */}

                <Pressable
                  style={styles.closeMainButton}
                  onPress={() =>
                    setHeroeSeleccionado(null)
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
              </View>
            </View>
          )}
        </View>
      </Modal>
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

  // =====================================================
  // HEADER
  // =====================================================

  header: {
    paddingTop: 58,
    paddingHorizontal: 20,
    paddingBottom: 18,
    backgroundColor: "#0d0d0d",
    borderBottomWidth: 1,
    borderBottomColor: "#242424",
  },

  headerContent: {
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
    color: "#fff",
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
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#171717",
    borderWidth: 2,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },

  headerBadgeNumber: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 1,
  },

  headerBadgeText: {
    color: "#777",
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 0.7,
    marginTop: 1,
  },

  headerLine: {
    height: 3,
    backgroundColor: "#242424",
    marginTop: 17,
    borderRadius: 5,
    overflow: "hidden",
  },

  headerLineActive: {
    width: "32%",
    height: "100%",
    backgroundColor: "#e62429",
  },

  // =====================================================
  // LISTA
  // =====================================================

  list: {
    padding: 16,
    paddingBottom: 35,
  },

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
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },

  // =====================================================
  // IMAGEN
  // =====================================================

  imageContainer: {
    width: "100%",
    height: 210,
    backgroundColor: "#222",
    position: "relative",
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#202020",
  },

  placeholderText: {
    color: "#e62429",
    fontSize: 55,
    fontWeight: "900",
    letterSpacing: 3,
  },

  imageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
    backgroundColor: "rgba(0,0,0,0.38)",
  },

  // =====================================================
  // FAVORITO
  // =====================================================

  favoriteButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.78)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#444",
  },

  // =====================================================
  // ESTADO
  // =====================================================

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
    backgroundColor: "rgba(15,70,25,0.95)",
  },

  inactiveBadge: {
    backgroundColor: "rgba(80,20,20,0.95)",
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

  // =====================================================
  // INFO
  // =====================================================

  info: {
    padding: 17,
  },

  name: {
    color: "#fff",
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
    color: "#ddd",
    fontSize: 15,
    marginTop: 6,
    lineHeight: 21,
  },

  // =====================================================
  // PODER
  // =====================================================

  powerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 17,
    marginBottom: 7,
  },

  powerTitle: {
    color: "#999",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  powerValue: {
    color: "#fff",
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

  // =====================================================
  // FOOTER CARD
  // =====================================================

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },

  idText: {
    color: "#555",
    fontSize: 11,
    fontWeight: "700",
  },

  detailsText: {
    color: "#e62429",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  // =====================================================
  // LOADING
  // =====================================================

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
    borderRadius: 35,
    backgroundColor: "#151515",
    borderWidth: 2,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  loadingTitle: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "900",
  },

  loadingText: {
    color: "#777",
    fontSize: 13,
    marginTop: 7,
    textAlign: "center",
  },

  // =====================================================
  // EMPTY
  // =====================================================

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 35,
  },

  emptyIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
  },

  emptyTitle: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "900",
    textAlign: "center",
  },

  emptyText: {
    color: "#aaa",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 9,
  },

  emptyHint: {
    color: "#666",
    textAlign: "center",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 12,
  },

  // =====================================================
  // MODAL
  // =====================================================

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
    backgroundColor: "rgba(0,0,0,0.78)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#555",
  },

  // =====================================================
  // MODAL IMAGEN
  // =====================================================

  detailImageContainer: {
    width: "100%",
    height: 275,
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

  detailPlaceholderText: {
    color: "#e62429",
    fontSize: 65,
    fontWeight: "900",
  },

  detailImageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 135,
    backgroundColor: "rgba(0,0,0,0.58)",
  },

  detailHeroName: {
    position: "absolute",
    left: 20,
    right: 60,
    bottom: 18,
  },

  detailName: {
    color: "#fff",
    fontSize: 29,
    fontWeight: "900",
  },

  detailRealName: {
    color: "#bbb",
    fontSize: 14,
    marginTop: 3,
  },

  // =====================================================
  // MODAL CONTENIDO
  // =====================================================

  detailContent: {
    padding: 20,
  },

  detailHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  detailSectionTitle: {
    color: "#e62429",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  detailItem: {
    marginBottom: 19,
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

  // =====================================================
  // ESTADO MODAL
  // =====================================================

  detailStatusRow: {
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

  // =====================================================
  // ID
  // =====================================================

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

  // =====================================================
  // BOTONES MODAL
  // =====================================================

  removeFavoriteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#252525",
    borderWidth: 1,
    borderColor: "#3a3a3a",
    borderRadius: 10,
    paddingVertical: 13,
    marginTop: 20,
    gap: 8,
  },

  removeFavoriteText: {
    color: "#FFD700",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  closeMainButton: {
    backgroundColor: "#e62429",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },

  closeMainButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
});