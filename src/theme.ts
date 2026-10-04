/** Design tokens, mirrored from shortmentFE `src/index.css` `@theme`. Use these, not raw hex. */
export const colors = {
  brand: "#4c4989",
  brandHover: "#3d3a73",
  brandDark: "#2e2b5c",
  brandSoft: "#f1f0fa",
  accent: "#f6d9a8",
  ink: "#2b3f58",
  muted: "#64748b",
  subtle: "#94a3b8",
  line: "#e5e7ee",
  surface: "#ffffff",
  canvas: "#f8f8fc",
  danger: "#d14343",
  dangerSoft: "#fdecec",
  success: "#2f855a",
  successSoft: "#e8f5ee",
  warning: "#b7791f",
  warningSoft: "#fdf6e7",
} as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const font = {
  size: { xs: 12, sm: 14, md: 16, lg: 18, xl: 22, xxl: 28 },
  weight: { regular: "400", medium: "500", semibold: "600", bold: "700" },
} as const;

/** Card elevation (shadow-card in the web app). */
export const shadow = {
  card: {
    shadowColor: "#101828",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  raised: {
    shadowColor: "#101828",
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} as const;
