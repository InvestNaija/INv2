export type ThemeMode = "light" | "dark";

// Shape of the value ThemeModeContext.Provider exposes to consumers.
export interface ThemeModeContextValue {
  mode: ThemeMode;
  toggleMode: () => void;
}
