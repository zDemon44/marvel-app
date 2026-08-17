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
import { Tag, HardShadowCard } from "@/components/UI";
import { BarList, DonutChart, ChartLegend } from "@/components/Charts";
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

  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [misiones, setMisiones] = useState<Mision[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // CARGAR USUARIO
  // =========================
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

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");

      router.replace("/login");
    } catch (err) {
      console.error("Error cerrando sesión:", err);
    }
  };

  // =========================
  // CARGAR DASHBOARD
  // =========================
  const cargarDashboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [heroesResponse, misionesResponse] = await Promise.all([
        api.get("/heroes"),
        api.get("/misiones"),
      ]);

      setHeroes(heroesResponse.data.data);
      setMisiones(misionesResponse.data.data);
    } catch (err) {
      console.error("Error dashboard:", err);

      setError("No se pudieron cargar los datos del dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // =========================
  // INICIALIZAR
  // =========================
  useEffect(() => {
    cargarUsuario();
    cargarDashboard();
  }, [cargarDashboard]);

  // =========================
  // MISIONES POR SUPERHÉROE
  // =========================
  const misionesPorHeroe = heroes
    .map((hero) => ({
      label: hero.nombre,
      value: misiones.filter(
        (m) => Number(m.superheroe_id) === Number(hero.id)
      ).length,
    }))
    .filter((h) => h.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // =========================
  // ESTADO DE MISIONES
  // =========================
  const misionesPorEstado = [
    {
      label: "Pendientes",
      value: misiones.filter((m) => m.estado === "PENDIENTE").length,
      color: colors.gold,
    },
    {
      label: "En progreso",
      value: misiones.filter((m) => m.estado === "EN_PROGRESO").length,
      color: colors.blue,
    },
    {
      label: "Completadas",
      value: misiones.filter((m) => m.estado === "COMPLETADA").length,
      color: colors.green,
    },
  ];

  // =========================
  // ESTADÍSTICAS
  // =========================
  const heroesActivos = heroes.filter(
    (h) => h.estado === "ACTIVO"
  ).length;

  const misionesCompletadas = misiones.filter(
    (m) => m.estado === "COMPLETADA"
  ).length;

  const misionesRecientes = misiones.slice(0, 5);

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <SafeAreaView
        style={[styles.screen, styles.centered]}
        edges={["top"]}
      >
        <ActivityIndicator
          size="large"
          color={colors.red}
        />

        <Text style={styles.loadingText}>
          Cargando dashboard...
        </Text>
      </SafeAreaView>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (error) {
    return (
      <SafeAreaView
        style={[
          styles.screen,
          styles.centered,
          { padding: 24 },
        ]}
        edges={["top"]}
      >
        <HardShadowCard>
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>
              Algo salió mal
            </Text>

            <Text style={styles.errorText}>
              {error}
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={() => cargarDashboard()}
            >
              <Text style={styles.retryButtonText}>
                Reintentar
              </Text>
            </Pressable>
          </View>
        </HardShadowCard>
      </SafeAreaView>
    );
  }

  // =========================
  // DASHBOARD
  // =========================
  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => cargarDashboard(true)}
            tintColor={colors.red}
          />
        }
      >
        {/* ================= HEADER ================= */}

        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Tag style={{ marginBottom: 10 }}>
              MARVEL MANAGER
            </Tag>

            <Text style={styles.title}>
              DASHBOARD
            </Text>
          </View>

          {/* USUARIO + LOGOUT */}

          <View style={styles.headerActions}>
            {!!userName && (
              <View style={styles.userChip}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {userName
                      .charAt(0)
                      .toUpperCase()}
                  </Text>
                </View>

                <View>
                  <Text
                    style={styles.userName}
                    numberOfLines={1}
                  >
                    {userName}
                  </Text>

                  <Text style={styles.userRole}>
                    {userRole}
                  </Text>
                </View>
              </View>
            )}

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
                size={18}
                color="#fff"
              />
            </Pressable>
          </View>
        </View>

        {/* ================= SUBTITLE ================= */}

        <Text style={styles.subtitle}>
          Bienvenido de nuevo
          {userName ? `, ${userName}` : ""}.
          Aquí tienes un resumen del sistema.
        </Text>

        {/* ================= STATS ================= */}

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

        {/* ================= BARRAS ================= */}

        <HardShadowCard
          style={styles.sectionCard}
          contentStyle={styles.sectionContent}
        >
          <Tag style={styles.sectionTag}>
            ASIGNACIÓN
          </Tag>

          <Text style={styles.sectionTitle}>
            Misiones por superhéroe
          </Text>

          <Text style={styles.sectionSubtitle}>
            Misiones asignadas actualmente
          </Text>

          <View style={{ marginTop: 20 }}>
            <BarList
              data={misionesPorHeroe}
              color={colors.red}
            />
          </View>
        </HardShadowCard>

        {/* ================= DONUT ================= */}

        <HardShadowCard
          style={styles.sectionCard}
          contentStyle={styles.sectionContent}
        >
          <Tag style={styles.sectionTag}>
            ESTADO
          </Tag>

          <Text style={styles.sectionTitle}>
            Estado de misiones
          </Text>

          <Text style={styles.sectionSubtitle}>
            Distribución actual
          </Text>

          <View style={styles.donutRow}>
            <DonutChart
              data={misionesPorEstado}
            />

            <View style={{ flex: 1 }}>
              <ChartLegend
                data={misionesPorEstado}
              />
            </View>
          </View>
        </HardShadowCard>

        {/* ================= MISIONES RECIENTES ================= */}

        <HardShadowCard
          style={styles.sectionCard}
          contentStyle={styles.sectionContent}
        >
          <Tag style={styles.sectionTag}>
            ACTIVIDAD
          </Tag>

          <Text style={styles.sectionTitle}>
            Misiones recientes
          </Text>

          <Text style={styles.sectionSubtitle}>
            Últimas misiones registradas
          </Text>

          <View style={styles.missionsList}>
            {misionesRecientes.length === 0 && (
              <Text style={styles.emptyText}>
                Todavía no hay misiones registradas.
              </Text>
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
                  <View
                    style={styles.missionIcon}
                  >
                    <Feather
                      name="target"
                      size={16}
                      color={colors.text}
                    />
                  </View>

                  <View
                    style={{
                      flex: 1,
                      marginLeft: 12,
                    }}
                  >
                    <Text
                      style={styles.missionTitle}
                      numberOfLines={1}
                    >
                      {mision.titulo}
                    </Text>

                    <Text
                      style={
                        styles.missionLocation
                      }
                      numberOfLines={1}
                    >
                      {mision.ubicacion}
                    </Text>
                  </View>

                  <Tag
                    style={{
                      backgroundColor:
                        STATUS_COLOR[
                          mision.estado
                        ],
                    }}
                  >
                    {STATUS_LABEL[
                      mision.estado
                    ]}
                  </Tag>
                </View>
              )
            )}
          </View>
        </HardShadowCard>
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
    <HardShadowCard
      shadowColor={tint}
      style={styles.statCardWrap}
      contentStyle={styles.statCard}
    >
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

      <Text style={styles.statLabel}>
        {label}
      </Text>

      <Text style={styles.statValue}>
        {value}
      </Text>
    </HardShadowCard>
  );
}

