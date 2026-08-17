import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Alert,
  Modal,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import api from "@/services/api";
import MisionFormModal from "@/components/MisionFormModal";

interface Mision {
  id: number;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  fecha: string;
  nivel_peligro: "BAJO" | "MEDIO" | "ALTO";
  estado: "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA";
  superheroe_id: number;
}

export default function MisionesScreen() {
  // =====================================================
  // ESTADOS
  // =====================================================

  const [misiones, setMisiones] = useState<Mision[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [userRole, setUserRole] = useState("");

  const [misionSeleccionada, setMisionSeleccionada] =
    useState<Mision | null>(null);

  const [formModalVisible, setFormModalVisible] = useState(false);

  const [misionEdicion, setMisionEdicion] =
    useState<Mision | null>(null);

  const esAdmin = userRole === "ADMIN";

  // =====================================================
  // CARGAR USUARIO
  // =====================================================

  const cargarUsuario = async () => {
    try {
      const raw = await AsyncStorage.getItem("user");

      if (raw) {
        const user = JSON.parse(raw);

        setUserRole(
          String(user?.rol ?? "")
            .trim()
            .toUpperCase()
        );
      }
    } catch (error) {
      console.error("Error cargando usuario:", error);
    }
  };

  // =====================================================
  // CARGAR MISIONES
  // =====================================================

  const cargarMisiones = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/misiones");

      setMisiones(response.data.data || []);
    } catch (error: any) {
      console.error("Error cargando misiones:", error);

      setError(
        error.response?.data?.message ||
          "No se pudieron cargar las misiones."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // CREAR MISIÓN
  // =====================================================

  const abrirFormularioCrear = () => {
    if (!esAdmin) {
      Alert.alert(
        "Acceso denegado",
        "Solo los administradores pueden crear misiones."
      );

      return;
    }

    setMisionEdicion(null);
    setFormModalVisible(true);
  };

  // =====================================================
  // EDITAR MISIÓN
  // =====================================================

  const abrirFormularioEditar = (mision: Mision) => {
    if (!esAdmin) {
      Alert.alert(
        "Acceso denegado",
        "Solo los administradores pueden editar misiones."
      );

      return;
    }

    setMisionEdicion(mision);
    setFormModalVisible(true);
    setMisionSeleccionada(null);
  };

  // =====================================================
  // ELIMINAR MISIÓN
  // =====================================================

  const eliminarMision = async (
    misionId: number,
    tituloMision: string
  ) => {
    if (!esAdmin) {
      Alert.alert(
        "Acceso denegado",
        "Solo los administradores pueden eliminar misiones."
      );

      return;
    }

    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de que deseas eliminar la misión "${tituloMision}"?`,
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
              await api.delete(`/misiones/${misionId}`);

              Alert.alert(
                "Misión eliminada",
                "La misión se eliminó correctamente."
              );

              await cargarMisiones();

              setMisionSeleccionada(null);
            } catch (error: any) {
              console.error(error);

              Alert.alert(
                "Error",
                error.response?.data?.message ||
                  "Error al eliminar la misión."
              );
            }
          },
        },
      ]
    );
  };

  // =====================================================
  // COLORES
  // =====================================================

  const obtenerColorPeligro = (nivel: string) => {
    switch (nivel) {
      case "ALTO":
        return "#e62429";

      case "MEDIO":
        return "#f5a623";

      case "BAJO":
        return "#4caf50";

      default:
        return "#888";
    }
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case "COMPLETADA":
        return "#4caf50";

      case "EN_PROGRESO":
        return "#f5a623";

      case "PENDIENTE":
        return "#e62429";

      default:
        return "#888";
    }
  };

  const obtenerTextoEstado = (estado: string) => {
    switch (estado) {
      case "EN_PROGRESO":
        return "EN PROGRESO";

      case "COMPLETADA":
        return "COMPLETADA";

      case "PENDIENTE":
        return "PENDIENTE";

      default:
        return estado;
    }
  };

  // =====================================================
  // FORMATEAR FECHA
  // =====================================================

  const formatearFecha = (fecha: string) => {
    const partes = fecha.substring(0, 10).split("-");

    if (partes.length === 3) {
      const [year, month, day] = partes;

      const meses = [
        "ENE",
        "FEB",
        "MAR",
        "ABR",
        "MAY",
        "JUN",
        "JUL",
        "AGO",
        "SEP",
        "OCT",
        "NOV",
        "DIC",
      ];

      return `${day} ${meses[Number(month) - 1]} ${year}`;
    }

    return fecha;
  };

  // =====================================================
  // ESTADÍSTICAS
  // =====================================================

  const misionesPendientes = misiones.filter(
    (mision) => mision.estado === "PENDIENTE"
  ).length;

  const misionesProgreso = misiones.filter(
    (mision) => mision.estado === "EN_PROGRESO"
  ).length;

  const misionesCompletadas = misiones.filter(
    (mision) => mision.estado === "COMPLETADA"
  ).length;

  const misionesAltoPeligro = misiones.filter(
    (mision) => mision.nivel_peligro === "ALTO"
  ).length;

  // =====================================================
  // INICIALIZACIÓN
  // =====================================================

  useEffect(() => {
    cargarUsuario();
    cargarMisiones();
  }, []);

  // =====================================================
  // RENDER MISIÓN
  // =====================================================

  const renderMision = ({
    item,
  }: {
    item: Mision;
  }) => {
    const colorPeligro = obtenerColorPeligro(
      item.nivel_peligro
    );

    const colorEstado = obtenerColorEstado(
      item.estado
    );

    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
        onPress={() => setMisionSeleccionada(item)}
      >
        {/* BARRA SUPERIOR */}
        <View
          style={[
            styles.cardAccent,
            {
              backgroundColor: colorPeligro,
            },
          ]}
        />

        <View style={styles.cardContent}>
          {/* HEADER DE TARJETA */}
          <View style={styles.cardHeader}>
            <View style={styles.missionIcon}>
              <Feather
                name="target"
                size={19}
                color={colorPeligro}
              />
            </View>

            <View style={styles.cardHeaderInfo}>
              <Text style={styles.missionId}>
                MISIÓN #{item.id}
              </Text>

              <Text
                style={styles.missionDate}
              >
                {formatearFecha(item.fecha)}
              </Text>
            </View>

            <View
              style={[
                styles.dangerBadge,
                {
                  backgroundColor: `${colorPeligro}18`,
                  borderColor: `${colorPeligro}55`,
                },
              ]}
            >
              <View
                style={[
                  styles.dangerDot,
                  {
                    backgroundColor: colorPeligro,
                  },
                ]}
              />

              <Text
                style={[
                  styles.dangerText,
                  {
                    color: colorPeligro,
                  },
                ]}
              >
                {item.nivel_peligro}
              </Text>
            </View>
          </View>

          {/* TÍTULO */}
          <Text style={styles.missionTitle}>
            {item.titulo}
          </Text>

          {/* DESCRIPCIÓN */}
          <Text
            style={styles.description}
            numberOfLines={2}
          >
            {item.descripcion}
          </Text>

          {/* ESTADO */}
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: `${colorEstado}15`,
                  borderColor: `${colorEstado}55`,
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: colorEstado,
                  },
                ]}
              />

              <Text
                style={[
                  styles.statusText,
                  {
                    color: colorEstado,
                  },
                ]}
              >
                {obtenerTextoEstado(item.estado)}
              </Text>
            </View>
          </View>

          {/* SEPARADOR */}
          <View style={styles.separator} />

          {/* INFORMACIÓN */}
          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <View style={styles.infoIconContainer}>
                <Feather
                  name="map-pin"
                  size={16}
                  color="#e62429"
                />
              </View>

              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>
                  UBICACIÓN
                </Text>

                <Text
                  style={styles.infoValue}
                  numberOfLines={1}
                >
                  {item.ubicacion}
                </Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <View style={styles.infoIconContainer}>
                <Feather
                  name="calendar"
                  size={16}
                  color="#e62429"
                />
              </View>

              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>
                  FECHA
                </Text>

                <Text style={styles.infoValue}>
                  {formatearFecha(item.fecha)}
                </Text>
              </View>
            </View>
          </View>

          {/* FOOTER */}
          <View style={styles.cardFooter}>
            <View style={styles.heroAssigned}>
              <View style={styles.heroIcon}>
                <Feather
                  name="user"
                  size={14}
                  color="#bbb"
                />
              </View>

              <View>
                <Text style={styles.heroLabel}>
                  HÉROE ASIGNADO
                </Text>

                <Text style={styles.heroValue}>
                  Héroe #{item.superheroe_id}
                </Text>
              </View>
            </View>

            <View style={styles.detailsAction}>
              <Text style={styles.detailsText}>
                DETALLES
              </Text>

              <Feather
                name="arrow-right"
                size={15}
                color="#e62429"
              />
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading && misiones.length === 0) {
    return (
      <View style={styles.center}>
        <View style={styles.loadingLogo}>
          <Feather
            name="target"
            size={32}
            color="#fff"
          />
        </View>

        <ActivityIndicator
          size="large"
          color="#e62429"
        />

        <Text style={styles.loadingTitle}>
          Cargando misiones
        </Text>

        <Text style={styles.loadingText}>
          Conectando con Marvel API...
        </Text>
      </View>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error && misiones.length === 0) {
    return (
      <View style={styles.center}>
        <View style={styles.errorIcon}>
          <Feather
            name="alert-triangle"
            size={28}
            color="#e62429"
          />
        </View>

        <Text style={styles.errorTitle}>
          No se pudieron cargar las misiones
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={() => cargarMisiones(false)}
        >
          <Feather
            name="refresh-cw"
            size={15}
            color="#fff"
          />

          <Text style={styles.retryText}>
            REINTENTAR
          </Text>
        </Pressable>
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
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerSmall}>
              MARVEL MANAGER
            </Text>

            <Text style={styles.headerTitle}>
              MISIONES
            </Text>

            <Text style={styles.headerSubtitle}>
              Centro de operaciones
            </Text>
          </View>

          <View style={styles.headerBadge}>
            <Feather
              name="target"
              size={20}
              color="#fff"
            />

            <Text style={styles.headerBadgeNumber}>
              {misiones.length}
            </Text>

            <Text style={styles.headerBadgeText}>
              TOTAL
            </Text>
          </View>
        </View>

        {/* ESTADÍSTICAS */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor:
                    "rgba(230,36,41,0.12)",
                },
              ]}
            >
              <Feather
                name="clock"
                size={15}
                color="#e62429"
              />
            </View>

            <View>
              <Text style={styles.statNumber}>
                {misionesPendientes}
              </Text>

              <Text style={styles.statLabel}>
                PENDIENTES
              </Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor:
                    "rgba(245,166,35,0.12)",
                },
              ]}
            >
              <Feather
                name="activity"
                size={15}
                color="#f5a623"
              />
            </View>

            <View>
              <Text style={styles.statNumber}>
                {misionesProgreso}
              </Text>

              <Text style={styles.statLabel}>
                EN PROGRESO
              </Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                {
                  backgroundColor:
                    "rgba(76,175,80,0.12)",
                },
              ]}
            >
              <Feather
                name="check-circle"
                size={15}
                color="#4caf50"
              />
            </View>

            <View>
              <Text style={styles.statNumber}>
                {misionesCompletadas}
              </Text>

              <Text style={styles.statLabel}>
                COMPLETADAS
              </Text>
            </View>
          </View>
        </View>

        {/* INFO ADMIN */}
        <View style={styles.headerFooter}>
          <View style={styles.roleContainer}>
            <Feather
              name={esAdmin ? "shield" : "eye"}
              size={13}
              color={esAdmin ? "#e62429" : "#3f7fd1"}
            />

            <Text
              style={[
                styles.roleText,
                {
                  color: esAdmin
                    ? "#e62429"
                    : "#3f7fd1",
                },
              ]}
            >
              {esAdmin
                ? "MODO ADMINISTRADOR"
                : "MODO CONSULTA"}
            </Text>
          </View>

          {misionesAltoPeligro > 0 && (
            <View style={styles.highDangerInfo}>
              <View style={styles.highDangerDot} />

              <Text style={styles.highDangerText}>
                {misionesAltoPeligro} ALTO PELIGRO
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* =================================================
          LISTA
      ================================================= */}

      {misiones.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIconContainer}>
            <Feather
              name="target"
              size={32}
              color="#e62429"
            />
          </View>

          <Text style={styles.emptyTitle}>
            No hay misiones
          </Text>

          <Text style={styles.emptyText}>
            La API todavía no contiene misiones
            registradas.
          </Text>

          {esAdmin && (
            <Pressable
              style={styles.emptyButton}
              onPress={abrirFormularioCrear}
            >
              <Feather
                name="plus"
                size={17}
                color="#fff"
              />

              <Text style={styles.emptyButtonText}>
                CREAR MISIÓN
              </Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={misiones}
          keyExtractor={(item) =>
            item.id.toString()
          }
          renderItem={renderMision}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() =>
                cargarMisiones(true)
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
        visible={misionSeleccionada !== null}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setMisionSeleccionada(null)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={
                styles.modalScrollContent
              }
            >
              {misionSeleccionada && (
                <>
                  {/* MODAL HEADER */}

                  <View style={styles.modalHeader}>
                    <View
                      style={[
                        styles.modalMissionIcon,
                        {
                          backgroundColor:
                            `${obtenerColorPeligro(
                              misionSeleccionada.nivel_peligro
                            )}18`,
                          borderColor:
                            `${obtenerColorPeligro(
                              misionSeleccionada.nivel_peligro
                            )}55`,
                        },
                      ]}
                    >
                      <Feather
                        name="target"
                        size={25}
                        color={obtenerColorPeligro(
                          misionSeleccionada.nivel_peligro
                        )}
                      />
                    </View>

                    <View
                      style={styles.modalHeaderInfo}
                    >
                      <Text
                        style={styles.modalMissionId}
                      >
                        MISIÓN #
                        {misionSeleccionada.id}
                      </Text>

                      <Text
                        style={styles.modalMissionDate}
                      >
                        {formatearFecha(
                          misionSeleccionada.fecha
                        )}
                      </Text>
                    </View>

                    <Pressable
                      style={styles.closeButton}
                      onPress={() =>
                        setMisionSeleccionada(null)
                      }
                    >
                      <Feather
                        name="x"
                        size={20}
                        color="#aaa"
                      />
                    </Pressable>
                  </View>

                  {/* TÍTULO */}

                  <Text style={styles.modalTitle}>
                    {misionSeleccionada.titulo}
                  </Text>

                  {/* BADGES */}

                  <View style={styles.modalBadges}>
                    <View
                      style={[
                        styles.modalDanger,
                        {
                          backgroundColor:
                            `${obtenerColorPeligro(
                              misionSeleccionada.nivel_peligro
                            )}18`,
                          borderColor:
                            `${obtenerColorPeligro(
                              misionSeleccionada.nivel_peligro
                            )}55`,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.modalBadgeDot,
                          {
                            backgroundColor:
                              obtenerColorPeligro(
                                misionSeleccionada.nivel_peligro
                              ),
                          },
                        ]}
                      />

                      <Text
                        style={[
                          styles.modalBadgeText,
                          {
                            color:
                              obtenerColorPeligro(
                                misionSeleccionada.nivel_peligro
                              ),
                          },
                        ]}
                      >
                        PELIGRO{" "}
                        {
                          misionSeleccionada.nivel_peligro
                        }
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.modalStatus,
                        {
                          backgroundColor:
                            `${obtenerColorEstado(
                              misionSeleccionada.estado
                            )}18`,
                          borderColor:
                            `${obtenerColorEstado(
                              misionSeleccionada.estado
                            )}55`,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.modalBadgeDot,
                          {
                            backgroundColor:
                              obtenerColorEstado(
                                misionSeleccionada.estado
                              ),
                          },
                        ]}
                      />

                      <Text
                        style={[
                          styles.modalStatusText,
                          {
                            color:
                              obtenerColorEstado(
                                misionSeleccionada.estado
                              ),
                          },
                        ]}
                      >
                        {obtenerTextoEstado(
                          misionSeleccionada.estado
                        )}
                      </Text>
                    </View>
                  </View>

                  {/* DESCRIPCIÓN */}

                  <View style={styles.modalSection}>
                    <View
                      style={styles.sectionHeader}
                    >
                      <View
                        style={styles.sectionLine}
                      />

                      <Text
                        style={styles.sectionTitle}
                      >
                        DESCRIPCIÓN
                      </Text>
                    </View>

                    <View
                      style={styles.descriptionCard}
                    >
                      <Text
                        style={
                          styles.modalDescription
                        }
                      >
                        {
                          misionSeleccionada.descripcion
                        }
                      </Text>
                    </View>
                  </View>

                  {/* INFORMACIÓN */}

                  <View style={styles.modalSection}>
                    <View
                      style={styles.sectionHeader}
                    >
                      <View
                        style={styles.sectionLine}
                      />

                      <Text
                        style={styles.sectionTitle}
                      >
                        INFORMACIÓN DE LA MISIÓN
                      </Text>
                    </View>

                    <View style={styles.detailGrid}>
                      {/* UBICACIÓN */}

                      <View style={styles.detailCard}>
                        <View
                          style={styles.detailIconContainer}
                        >
                          <Feather
                            name="map-pin"
                            size={18}
                            color="#e62429"
                          />
                        </View>

                        <Text
                          style={styles.detailLabel}
                        >
                          UBICACIÓN
                        </Text>

                        <Text
                          style={styles.detailValue}
                          numberOfLines={2}
                        >
                          {
                            misionSeleccionada.ubicacion
                          }
                        </Text>
                      </View>

                      {/* FECHA */}

                      <View style={styles.detailCard}>
                        <View
                          style={styles.detailIconContainer}
                        >
                          <Feather
                            name="calendar"
                            size={18}
                            color="#e62429"
                          />
                        </View>

                        <Text
                          style={styles.detailLabel}
                        >
                          FECHA
                        </Text>

                        <Text
                          style={styles.detailValue}
                        >
                          {formatearFecha(
                            misionSeleccionada.fecha
                          )}
                        </Text>
                      </View>

                      {/* HÉROE */}

                      <View style={styles.detailCard}>
                        <View
                          style={styles.detailIconContainer}
                        >
                          <Feather
                            name="user"
                            size={18}
                            color="#e62429"
                          />
                        </View>

                        <Text
                          style={styles.detailLabel}
                        >
                          HÉROE ASIGNADO
                        </Text>

                        <Text
                          style={styles.detailValue}
                        >
                          Héroe #
                          {
                            misionSeleccionada.superheroe_id
                          }
                        </Text>
                      </View>

                      {/* ID */}

                      <View style={styles.detailCard}>
                        <View
                          style={styles.detailIconContainer}
                        >
                          <Feather
                            name="hash"
                            size={18}
                            color="#e62429"
                          />
                        </View>

                        <Text
                          style={styles.detailLabel}
                        >
                          IDENTIFICADOR
                        </Text>

                        <Text
                          style={styles.detailValue}
                        >
                          #
                          {
                            misionSeleccionada.id
                          }
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* CERRAR */}

                  <Pressable
                    style={styles.closeModalButton}
                    onPress={() =>
                      setMisionSeleccionada(null)
                    }
                  >
                    <Feather
                      name="x"
                      size={16}
                      color="#fff"
                    />

                    <Text
                      style={styles.closeModalText}
                    >
                      CERRAR
                    </Text>
                  </Pressable>

                  {/* ADMIN */}

                  {esAdmin && (
                    <View
                      style={styles.actionButtons}
                    >
                      <Pressable
                        style={styles.editButton}
                        onPress={() =>
                          abrirFormularioEditar(
                            misionSeleccionada
                          )
                        }
                      >
                        <Feather
                          name="edit-2"
                          size={16}
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
                        style={styles.deleteButton}
                        onPress={() =>
                          eliminarMision(
                            misionSeleccionada.id,
                            misionSeleccionada.titulo
                          )
                        }
                      >
                        <Feather
                          name="trash-2"
                          size={16}
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
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* =================================================
          FORMULARIO
      ================================================= */}

      {esAdmin && (
        <MisionFormModal
          visible={formModalVisible}
          onClose={() =>
            setFormModalVisible(false)
          }
          onSuccess={() => {
            cargarMisiones();
          }}
          mision={misionEdicion}
        />
      )}

      {/* =================================================
          BOTÓN CREAR
      ================================================= */}

      {esAdmin && (
        <Pressable
          style={({ pressed }) => [
            styles.createButton,
            pressed && styles.createButtonPressed,
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
    </View>
  );
}

// =====================================================
// ESTILOS
// =====================================================

const styles = StyleSheet.create({
  // =====================================================
  // GENERAL
  // =====================================================

  container: {
    flex: 1,
    backgroundColor: "#080808",
  },

  center: {
    flex: 1,
    backgroundColor: "#080808",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
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

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerSmall: {
    color: "#e62429",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 4,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 3,
  },

  headerSubtitle: {
    color: "#777",
    fontSize: 13,
    marginTop: 4,
  },

  headerBadge: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#e62429",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#e62429",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
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

  // =====================================================
  // ESTADÍSTICAS
  // =====================================================

  statsContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
  },

  statCard: {
    flex: 1,
    minHeight: 58,
    backgroundColor: "#151515",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#252525",
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  statNumber: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "900",
  },

  statLabel: {
    color: "#666",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.4,
    marginTop: 1,
  },

  headerFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
  },

  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  roleText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  highDangerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  highDangerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#e62429",
  },

  highDangerText: {
    color: "#777",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  // =====================================================
  // LISTA
  // =====================================================

  list: {
    padding: 16,
    paddingBottom: 100,
  },

  // =====================================================
  // CARD
  // =====================================================

  card: {
    backgroundColor: "#151515",
    borderRadius: 18,
    marginBottom: 17,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#292929",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 9,

    elevation: 5,
  },

  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },

  cardAccent: {
    width: "100%",
    height: 3,
  },

  cardContent: {
    padding: 17,
  },

  // =====================================================
  // CARD HEADER
  // =====================================================

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  missionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#202020",
    borderWidth: 1,
    borderColor: "#303030",
    justifyContent: "center",
    alignItems: "center",
  },

  cardHeaderInfo: {
    flex: 1,
    marginLeft: 10,
  },

  missionId: {
    color: "#777",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  missionDate: {
    color: "#aaa",
    fontSize: 11,
    marginTop: 3,
  },

  dangerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },

  dangerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  dangerText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  // =====================================================
  // TÍTULO / DESCRIPCIÓN
  // =====================================================

  missionTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 17,
    letterSpacing: 0.2,
  },

  description: {
    color: "#8d8d8d",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },

  // =====================================================
  // ESTADO
  // =====================================================

  statusContainer: {
    marginTop: 13,
    alignItems: "flex-start",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  statusText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  // =====================================================
  // SEPARADOR
  // =====================================================

  separator: {
    height: 1,
    backgroundColor: "#292929",
    marginVertical: 15,
  },

  // =====================================================
  // INFORMACIÓN
  // =====================================================

  infoGrid: {
    gap: 9,
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#101010",
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#222",
    padding: 10,
  },

  infoIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "#1c1c1c",
    justifyContent: "center",
    alignItems: "center",
  },

  infoTextContainer: {
    flex: 1,
    marginLeft: 10,
  },

  infoLabel: {
    color: "#555",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },

  infoValue: {
    color: "#ddd",
    fontSize: 13,
    marginTop: 3,
  },

  // =====================================================
  // FOOTER CARD
  // =====================================================

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
  },

  heroAssigned: {
    flexDirection: "row",
    alignItems: "center",
  },

  heroIcon: {
    width: 31,
    height: 31,
    borderRadius: 8,
    backgroundColor: "#242424",
    justifyContent: "center",
    alignItems: "center",
  },

  heroLabel: {
    color: "#555",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginLeft: 8,
  },

  heroValue: {
    color: "#aaa",
    fontSize: 11,
    marginLeft: 8,
    marginTop: 2,
  },

  detailsAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  detailsText: {
    color: "#e62429",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  // =====================================================
  // LOADING
  // =====================================================

  loadingLogo: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: "#e62429",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,

    shadowColor: "#e62429",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },

  loadingTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 15,
  },

  loadingText: {
    color: "#777",
    fontSize: 13,
    marginTop: 6,
  },

  // =====================================================
  // ERROR
  // =====================================================

  errorIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 2,
    borderColor: "#e62429",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  errorTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
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
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 10,
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  retryText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },

  // =====================================================
  // EMPTY
  // =====================================================

  emptyIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#292929",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  emptyTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },

  emptyText: {
    color: "#777",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 8,
    maxWidth: 290,
  },

  emptyButton: {
    marginTop: 22,
    backgroundColor: "#e62429",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  emptyButtonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  // =====================================================
  // MODAL
  // =====================================================

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.88)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    backgroundColor: "#111",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: "91%",
    borderWidth: 1,
    borderColor: "#292929",
  },

  modalScrollContent: {
    padding: 21,
    paddingBottom: 35,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  modalMissionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  modalHeaderInfo: {
    flex: 1,
    marginLeft: 11,
  },

  modalMissionId: {
    color: "#777",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  modalMissionDate: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 3,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#202020",
    borderWidth: 1,
    borderColor: "#303030",
    justifyContent: "center",
    alignItems: "center",
  },

  modalTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 20,
    lineHeight: 33,
  },

  modalBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 15,
  },

  modalDanger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },

  modalStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },

  modalBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  modalBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  modalStatusText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  // =====================================================
  // SECCIONES MODAL
  // =====================================================

  modalSection: {
    marginTop: 25,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 11,
  },

  sectionLine: {
    width: 4,
    height: 15,
    backgroundColor: "#e62429",
    borderRadius: 3,
    marginRight: 8,
  },

  sectionTitle: {
    color: "#777",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.3,
  },

  descriptionCard: {
    backgroundColor: "#181818",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#272727",
    padding: 15,
  },

  modalDescription: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 22,
  },

  // =====================================================
  // DETAIL GRID
  // =====================================================

  detailGrid: {
    gap: 9,
  },

  detailCard: {
    backgroundColor: "#181818",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#272727",
    padding: 13,
  },

  detailIconContainer: {
    width: 35,
    height: 35,
    borderRadius: 9,
    backgroundColor: "#202020",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 9,
  },

  detailLabel: {
    color: "#555",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },

  detailValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },

  // =====================================================
  // BOTÓN CERRAR MODAL
  // =====================================================

  closeModalButton: {
    backgroundColor: "#e62429",
    borderRadius: 11,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
    marginTop: 25,
  },

  closeModalText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  // =====================================================
  // ACCIONES ADMIN
  // =====================================================

  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 11,
  },

  editButton: {
    flex: 1,
    backgroundColor: "#3f7fd1",
    borderRadius: 11,
    paddingVertical: 13,
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
    backgroundColor: "#b91c1c",
    borderRadius: 11,
    paddingVertical: 13,
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

  // =====================================================
  // BOTÓN CREAR
  // =====================================================

  createButton: {
    position: "absolute",
    right: 20,
    bottom: 30,
    width: 61,
    height: 61,
    borderRadius: 31,
    backgroundColor: "#e62429",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#e62429",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,

    elevation: 8,
  },

  createButtonPressed: {
    transform: [{ scale: 0.92 }],
    opacity: 0.9,
  },
});