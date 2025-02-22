import { AppSettings } from "@/models/settings-model"
import { createContext, useContext, useEffect, useState } from "react"
import { Store } from "@tauri-apps/plugin-store"

export type Theme = "dark" | "light" | "system" | "dl2" | "spooked" | "skyfall" | "hope" | "mchawk" | "batang" | "beast"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  appSettings: AppSettings
  settingsManager: Store | undefined
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "dl2",
  storageKey = "vite-ui-theme",
  appSettings,
  settingsManager,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => appSettings.theme.value || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark", "dl2", "spooked", "skyfall", "hope", "mchawk", "batang", "beast")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      if (settingsManager) {
        settingsManager.set(storageKey, { value: theme })
      }
      appSettings.theme.setValue(theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const getTheme = (appSettings: AppSettings) => {
  return appSettings.theme.value
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
