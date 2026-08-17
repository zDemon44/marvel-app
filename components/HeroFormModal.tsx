import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radii } from "@/constants/theme";
import { DEFAULT_HERO_IMAGE } from "@/constants/media";
import { Input, Tag, HardShadowCard } from "./UI";
import api from "@/services/api";

interface Heroe {
  id?: number;
  nombre: string;
  nombre_real: string;
  poder_principal: string;
  nivel_poder: number;
  imagen_url?: string | null;
  estado: "ACTIVO" | "INACTIVO";
}

interface HeroFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  heroe?: Heroe | null;
}

export default function HeroFormModal({
  visible,
  onClose,
  onSuccess,
  heroe,
}: HeroFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Heroe>({
    nombre: "",
    nombre_real: "",
    poder_principal: "",
    nivel_poder: 50,
    imagen_url: "",
    estado: "ACTIVO",
  });

  useEffect(() => {
    if (heroe) {
      setFormData(heroe);
    } else {
      resetForm();
    }
  }, [heroe, visible]);

  const resetForm = () => {
    setFormData({
      nombre: "",
      nombre_real: "",
      poder_principal: "",
      nivel_poder: 50,
      imagen_url: "",
      estado: "ACTIVO",
    });
  };

  const handleSubmit = async () => {
    if (
      !formData.nombre ||
      !formData.nombre_real ||
      !formData.poder_principal
    ) {
      Alert.alert("Error", "Por favor completa todos los campos obligatorios");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        nombre: formData.nombre,
        nombre_real: formData.nombre_real,
        poder_principal: formData.poder_principal,
        nivel_poder: formData.nivel_poder,
        // Si no cargó una URL, guardamos la imagen por defecto en vez de
        // null, así el héroe nunca queda sin foto en ningún lado de la app.
        imagen_url: formData.imagen_url?.trim() || DEFAULT_HERO_IMAGE,
        estado: formData.estado,
      };

      if (heroe?.id) {
        // Actualizar
        await api.put(`/heroes/${heroe.id}`, payload);
        Alert.alert("Éxito", "Superhéroe actualizado correctamente");
      } else {
        // Crear
        await api.post("/heroes", payload);
        Alert.alert("Éxito", "Superhéroe creado correctamente");
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "No se pudo guardar el superhéroe"
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
                <Tag tone="red">{heroe ? "EDITAR" : "NUEVO"}</Tag>
                <Text style={styles.title}>
                  {heroe ? "Editar Superhéroe" : "Nuevo Superhéroe"}
                </Text>
                <Pressable
                  style={styles.closeButton}
                  onPress={onClose}
                  disabled={loading}
                >
                  <Feather name="x" size={24} color={colors.text} />
                </Pressable>
              </View>

              {/* PREVIEW DE IMAGEN */}
              <View style={styles.previewWrap}>
                <Image
                  source={{
                    uri: formData.imagen_url?.trim() || DEFAULT_HERO_IMAGE,
                  }}
                  style={styles.previewImage}
                />

                {!formData.imagen_url?.trim() && (
                  <View style={styles.previewBadge}>
                    <Feather name="image" size={11} color={colors.text} />
                    <Text style={styles.previewBadgeText}>
                      IMAGEN POR DEFECTO
                    </Text>
                  </View>
                )}
              </View>

              {/* FORMULARIO */}
              <View style={styles.formGroup}>
                <Input
                  label="Nombre"
                  icon="shield"
                  placeholder="Ej: Spider-Man"
                  value={formData.nombre}
                  onChangeText={(text) =>
                    setFormData({ ...formData, nombre: text })
                  }
                  editable={!loading}
                />
              </View>

              <View style={styles.formGroup}>
                <Input
                  label="Nombre Real"
                  icon="user"
                  placeholder="Ej: Peter Parker"
                  value={formData.nombre_real}
                  onChangeText={(text) =>
                    setFormData({ ...formData, nombre_real: text })
                  }
                  editable={!loading}
                />
              </View>

              <View style={styles.formGroup}>
                <Input
                  label="Poder Principal"
                  icon="zap"
                  placeholder="Ej: Agilidad"
                  value={formData.poder_principal}
                  onChangeText={(text) =>
                    setFormData({ ...formData, poder_principal: text })
                  }
                  editable={!loading}
                />
              </View>

              <View style={styles.formGroup}>
                <Input
                  label="URL de Imagen (opcional)"
                  icon="image"
                  placeholder="https://..."
                  value={formData.imagen_url || ""}
                  onChangeText={(text) =>
                    setFormData({ ...formData, imagen_url: text })
                  }
                  editable={!loading}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* NIVEL DE PODER */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Nivel de Poder: {formData.nivel_poder}
                </Text>
                <View style={styles.powerSlider}>
                  {[10, 25, 50, 75, 90].map((val) => (
                    <Pressable
                      key={val}
                      style={[
                        styles.powerButton,
                        formData.nivel_poder === val &&
                          styles.powerButtonActive,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, nivel_poder: val })
                      }
                      disabled={loading}
                    >
                      <Text
                        style={[
                          styles.powerButtonText,
                          formData.nivel_poder === val &&
                            styles.powerButtonTextActive,
                        ]}
                      >
                        {val}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* ESTADO */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Estado</Text>
                <View style={styles.stateButtons}>
                  {(["ACTIVO", "INACTIVO"] as const).map((estado) => (
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
                        {estado}
                      </Text>
                    </Pressable>
                  ))}
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
                      {heroe ? "Actualizar" : "Crear"}
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

  previewWrap: {
    width: "100%",
    height: 150,
    borderRadius: radii.lg,
    overflow: "hidden",
    backgroundColor: colors.ink,
    borderWidth: 1.5,
    borderColor: colors.panelBorder,
    marginBottom: 20,
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  previewBadge: {
    position: "absolute",
    left: 10,
    bottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(11, 11, 13, 0.75)",
    borderWidth: 1,
    borderColor: colors.panelBorder,
    borderRadius: radii.sm,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  previewBadgeText: {
    color: colors.text,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
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
  powerSlider: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  powerButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.panelBorder,
    backgroundColor: colors.panel,
    alignItems: "center",
    justifyContent: "center",
  },
  powerButtonActive: {
    backgroundColor: colors.red,
    borderColor: colors.red,
  },
  powerButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
  },
  powerButtonTextActive: {
    color: "#fff",
  },
  stateButtons: {
    flexDirection: "row",
    gap: 12,
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
    fontSize: 12,
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