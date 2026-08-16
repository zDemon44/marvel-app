import { Tabs } from "expo-router";
import React from "react";
import { Text } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#e62429",
        tabBarInactiveTintColor: "#777",

        tabBarStyle: {
          backgroundColor: "#0d0d0d",
          borderTopColor: "#292929",
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 8,
          paddingTop: 7,
        },

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "800",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 22 }}>⌂</Text>
          ),
        }}
      />

      <Tabs.Screen
        name="heroes"
        options={{
          title: "Héroes",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 22 }}>★</Text>
          ),
        }}
      />

      <Tabs.Screen
        name="misiones"
        options={{
          title: "Misiones",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 22 }}>◆</Text>
          ),
        }}
      />

      <Tabs.Screen
        name="favoritos"
        options={{
          title: "Favoritos",
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 22 }}>♥</Text>
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