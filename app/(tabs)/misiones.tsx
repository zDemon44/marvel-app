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
import api from "@/services/api";
import MisionFormModal from "@/components/MisionFormModal";
import { colors } from "@/constants/theme";

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
  const [misiones, setMisiones] = useState<Mision[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [misionSeleccionada, setMisionSeleccionada] = useState<Mision | null>(null);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [misionEdicion, setMisionEdicion] = useState<Mision | null>(null);

  const cargarMisiones = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError("");
      const response = await api.get("/misiones");
      setMisiones(response.data.data || []);
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "No se pudieron cargar las misiones."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarMisiones();
  }, []);

  const abrirFormularioCrear = () => {
    setMisionEdicion(null);
    setFormModalVisible(true);
  };

  const abrirFormularioEditar = (mision: Mision) => {
    setMisionEdicion(mision);
    setFormModalVisible(true);
    setMisionSeleccionada(null);
  };

  const eliminarMision = async (misionId: number, tituloMision: string) => {
    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de que deseas eliminar la misión "${tituloMision}"?`,
      [
        { text: "Cancelar", onPress: () => {}, style: "cancel" },
        {
          text: "Eliminar",
          onPress: async () => {
            try {
              await api.delete(`/misiones/${misionId}`);
              Alert.alert("Éxito", "Misión eliminada correctamente");
              cargarMisiones();
              setMisionSeleccionada(null);
            } catch (error: any) {
              Alert.alert("Error", error.response?.data?.message || "Error al eliminar");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const obtenerColorPeligro = (nivel: string) => {
    switch (nivel) {
      case "ALTO": return "#e62429";
      case "MEDIO": return "#f5a623";
      case "BAJO": return "#4caf50";
      default: return "#888";
    }
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case "COMPLETADA": return "#4caf50";
      case "EN_PROGRESO": return "#f5a623";
      case "PENDIENTE": return "#e62429";
      default: return "#888";
    }
  };

  const obtenerTextoEstado = (estado: string) => {
    switch (estado) {
      case "EN_PROGRESO": return "EN PROGRESO";
      case "COMPLETADA": return "COMPLETADA";
      case "PENDIENTE": return "PENDIENTE";
      default: return estado;
    }
  };

  const formatearFecha = (fecha: string) => {
    const partes = fecha.substring(0, 10).split("-");
    if (partes.length === 3) {
      const [year, month, day] = partes;
      const meses = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
      return `${day} ${meses[Number(month) - 1]} ${year}`;
    }
    return fecha;
  };

  const renderMision = ({ item }: { item: Mision }) => {
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => setMisionSeleccionada(item)}
      >
        <View style={styles.cardTop}>
          <View style={[styles.dangerBadge, { backgroundColor: obtenerColorPeligro(item.nivel_peligro) }]}>
            <Text style={styles.dangerText}>⚠ {item.nivel_peligro}</Text>
          </View>
          <View style={[styles.statusBadge, { borderColor: obtenerColorEstado(item.estado) }]}>
            <Text style={[styles.statusText, { color: obtenerColorEstado(item.estado) }]}>
              {obtenerTextoEstado(item.estado)}
            </Text>
          </View>
        </View>
        <Text style={styles.missionTitle}>{item.titulo}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.descripcion}</Text>
        <View style={styles.separator} />
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📍</Text>
          <View>
            <Text style={styles.infoLabel}>UBICACIÓN</Text>
            <Text style={styles.infoValue}>{item.ubicacion}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📅</Text>
          <View>
            <Text style={styles.infoLabel}>FECHA</Text>
            <Text style={styles.infoValue}>{formatearFecha(item.fecha)}</Text>
          </View>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.heroText}>🦸 Héroe #{item.superheroe_id}</Text>
          <Text style={styles.viewText}>VER DETALLES ›</Text>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e62429" />
        <Text style={styles.loadingText}>Cargando misiones...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠</Text>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={() => cargarMisiones(false)}>
          <Text style={styles.retryText}>REINTENTAR</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>MARVEL</Text>
        <Text style={styles.title}>MISIONES</Text>
        <Text style={styles.subtitle}>{misiones.length} misiones registradas</Text>
      </View>

      {misiones.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyTitle}>No hay misiones</Text>
          <Text style={styles.emptyText}>La API no contiene misiones registradas.</Text>
        </View>
      ) : (
        <FlatList
          data={misiones}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMision}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => cargarMisiones(true)}
              tintColor="#e62429"
              colors={["#e62429"]}
            />
          }
        />
      )}

      <Modal
        visible={misionSeleccionada !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setMisionSeleccionada(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {misionSeleccionada && (
                <>
                  <View style={styles.modalHeader}>
                    <View style={styles.modalIcon}>
                      <Text style={styles.modalIconText}>🎯</Text>
                    </View>
                    <Pressable style={styles.closeButton} onPress={() => setMisionSeleccionada(null)}>
                      <Text style={styles.closeText}>✕</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.modalTitle}>{misionSeleccionada.titulo}</Text>
                  <View style={styles.modalBadges}>
                    <View
                      style={[
                        styles.modalDanger,
                        { backgroundColor: obtenerColorPeligro(misionSeleccionada.nivel_peligro) },
                      ]}
                    >
                      <Text style={styles.modalBadgeText}>⚠ PELIGRO {misionSeleccionada.nivel_peligro}</Text>
                    </View>
                    <View
                      style={[
                        styles.modalStatus,
                        { borderColor: obtenerColorEstado(misionSeleccionada.estado) },
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalStatusText,
                          { color: obtenerColorEstado(misionSeleccionada.estado) },
                        ]}
                      >
                        {obtenerTextoEstado(misionSeleccionada.estado)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>DESCRIPCIÓN</Text>
                    <Text style={styles.modalDescription}>{misionSeleccionada.descripcion}</Text>
                  </View>
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>INFORMACIÓN DE LA MISIÓN</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailIcon}>📍</Text>
                      <View>
                        <Text style={styles.detailLabel}>Ubicación</Text>
                        <Text style={styles.detailValue}>{misionSeleccionada.ubicacion}</Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailIcon}>📅</Text>
                      <View>
                        <Text style={styles.detailLabel}>Fecha</Text>
                        <Text style={styles.detailValue}>{formatearFecha(misionSeleccionada.fecha)}</Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailIcon}>🦸</Text>
                      <View>
                        <Text style={styles.detailLabel}>Superhéroe asignado</Text>
                        <Text style={styles.detailValue}>ID #{misionSeleccionada.superheroe_id}</Text>
                      </View>
                    </View>
                  </View>
                  <Pressable style={styles.closeModalButton} onPress={() => setMisionSeleccionada(null)}>
                    <Text style={styles.closeModalText}>CERRAR</Text>
                  </Pressable>
                  <View style={styles.actionButtons}>
                    <Pressable style={styles.editButton} onPress={() => abrirFormularioEditar(misionSeleccionada)}>
                      <Feather name="edit-2" size={16} color="#fff" />
                      <Text style={styles.editButtonText}>EDITAR</Text>
                    </Pressable>
                    <Pressable style={styles.deleteButton} onPress={() => eliminarMision(misionSeleccionada.id, misionSeleccionada.titulo)}>
                      <Feather name="trash-2" size={16} color="#fff" />
                      <Text style={styles.deleteButtonText}>ELIMINAR</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <MisionFormModal
        visible={formModalVisible}
        onClose={() => setFormModalVisible(false)}
        onSuccess={() => {
          cargarMisiones();
        }}
        mision={misionEdicion}
      />

      <Pressable style={styles.createButton} onPress={abrirFormularioCrear}>
        <Feather name="plus" size={24} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080808" },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: "#222" },
  logo: { color: "#e62429", fontSize: 16, fontWeight: "900", letterSpacing: 3 },
  title: { color: "#fff", fontSize: 30, fontWeight: "900", marginTop: 5 },
  subtitle: { color: "#888", fontSize: 14, marginTop: 5 },
  list: { padding: 16, paddingBottom: 30 },
  card: { backgroundColor: "#151515", borderRadius: 16, marginBottom: 16, padding: 18, borderWidth: 1, borderColor: "#292929" },
  cardPressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  dangerBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 7 },
  dangerText: { color: "#fff", fontSize: 11, fontWeight: "900" },
  statusBadge: { borderWidth: 1, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 7 },
  statusText: { fontSize: 10, fontWeight: "900" },
  missionTitle: { color: "#fff", fontSize: 21, fontWeight: "900" },
  description: { color: "#999", fontSize: 14, lineHeight: 20, marginTop: 7 },
  separator: { height: 1, backgroundColor: "#292929", marginVertical: 16 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 13 },
  infoIcon: { fontSize: 19, width: 35 },
  infoLabel: { color: "#666", fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  infoValue: { color: "#ddd", fontSize: 14, marginTop: 2 },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  heroText: { color: "#aaa", fontSize: 12 },
  viewText: { color: "#e62429", fontSize: 11, fontWeight: "900" },
  center: { flex: 1, backgroundColor: "#080808", justifyContent: "center", alignItems: "center", padding: 25 },
  loadingText: { color: "#aaa", marginTop: 15, fontSize: 15 },
  errorIcon: { fontSize: 40, marginBottom: 10 },
  errorTitle: { color: "#e62429", fontSize: 28, fontWeight: "900", marginBottom: 10 },
  errorText: { color: "#aaa", textAlign: "center", fontSize: 15 },
  retryButton: { backgroundColor: "#e62429", paddingHorizontal: 25, paddingVertical: 13, borderRadius: 8, marginTop: 20 },
  retryText: { color: "#fff", fontWeight: "900" },
  emptyIcon: { fontSize: 45, marginBottom: 12 },
  emptyTitle: { color: "#fff", fontSize: 22, fontWeight: "800" },
  emptyText: { color: "#888", marginTop: 8, textAlign: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "flex-end" },
  modalContainer: { backgroundColor: "#151515", borderTopLeftRadius: 25, borderTopRightRadius: 25, maxHeight: "90%", padding: 24, borderWidth: 1, borderColor: "#292929" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalIcon: { width: 55, height: 55, borderRadius: 12, backgroundColor: "#e62429", justifyContent: "center", alignItems: "center" },
  modalIconText: { fontSize: 28 },
  closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#252525", justifyContent: "center", alignItems: "center" },
  closeText: { color: "#aaa", fontSize: 18 },
  modalTitle: { color: "#fff", fontSize: 28, fontWeight: "900", marginTop: 20 },
  modalBadges: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 15 },
  modalDanger: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 7 },
  modalBadgeText: { color: "#fff", fontSize: 10, fontWeight: "900" },
  modalStatus: { borderWidth: 1, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 7 },
  modalStatusText: { fontSize: 10, fontWeight: "900" },
  modalSection: { marginTop: 25 },
  sectionTitle: { color: "#666", fontSize: 11, fontWeight: "900", letterSpacing: 1.5, marginBottom: 10 },
  modalDescription: { color: "#ccc", fontSize: 15, lineHeight: 23 },
  detailRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#202020", padding: 14, borderRadius: 10, marginBottom: 10 },
  detailIcon: { fontSize: 22, width: 42 },
  detailLabel: { color: "#777", fontSize: 10, fontWeight: "800" },
  detailValue: { color: "#fff", fontSize: 14, marginTop: 3 },
  closeModalButton: { backgroundColor: "#e62429", paddingVertical: 15, borderRadius: 10, alignItems: "center", marginTop: 25, marginBottom: 10 },
  closeModalText: { color: "#fff", fontSize: 13, fontWeight: "900", letterSpacing: 1 },
  actionButtons: { flexDirection: "row", gap: 12, marginTop: 14 },
  editButton: { flex: 1, backgroundColor: "#3f7fd1", borderRadius: 10, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  editButtonText: { color: "#fff", fontSize: 11, fontWeight: "900", letterSpacing: 0.8 },
  deleteButton: { flex: 1, backgroundColor: "#e62429", borderRadius: 10, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  deleteButtonText: { color: "#fff", fontSize: 11, fontWeight: "900", letterSpacing: 0.8 },
  createButton: { position: "absolute", bottom: 30, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: "#e62429", justifyContent: "center", alignItems: "center", elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
});