// =====================================================
// STYLES
// =====================================================

const CARD_GAP = 16;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  centered: {
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 48,
  },

  loadingText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 14,
  },

  // ================= ERROR =================

  errorBox: {
    padding: 28,
    alignItems: "center",
  },

  errorTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 6,
  },

  errorText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    marginBottom: 18,
  },

  retryButton: {
    backgroundColor: colors.red,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: radii.sm,
  },

  retryButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },

  // ================= HEADER =================

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  subtitle: {
    color: colors.textMuted,
    fontSize: 13.5,
    marginTop: 10,
    marginBottom: 24,
  },

  // ================= USER =================

  userChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: radii.md,
    paddingVertical: 6,
    paddingHorizontal: 10,
    maxWidth: 130,
  },

  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.red,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  userAvatarText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 13,
  },

  userName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },

  userRole: {
    color: colors.textFaint,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: 1,
  },

  // ================= LOGOUT =================

  logoutButton: {
    width: 38,
    height: 38,
    borderRadius: radii.sm,
    backgroundColor: colors.red,
    borderWidth: 1.5,
    borderColor: colors.ink,
    justifyContent: "center",
    alignItems: "center",
  },

  logoutPressed: {
    opacity: 0.7,
  },

  // ================= STATS =================

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: CARD_GAP + 6,
  },

  statCardWrap: {
    width: "48%",
    marginBottom: CARD_GAP,
  },

  statCard: {
    padding: 16,
  },

  statIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  statLabel: {
    color: colors.textMuted,
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  statValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 4,
  },

  // ================= SECTIONS =================

  sectionCard: {
    marginBottom: CARD_GAP + 4,
  },

  sectionContent: {
    padding: 20,
  },

  sectionTag: {
    marginBottom: 12,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: colors.textMuted,
    fontSize: 12.5,
    marginTop: 3,
  },

  // ================= DONUT =================

  donutRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
    gap: 18,
  },

  // ================= MISSIONS =================

  missionsList: {
    marginTop: 8,
  },

  missionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.panelBorder,
  },

  missionIcon: {
    width: 34,
    height: 34,
    borderRadius: radii.sm,
    backgroundColor: colors.ink,
    borderWidth: 1,
    borderColor: colors.panelBorder,
    justifyContent: "center",
    alignItems: "center",
  },

  missionTitle: {
    color: colors.text,
    fontSize: 13.5,
    fontWeight: "700",
  },

  missionLocation: {
    color: colors.textMuted,
    fontSize: 11.5,
    marginTop: 2,
  },

  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    fontStyle: "italic",
  },
});