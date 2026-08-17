import { Tabs } from "expo-router";
import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/theme";

function TabIcon({
  focused,
  children,
}: {
  focused: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.iconPill, focused && styles.iconPillActive]}>
      {children}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: colors.red,
        tabBarInactiveTintColor: colors.textMuted,

        tabBarStyle: {
          backgroundColor: colors.ink,
          borderTopColor: colors.panelBorder,
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 10,
          paddingTop: 8,
        },

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "800",
          letterSpacing: 0.3,
        },
      }}
    >
    <Tabs.Screen
      name="home"
      options={{
        title: "Inicio",
        tabBarIcon: ({ color, focused }) => (
          <TabIcon focused={focused}>
            <Feather name="home" size={20} color={color} />
          </TabIcon>
        ),
      }}
    />
      <Tabs.Screen
        name="heroes"
        options={{
          title: "Héroes",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Feather name="shield" size={20} color={color} />
            </TabIcon>
          ),
        }}
      />

      <Tabs.Screen
        name="misiones"
        options={{
          title: "Misiones",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Feather name="target" size={20} color={color} />
            </TabIcon>
          ),
        }}
      />

      <Tabs.Screen
        name="favoritos"
        options={{
          title: "Favoritos",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused}>
              <Ionicons
                name={focused ? "heart" : "heart-outline"}
                size={20}
                color={color}
              />
            </TabIcon>
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconPill: {
    width: 38,
    height: 30,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  iconPillActive: {
    backgroundColor: colors.redSoft,
  },
});
