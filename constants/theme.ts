// Shared design tokens for Marvel Manager (mobile).
// Mirrors the palette and motifs used on the web dashboard so every
// screen — Home, Heroes, Misiones, Favoritos — stays consistent.

export const colors = {
  bg: "#0a0a0c",
  panel: "#141416",
  panelBorder: "#26262a",

  ink: "#0b0b0d",
  red: "#e62429",
  redSoft: "rgba(230, 36, 41, 0.14)",

  blue: "#3f7fd1",
  blueSoft: "rgba(63, 127, 209, 0.14)",

  gold: "#e0a730",
  goldSoft: "rgba(224, 167, 48, 0.14)",

  green: "#2fbf71",
  greenSoft: "rgba(47, 191, 113, 0.14)",

  text: "#f5f5f6",
  textMuted: "#8a8a90",
  textFaint: "#57575d",
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;

// Consistent offset used by the "hard shadow" card effect across the app.
export const shadowOffset = 6;
