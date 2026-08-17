import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { colors, radii } from "@/constants/theme";
import {
  BarList,
  DonutChart,
  ChartLegend,
} from "@/components/Charts";
import api from "@/services/api";

type Hero = {
  id: number | string;
  nombre: string;
  estado: string;
};

type Mision = {
  id: number | string;
  titulo: string;
  ubicacion: string;
  estado: "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA";
  superheroe_id: number | string;
};

const STATUS_LABEL: Record<Mision["estado"], string> = {
  PENDIENTE: "PENDIENTE",
  EN_PROGRESO: "EN PROGRESO",
  COMPLETADA: "COMPLETADA",
};

const STATUS_COLOR: Record<Mision["estado"], string> = {
  PENDIENTE: colors.gold,
  EN_PROGRESO: colors.blue,
  COMPLETADA: colors.green,
};

export default function HomeScreen() {
  const router = useRouter();

  // ==========================================
  // ESTADOS
  // ==========================================

  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [misiones, setMisiones] = useState<Mision[]>([]);

  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // CARGAR USUARIO
  // ==========================================

  const cargarUsuario = async () => {
    try {
      const raw = await AsyncStorage.getItem("user");

      if (raw) {
        const user = JSON.parse(raw);

        setUserName(user?.nombre ?? "");
        setUserRole(user?.rol ?? "");
      }
    } catch (err) {
      console.error("Error cargando usuario:", err);
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");

      router.replace("/login");
    } catch (err) {
      console.error("Error cerrando sesión:", err);
    }
  };

  // ==========================================
  // CARGAR DASHBOARD
  // ==========================================

const cargarDashboard = useCallback(
  async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [
        heroesResponse,
        misionesResponse,
      ] = await Promise.all([
        api.get("/heroes"),
        api.get("/misiones"),
      ]);

      setHeroes(heroesResponse.data.data || []);
      setMisiones(misionesResponse.data.data || []);

    } catch (err: any) {

      // ==========================================
      // SI ES 401 -> IR DIRECTAMENTE AL LOGIN
      // ==========================================

      if (
        err?.response?.status === 401 ||
        err?.sessionExpired === true
      ) {
        router.replace("/login");
        return;
      }

      // ==========================================
      // OTROS ERRORES
      // ==========================================

      console.error("Error dashboard:", err);

      setError(
        "No se pudieron cargar los datos del dashboard."
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  },
  [router]
);

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================

  useEffect(() => {
    cargarUsuario();
    cargarDashboard();
  }, [cargarDashboard]);

  // ==========================================
  // ESTADÍSTICAS
  // ==========================================

  const heroesActivos = heroes.filter(
    (hero) => hero.estado === "ACTIVO"
  ).length;

  const misionesCompletadas =
    misiones.filter(
      (mision) =>
        mision.estado === "COMPLETADA"
    ).length;

  // ==========================================
  // MISIONES POR HÉROE
  // ==========================================

  const misionesPorHeroe = heroes
    .map((hero) => ({
      label: hero.nombre,
      value: misiones.filter(
        (mision) =>
          Number(mision.superheroe_id) ===
          Number(hero.id)
      ).length,
    }))
    .filter((hero) => hero.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // ==========================================
  // ESTADO DE MISIONES
  // ==========================================

  const misionesPorEstado = [
    {
      label: "Pendientes",
      value: misiones.filter(
        (mision) =>
          mision.estado === "PENDIENTE"
      ).length,
      color: colors.gold,
    },
    {
      label: "En progreso",
      value: misiones.filter(
        (mision) =>
          mision.estado === "EN_PROGRESO"
      ).length,
      color: colors.blue,
    },
    {
      label: "Completadas",
      value: misiones.filter(
        (mision) =>
          mision.estado === "COMPLETADA"
      ).length,
      color: colors.green,
    },
  ];

  // ==========================================
  // MISIONES RECIENTES
  // ==========================================

  const misionesRecientes =
    misiones.slice(0, 5);

  // ==========================================
  // LOADING
  // ==========================================

  if (
    loading &&
    heroes.length === 0 &&
    misiones.length === 0
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
          Cargando dashboard
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
    heroes.length === 0 &&
    misiones.length === 0
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
            cargarDashboard(false)
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              cargarDashboard(true)
            }
            tintColor={colors.red}
            colors={[colors.red]}
          />
        }
      >
        {/* ========================================
            HEADER
        ======================================== */}

        <View style={styles.header}>

          {/* COLUMNA IZQUIERDA + COLUMNA DERECHA */}

          <View style={styles.headerLayout}>

            {/* ====================================
                IZQUIERDA
            ==================================== */}

            <View style={styles.headerLeft}>

              <Text style={styles.headerSmall}>
                MARVEL MANAGER
              </Text>

              <Text
                style={styles.headerTitle}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                DASHBOARD
              </Text>

              <Text
                style={styles.headerSubtitle}
                numberOfLines={1}
              >
                Resumen general del sistema
              </Text>

              {/* MODO CONSULTA */}

              <View style={styles.roleRow}>
                <View style={styles.roleIcon}>
                  <Feather
                    name={
                      userRole === "ADMIN"
                        ? "shield"
                        : "eye"
                    }
                    size={13}
                    color={colors.red}
                  />
                </View>

                <View style={styles.roleInfo}>
                  <Text style={styles.roleText}>
                    {userRole === "ADMIN"
                      ? "ADMINISTRADOR"
                      : "MODO CONSULTA"}
                  </Text>

                  {userName ? (
                    <Text
                      style={styles.userWelcome}
                      numberOfLines={1}
                    >
                      {userName}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>

            {/* ====================================
                DERECHA
            ==================================== */}

            <View style={styles.headerRight}>

              {/* LOGOUT */}

              <Pressable
                style={({ pressed }) => [
                  styles.logoutButton,
                  pressed &&
                    styles.logoutPressed,
                ]}
                onPress={handleLogout}
              >
                <Feather
                  name="log-out"
                  size={16}
                  color="#fff"
                />
              </Pressable>

              {/* DATOS */}

              <View style={styles.headerBadge}>
                <Feather
                  name="activity"
                  size={18}
                  color="#fff"
                />

                <Text
                  style={
                    styles.headerBadgeNumber
                  }
                >
                  {heroes.length +
                    misiones.length}
                </Text>

                <Text
                  style={
                    styles.headerBadgeText
                  }
                >
                  DATOS
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ========================================
            ESTADÍSTICAS
        ======================================== */}

        <View style={styles.statsGrid}>
          <StatCard
            icon="shield"
            tint={colors.red}
            tintSoft={colors.redSoft}
            label="Superhéroes"
            value={heroes.length}
          />

          <StatCard
            icon="target"
            tint={colors.blue}
            tintSoft={colors.blueSoft}
            label="Misiones"
            value={misiones.length}
          />

          <StatCard
            icon="zap"
            tint={colors.gold}
            tintSoft={colors.goldSoft}
            label="Héroes activos"
            value={heroesActivos}
          />

          <StatCard
            icon="check-circle"
            tint={colors.green}
            tintSoft={colors.greenSoft}
            label="Completadas"
            value={misionesCompletadas}
          />
        </View>

        {/* ========================================
            MISIONES POR SUPERHÉROE
        ======================================== */}

        <View style={styles.sectionCard}>
          <View style={styles.sectionContent}>
            <Text
              style={styles.sectionLabel}
            >
              ASIGNACIÓN
            </Text>

            <Text
              style={styles.sectionTitle}
            >
              MISIONES POR SUPERHÉROE
            </Text>

            <Text
              style={styles.sectionSubtitle}
            >
              Misiones asignadas actualmente
            </Text>

            <View style={styles.divider} />

            <View
              style={styles.chartContainer}
            >
              {misionesPorHeroe.length > 0 ? (
                <BarList
                  data={misionesPorHeroe}
                  color={colors.red}
                />
              ) : (
                <View
                  style={styles.emptyChart}
                >
                  <Feather
                    name="bar-chart-2"
                    size={25}
                    color={colors.red}
                  />

                  <Text
                    style={
                      styles.emptyChartTitle
                    }
                  >
                    Sin asignaciones
                  </Text>

                  <Text
                    style={
                      styles.emptyChartText
                    }
                  >
                    Todavía no existen
                    misiones asignadas a
                    superhéroes.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* ========================================
            ESTADO DE MISIONES
        ======================================== */}

        <View style={styles.sectionCard}>
          <View style={styles.sectionContent}>
            <Text
              style={styles.sectionLabel}
            >
              ESTADO
            </Text>

            <Text
              style={styles.sectionTitle}
            >
              ESTADO DE MISIONES
            </Text>

            <Text
              style={styles.sectionSubtitle}
            >
              Distribución actual
            </Text>

            <View style={styles.divider} />

            <View style={styles.donutRow}>
              <View
                style={
                  styles.donutContainer
                }
              >
                <DonutChart
                  data={misionesPorEstado}
                />
              </View>

              <View
                style={
                  styles.legendContainer
                }
              >
                <ChartLegend
                  data={misionesPorEstado}
                />
              </View>
            </View>
          </View>
        </View>

        {/* ========================================
            MISIONES RECIENTES
        ======================================== */}

        <View style={styles.sectionCard}>
          <View style={styles.sectionContent}>
            <Text
              style={styles.sectionLabel}
            >
              ACTIVIDAD
            </Text>

            <Text
              style={styles.sectionTitle}
            >
              MISIONES RECIENTES
            </Text>

            <Text
              style={styles.sectionSubtitle}
            >
              Últimas misiones registradas
            </Text>

            <View style={styles.divider} />

            <View
              style={styles.missionsList}
            >
              {misionesRecientes.length === 0 && (
                <View style={styles.empty}>
                  <View
                    style={styles.emptyIcon}
                  >
                    <Feather
                      name="target"
                      size={25}
                      color={colors.red}
                    />
                  </View>

                  <Text
                    style={styles.emptyTitle}
                  >
                    No hay misiones
                  </Text>

                  <Text
                    style={styles.emptyText}
                  >
                    Todavía no hay misiones
                    registradas.
                  </Text>
                </View>
              )}

              {misionesRecientes.map(
                (mision, index) => (
                  <View
                    key={mision.id}
                    style={[
                      styles.missionRow,
                      index ===
                        misionesRecientes.length -
                          1 && {
                        borderBottomWidth: 0,
                      },
                    ]}
                  >
                    {/* ICONO */}

                    <View
                      style={
                        styles.missionIcon
                      }
                    >
                      <Feather
                        name="target"
                        size={16}
                        color={colors.red}
                      />
                    </View>

                    {/* INFORMACIÓN */}

                    <View
                      style={
                        styles.missionInfo
                      }
                    >
                      <Text
                        style={
                          styles.missionTitle
                        }
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {mision.titulo}
                      </Text>

                      <Text
                        style={
                          styles.missionLocation
                        }
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {mision.ubicacion}
                      </Text>
                    </View>

                    {/* ESTADO */}

                    <View
                      style={
                        styles.missionStatus
                      }
                    >
                      <View
                        style={[
                          styles.statusTag,
                          {
                            backgroundColor:
                              STATUS_COLOR[
                                mision.estado
                              ],
                          },
                        ]}
                      >
                        <Text
                          style={
                            styles.statusTagText
                          }
                          numberOfLines={1}
                        >
                          {
                            STATUS_LABEL[
                              mision.estado
                            ]
                          }
                        </Text>
                      </View>
                    </View>
                  </View>
                )
              )}
            </View>
          </View>
        </View>

        {/* ========================================
            FOOTER
        ======================================== */}

        <View style={styles.footer}>
          <View style={styles.footerLine} />

          <Text style={styles.footerText}>
            MARVEL MANAGER
          </Text>

          <Text
            style={styles.footerSubtext}
          >
            Sistema de gestión de
            superhéroes y misiones
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({
  icon,
  tint,
  tintSoft,
  label,
  value,
}: {
  icon: React.ComponentProps<
    typeof Feather
  >["name"];
  tint: string;
  tintSoft: string;
  label: string;
  value: number;
}) {
  return (
    <View style={styles.statCardWrap}>
      <View style={styles.statCard}>
        <View
          style={[
            styles.statIcon,
            {
              backgroundColor: tintSoft,
              borderColor: tint,
            },
          ]}
        >
          <Feather
            name={icon}
            size={18}
            color={tint}
          />
        </View>

        <Text
          style={styles.statLabel}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          {label}
        </Text>

        <Text style={styles.statValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

// =====================================================
// ESTILOS
// =====================================================

const CARD_GAP = 16;

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
    paddingBottom: 55,
  },

  // ===================================================
  // HEADER
  // ===================================================

  header: {
    width: "100%",
    marginBottom: 20,
  },

  /*
   * AQUÍ ESTÁ EL CAMBIO PRINCIPAL.
   *
   * La izquierda contiene:
   * - MARVEL MANAGER
   * - DASHBOARD
   * - Resumen
   * - MODO CONSULTA
   *
   * La derecha contiene:
   * - LOGOUT
   * - DATOS
   *
   * Así no quedan huecos artificiales.
   */

  headerLayout: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  headerLeft: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },

  headerRight: {
    width: 68,
    flexShrink: 0,
    alignItems: "center",
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

  // ===================================================
  // LOGOUT
  // ===================================================

  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.red,
    borderWidth: 1.5,
    borderColor: colors.ink,
    justifyContent: "center",
    alignItems: "center",
  },

  logoutPressed: {
    opacity: 0.7,
    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  // ===================================================
  // DATOS
  // ===================================================

  headerBadge: {
    width: 68,
    height: 68,
    borderRadius: radii.md,
    backgroundColor: colors.red,
    borderWidth: 1.5,
    borderColor: colors.ink,
    justifyContent: "center",
    alignItems: "center",

    /*
     * Solo 8px entre Logout y Datos.
     * Esto elimina el hueco grande de la captura.
     */
    marginTop: 8,
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

  // ===================================================
  // USER / ROLE
  // ===================================================

  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",

    /*
     * Separa un poquito el usuario del subtítulo,
     * pero sin crear el hueco enorme de antes.
     */
    marginTop: 12,

    paddingHorizontal: 10,
    paddingVertical: 7,

    borderRadius: radii.sm,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.panelBorder,

    maxWidth: "100%",
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

  roleInfo: {
    minWidth: 0,
  },

  roleText: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  userWelcome: {
    color: colors.textFaint,
    fontSize: 9,
    marginTop: 2,
  },

  // ===================================================
  // STATS
  // ===================================================

  statsGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  statCardWrap: {
    width: "48.2%",
    marginBottom: CARD_GAP,
  },

  statCard: {
    minHeight: 135,
    padding: 15,
    backgroundColor: colors.panel,
    borderRadius: radii.lg,
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

  statIcon: {
    width: 38,
    height: 38,
    flexShrink: 0,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 11,
  },

  statLabel: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  statValue: {
    color: colors.text,
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "900",
    marginTop: 4,
  },

  // ===================================================
  // SECTION CARDS
  // ===================================================

  sectionCard: {
    width: "100%",
    backgroundColor: colors.panel,
    borderRadius: radii.lg,
    marginBottom: CARD_GAP + 4,
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

  sectionContent: {
    padding: 20,
  },

  sectionLabel: {
    color: colors.red,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginBottom: 7,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  sectionSubtitle: {
    color: colors.textMuted,
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: colors.panelBorder,
    marginVertical: 16,
  },

  // ===================================================
  // CHART
  // ===================================================

  chartContainer: {
    width: "100%",
  },

  emptyChart: {
    alignItems: "center",
    paddingVertical: 22,
    paddingHorizontal: 15,
  },

  emptyChartTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 10,
  },

  emptyChartText: {
    color: colors.textMuted,
    textAlign: "center",
    fontSize: 11.5,
    lineHeight: 18,
    marginTop: 5,
  },

  // ===================================================
  // DONUT
  // ===================================================

  donutRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 12,
  },

  donutContainer: {
    flexShrink: 0,
  },

  legendContainer: {
    flex: 1,
    minWidth: 0,
  },

  // ===================================================
  // MISSIONS
  // ===================================================

  missionsList: {
    width: "100%",
  },

  missionRow: {
    width: "100%",
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.panelBorder,
    gap: 9,
  },

  missionIcon: {
    width: 38,
    height: 38,
    flexShrink: 0,
    borderRadius: radii.sm,
    backgroundColor: colors.redSoft,
    borderWidth: 1,
    borderColor: colors.red,
    justifyContent: "center",
    alignItems: "center",
  },

  missionInfo: {
    flex: 1,
    minWidth: 0,
  },

  missionTitle: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
  },

  missionLocation: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },

  missionStatus: {
    width: 82,
    flexShrink: 0,
    alignItems: "flex-end",
  },

  statusTag: {
    maxWidth: 82,
    minHeight: 25,
    paddingHorizontal: 7,
    paddingVertical: 6,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  statusTagText: {
    color: "#fff",
    fontSize: 7.5,
    fontWeight: "900",
    letterSpacing: 0.3,
    textAlign: "center",
  },

  // ===================================================
  // EMPTY
  // ===================================================

  empty: {
    alignItems: "center",
    paddingVertical: 25,
    paddingHorizontal: 20,
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
    fontSize: 17,
    fontWeight: "900",
    marginTop: 14,
  },

  emptyText: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 19,
    fontSize: 12,
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
  // FOOTER
  // ===================================================

  footer: {
    alignItems: "center",
    paddingTop: 5,
    paddingBottom: 20,
  },

  footerLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.red,
    marginBottom: 10,
  },

  footerText: {
    color: colors.text,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2,
  },

  footerSubtext: {
    color: colors.textFaint,
    fontSize: 9,
    marginTop: 4,
  },
});