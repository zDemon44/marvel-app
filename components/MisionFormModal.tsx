import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radii } from "@/constants/theme";
import { Input, Tag, HardShadowCard } from "./UI";
import api from "@/services/api";

interface Heroe {
  id: number;
  nombre: string;
}

interface Mision {
  id?: number;
  titulo: string;
  descripcion: string;
  ubicacion: string;
  fecha: string;
  nivel_peligro: "BAJO" | "MEDIO" | "ALTO";
  estado: "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA";
  superheroe_id: number;
}

interface MisionFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mision?: Mision | null;
}

export default function MisionFormModal({
  visible,
  onClose,
  onSuccess,
  mision,
}: MisionFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [heroes, setHeroes] = useState<Heroe[]>([]);
  const [heroesLoading, setHeroesLoading] = useState(true);
  const [formData, setFormData] = useState<Mision>({
    titulo: "",
    descripcion: "",
    ubicacion: "",
    fecha: new Date().toISOString().split("T")[0],
    nivel_peligro: "MEDIO",
    estado: "PENDIENTE",
    superheroe_id: 0,
  });

  useEffect(() => {
    if (visible) {
      cargarHeroes();
    }
  }, [visible]);

  useEffect(() => {
    if (mision) {
      setFormData(mision);
    } else {
      resetForm();
    }
  }, [mision, visible]);

  const cargarHeroes = async () => {
    try {
      setHeroesLoading(true);
      const response = await api.get("/heroes");
      setHeroes(response.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setHeroesLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: "",
      descripcion: "",
      ubicacion: "",
      fecha: new Date().toISOString().split("T")[0],
      nivel_peligro: "MEDIO",
      estado: "PENDIENTE",
      superheroe_id: 0,
    });
  };

  const handleSubmit = async () => {
    if (
      !formData.titulo ||
      !formData.descripcion ||
      !formData.ubicacion ||
      !formData.superheroe_id
    ) {
      Alert.alert("Error", "Por favor completa todos los campos obligatorios");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        ubicacion: formData.ubicacion,
        fecha: formData.fecha,
        nivel_peligro: formData.nivel_peligro,
        estado: formData.estado,
        superheroe_id: formData.superheroe_id,
      };

      if (mision?.id) {
        // Actualizar
        await api.put(`/misiones/${mision.id}`, payload);
        Alert.alert("Éxito", "Misión actualizada correctamente");
      } else {
        // Crear
        await api.post("/misiones", payload);
        Alert.alert("Éxito", "Misión creada correctamente");
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "No se pudo guardar la misión"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.centeredView}>
          <HardShadowCard
            shadowColor={colors.blue}
            style={styles.modalCard}
          >
            <ScrollView
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* HEADER */}
              <View style={styles.header}>
                <Tag tone="red">{mision ? "EDITAR" : "NUEVA"}</Tag>
                <Text style={styles.title}>
                  {mision ? "Editar Misión" : "Nueva Misión"}
                </Text>
                <Pressable
                  style={styles.closeButton}
                  onPress={onClose}
                  disabled={loading}
                >
                  <Feather name="x" size={24} color={colors.text} />
                </Pressable>
              </View>

              {/* FORMULARIO */}
              <View style={styles.formGroup}>
                <Input
                  label="Título"
                  icon="target"
                  placeholder="Ej: Rescate en Nueva York"
                  value={formData.titulo}
                  onChangeText={(text) =>
                    setFormData({ ...formData, titulo: text })
                  }
                  editable={!loading}
                />
              </View>

              <View style={styles.formGroup}>
                <Input
                  label="Descripción"
                  icon="file-text"
                  placeholder="Detalla la misión..."
                  value={formData.descripcion}
                  onChangeText={(text) =>
                    setFormData({ ...formData, descripcion: text })
                  }
                  editable={!loading}
                  multiline
                />
              </View>

              <View style={styles.formGroup}>
                <Input
                  label="Ubicación"
                  icon="map-pin"
                  placeholder="Ej: Nueva York"
                  value={formData.ubicacion}
                  onChangeText={(text) =>
                    setFormData({ ...formData, ubicacion: text })
                  }
                  editable={!loading}
                />
              </View>

              <View style={styles.formGroup}>
                <Input
                  label="Fecha"
                  icon="calendar"
                  placeholder="YYYY-MM-DD"
                  value={formData.fecha}
                  onChangeText={(text) =>
                    setFormData({ ...formData, fecha: text })
                  }
                  editable={!loading}
                />
              </View>

              {/* SUPERHÉROE */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Superhéroe Asignado *</Text>
                {heroesLoading ? (
                  <View style={styles.heroesPlaceholder}>
                    <ActivityIndicator color={colors.red} size="small" />
                  </View>
                ) : (
                  <View style={styles.heroesList}>
                    {heroes.map((heroe) => (
                      <Pressable
                        key={heroe.id}
                        style={[
                          styles.heroOption,
                          formData.superheroe_id === heroe.id &&
                            styles.heroOptionActive,
                        ]}
                        onPress={() =>
                          setFormData({
                            ...formData,
                            superheroe_id: heroe.id,
                          })
                        }
                        disabled={loading}
                      >
                        <Text
                          style={[
                            styles.heroOptionText,
                            formData.superheroe_id === heroe.id &&
                              styles.heroOptionTextActive,
                          ]}
                        >
                          {heroe.nombre}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              {/* NIVEL DE PELIGRO */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nivel de Peligro</Text>
                <View style={styles.dangerButtons}>
                  {(["BAJO", "MEDIO", "ALTO"] as const).map((nivel) => (
                    <Pressable
                      key={nivel}
                      style={[
                        styles.dangerButton,
                        styles[`danger${nivel}`],
                        formData.nivel_peligro === nivel &&
                          styles.dangerButtonActive,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, nivel_peligro: nivel })
                      }
                      disabled={loading}
                    >
                      <Text
                        style={[
                          styles.dangerButtonText,
                          formData.nivel_peligro === nivel &&
                            styles.dangerButtonTextActive,
                        ]}
                      >
                        {nivel}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* ESTADO */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Estado</Text>
                <View style={styles.stateButtons}>
                  {(["PENDIENTE", "EN_PROGRESO", "COMPLETADA"] as const).map(
                    (estado) => (
                      <Pressable
                        key={estado}
                        style={[
                          styles.stateButton,
                          formData.estado === estado &&
                            styles.stateButtonActive,
                        ]}
                        onPress={() =>
                          setFormData({ ...formData, estado })
                        }
                        disabled={loading}
                      >
                        <Text
                          style={[
                            styles.stateButtonText,
                            formData.estado === estado &&
                              styles.stateButtonTextActive,
                          ]}
                        >
                          {estado === "EN_PROGRESO"
                            ? "EN PROGRESO"
                            : estado}
                        </Text>
                      </Pressable>
                    )
                  )}
                </View>
              </View>

              {/* ACCIONES */}
              <View style={styles.actions}>
                <Pressable
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.button,
                    styles.submitButton,
                    loading && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {mision ? "Actualizar" : "Crear"}
                    </Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </HardShadowCard>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(11, 11, 13, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 16,
  },
  modalCard: {
    width: "100%",
    maxHeight: "90%",
  },
  modalContent: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
    marginTop: 8,
  },
  closeButton: {
    position: "absolute",
    right: 20,
    top: 20,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroesPlaceholder: {
    paddingVertical: 12,
    alignItems: "center",
  },
  heroesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  heroOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.panelBorder,
    backgroundColor: colors.panel,
  },
  heroOptionActive: {
    backgroundColor: colors.red,
    borderColor: colors.red,
  },
  heroOptionText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
  },
  heroOptionTextActive: {
    color: "#fff",
  },
  dangerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  dangerButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.panelBorder,
    backgroundColor: colors.panel,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerBtnAJO: {
    borderColor: colors.greenSoft,
  },
  dangerMEDIO: {
    borderColor: colors.goldSoft,
  },
  dangerALTO: {
    borderColor: colors.redSoft,
  },
  dangerButtonActive: {
    borderColor: "transparent",
  },
  dangerButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
  },
  dangerButtonTextActive: {
    color: "#fff",
  },
  stateButtons: {
    flexDirection: "row",
    gap: 8,
  },
  stateButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.panelBorder,
    backgroundColor: colors.panel,
    alignItems: "center",
    justifyContent: "center",
  },
  stateButtonActive: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  stateButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
  },
  stateButtonTextActive: {
    color: "#fff",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: colors.panel,
    borderWidth: 1.5,
    borderColor: colors.panelBorder,
  },
  submitButton: {
    backgroundColor: colors.red,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  submitButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
});
