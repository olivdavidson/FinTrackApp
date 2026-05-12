export const colors = {
  bg: "#0A0F1E",
  bg2: "#111827",
  bg3: "#1A2235",
  card: "#1E2A3A",
  card2: "#243040",
  border: "rgba(255,255,255,0.08)",
  accent: "#4FFFB0",
  accent2: "#3EE8A0",
  accentBg: "rgba(79,255,176,0.12)",
  text: "#F0F4FF",
  text2: "#8899AA",
  text3: "#556677",
  red: "#FF5C7A",
  redBg: "rgba(255,92,122,0.15)",
  blue: "#5B9EFF",
  blueBg: "rgba(91,158,255,0.15)",
  amber: "#FFCA5C",
  amberBg: "rgba(255,202,92,0.15)",
  purple: "#A78BFA",
  purpleBg: "rgba(167,139,250,0.15)",
  teal: "#5DCAA5",
  pink: "#FF9EAA",
  white: "#FFFFFF",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: "600" as const,
    color: colors.text,
    letterSpacing: -0.5,
  },
  h2: { fontSize: 22, fontWeight: "600" as const, color: colors.text },
  h3: { fontSize: 18, fontWeight: "600" as const, color: colors.text },
  h4: { fontSize: 16, fontWeight: "600" as const, color: colors.text },
  body: { fontSize: 14, fontWeight: "400" as const, color: colors.text },
  bodyMd: { fontSize: 15, fontWeight: "500" as const, color: colors.text },
  caption: { fontSize: 12, fontWeight: "400" as const, color: colors.text2 },
  label: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: colors.text3,
    letterSpacing: 0.6,
    textTransform: "uppercase" as const,
  },
  mono: {
    fontFamily: "Courier New",
    fontWeight: "400" as const,
    color: colors.text,
  },
};

export const shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};
