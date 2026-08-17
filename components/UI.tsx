import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors, radii, shadowOffset } from "../constants/theme";

export type FeatherName = React.ComponentProps<typeof Feather>["name"];

/**
 * Small skewed label — the same -8deg skew used on the web sidebar's
 * brand box and the dashboard's eyebrow tags. Reused everywhere a
 * short uppercase label is needed (section tags, status pills, etc).
 */
export function Tag({
  children,
  tone = "dark",
  style,
}: {
  children: React.ReactNode;
  tone?: "dark" | "red";
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        styles.tag,
        tone === "red" ? styles.tagRed : styles.tagDark,
        style,
      ]}
    >
      <Text style={styles.tagText}>{children}</Text>
    </View>
  );
}

/**
 * Card with a flat offset "hard shadow" behind it — the mobile
 * equivalent of the web dashboard's comic-panel drop shadow. Works
 * as a static card, or pass onPress to make it a pressable row that
 * settles into its shadow on press.
 */
export function HardShadowCard({
  children,
  onPress,
  shadowColor = colors.red,
  style,
  contentStyle,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  shadowColor?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const card = (pressed?: boolean) => (
    <View
      style={[
        styles.card,
        contentStyle,
        pressed && {
          transform: [
            { translateX: shadowOffset - 2 },
            { translateY: shadowOffset - 2 },
          ],
        },
      ]}
    >
      {children}
    </View>
  );

  return (
    <View style={[styles.shadowWrap, style]}>
      <View style={[styles.shadowLayer, { backgroundColor: shadowColor }]} />

      {onPress ? (
        <Pressable onPress={onPress}>
          {({ pressed }) => card(pressed)}
        </Pressable>
      ) : (
        card(false)
      )}
    </View>
  );
}

/**
 * Themed text input — dark panel, left icon, optional right icon
 * (used for the password show/hide toggle), red border on focus.
 */
export function Input({
  label,
  icon,
  rightIcon,
  onRightIconPress,
  style,
  ...textInputProps
}: {
  label?: string;
  icon?: FeatherName;
  rightIcon?: FeatherName;
  onRightIconPress?: () => void;
  style?: StyleProp<ViewStyle>;
} & TextInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={style}>
      {!!label && <Text style={styles.inputLabel}>{label}</Text>}

      <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
        {!!icon && (
          <Feather
            name={icon}
            size={16}
            color={focused ? colors.red : colors.textFaint}
            style={styles.inputIcon}
          />
        )}

        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textFaint}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...textInputProps}
        />

        {!!rightIcon && (
          <Pressable onPress={onRightIconPress} hitSlop={10}>
            <Feather name={rightIcon} size={16} color={colors.textFaint} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3,
    transform: [{ skewX: "-8deg" }],
  },
  tagDark: {
    backgroundColor: colors.ink,
    borderWidth: 1,
    borderColor: colors.panelBorder,
  },
  tagRed: {
    backgroundColor: colors.red,
  },
  tagText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    transform: [{ skewX: "8deg" }],
  },

  shadowWrap: {
    position: "relative",
  },
  shadowLayer: {
    position: "absolute",
    top: shadowOffset,
    left: shadowOffset,
    width: "100%",
    height: "100%",
    borderRadius: radii.lg,
  },
  card: {
    backgroundColor: colors.panel,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.panelBorder,
  },

  inputLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ink,
    borderWidth: 1.5,
    borderColor: colors.panelBorder,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
  },
  inputWrapFocused: {
    borderColor: colors.red,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: colors.text,
    paddingVertical: 14,
    fontSize: 15,
  },
});