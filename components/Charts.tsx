import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { colors } from "../constants/theme";

/**
 * Horizontal bar list — the mobile-friendly equivalent of the web
 * dashboard's vertical bar chart (recharts). One row per item, bar
 * width scaled against the largest value.
 */
export function BarList({
  data,
  color = colors.red,
}: {
  data: { label: string; value: number }[];
  color?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));

  if (data.length === 0) {
    return <Text style={styles.emptyText}>Sin misiones asignadas todavía.</Text>;
  }

  return (
    <View style={styles.barList}>
      {data.map((item) => (
        <View key={item.label}>
          <View style={styles.barLabelRow}>
            <Text style={styles.barLabel} numberOfLines={1}>
              {item.label}
            </Text>
            <Text style={styles.barValue}>{item.value}</Text>
          </View>

          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                { width: `${(item.value / max) * 100}%`, backgroundColor: color },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Donut chart built with react-native-svg — no external chart lib
 * needed. Segments are drawn as stacked stroke-dasharray arcs.
 */
export function DonutChart({
  data,
  size = 150,
  strokeWidth = 24,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, d) => sum + d.value, 0);

  let cumulative = 0;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          {total === 0 ? (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.panelBorder}
              strokeWidth={strokeWidth}
              fill="none"
            />
          ) : (
            data.map((segment) => {
              if (segment.value === 0) return null;

              const segmentLength = (segment.value / total) * circumference;
              const dashArray = `${segmentLength} ${circumference - segmentLength}`;
              const dashOffset = -cumulative;
              cumulative += segmentLength;

              return (
                <Circle
                  key={segment.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="butt"
                  fill="none"
                />
              );
            })
          )}
        </G>
      </Svg>

      <View style={styles.donutCenter} pointerEvents="none">
        <Text style={styles.donutTotal}>{total}</Text>
        <Text style={styles.donutLabel}>TOTAL</Text>
      </View>
    </View>
  );
}

export function ChartLegend({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  return (
    <View style={styles.legend}>
      {data.map((item) => (
        <View key={item.label} style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: item.color }]} />
          <Text style={styles.legendLabel}>{item.label}</Text>
          <Text style={styles.legendValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  barList: {
    gap: 16,
  },
  barLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  barLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
    flexShrink: 1,
    marginRight: 8,
  },
  barValue: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  barTrack: {
    height: 10,
    borderRadius: 6,
    backgroundColor: colors.ink,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 6,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    fontStyle: "italic",
  },

  donutCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  donutTotal: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "900",
  },
  donutLabel: {
    color: colors.textFaint,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 2,
  },

  legend: {
    marginTop: 18,
    gap: 8,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 8,
  },
  legendLabel: {
    color: colors.textMuted,
    fontSize: 12.5,
    flex: 1,
  },
  legendValue: {
    color: colors.text,
    fontSize: 12.5,
    fontWeight: "800",
  },
});
