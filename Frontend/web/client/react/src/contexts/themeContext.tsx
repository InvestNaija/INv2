import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { ThemeMode, ThemeModeContextValue } from "../models/themeModel";

export type { ThemeMode, ThemeModeContextValue };

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(
  undefined
);

const STORAGE_KEY = "theme-mode";

const getInitialMode = (): ThemeMode => {
  return "light";
};

const ThemeModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>("light");

  // Toggling the `dark` class on <html> is what drives both the Tailwind
  // `dark:` variant (see the `@custom-variant dark` rule in App.css) and the
  // semantic CSS-variable overrides defined under `.dark` in App.css.
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem(STORAGE_KEY, "light");
  }, []);

  const toggleMode = () =>
    setMode("light");

  // Keeps MUI components (Dialog, Drawer, Menu, DatePicker, etc.) in sync
  // with the same mode, since they don't read Tailwind's `dark:` variant.
  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "dark"
            ? { background: { default: "#121212", paper: "#1E1E1E" } }
            : { background: { default: "#FFFFFF", paper: "#FFFFFF" } }),
        },
      }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within a ThemeModeProvider");
  }
  return context;
}

export default ThemeModeProvider;
