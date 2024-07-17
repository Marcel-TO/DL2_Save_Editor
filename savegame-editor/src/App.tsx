import "./App.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import { MainPage } from "./pages/main-page";
import { LandingPage } from "./pages/landing-page";
import { useState } from "react";
import { SaveFile } from "./models/save-models";
import { SettingsPage } from "./pages/settings-page";
import { AppSettings, SettingState } from "./models/settings-model";

function App() {
  // Declare all app settings
  console.log();
  const [crcValue, setCrcValue] = useState<boolean>(
      (JSON.parse(localStorage.getItem("crc-check-settings") ?? "false") === true) || false
  );
  const [gameFolderPath, setGameFolderPath] = useState<string>(
    (localStorage.getItem("game-folder-settings") as unknown as string) || ""
  );
  const [isDebugging, setIsDebugging] = useState<boolean>(
    (JSON.parse(localStorage.getItem("debug-settings") ?? "false") === true) || false
  );
  const [hasAutomaticBackup, setHasAutomaticBackup] = useState<boolean>(
    (JSON.parse(localStorage.getItem("backup-settings") ?? "false") === true) || false
  );

  const appSettings: AppSettings = {
    crc: {
      value: crcValue,
      setValue: setCrcValue,
      storageKey: "crc-check-settings",
    },
    gameFolderPath: {
      value: gameFolderPath,
      setValue: setGameFolderPath,
      storageKey: "game-folder-settings",
    },
    isDebugging: {
      value: isDebugging,
      setValue: setIsDebugging,
      storageKey: "debug-settings",

    },
    hasAutomaticBackup: {
      value: hasAutomaticBackup,
      setValue: setHasAutomaticBackup,
      storageKey: "backup-settings",
    },
  };

  // Declare savefile state
  const [currentSaveFileValue, setCurrentSaveFile] = useState<SaveFile>();
  const currentSaveFile: SettingState<SaveFile | undefined> = {
    value: currentSaveFileValue,
    setValue: setCurrentSaveFile,
  };

  
  const router = createBrowserRouter(
    createRoutesFromElements(
      [
        // (<Route path={'/'} element={<LandingPage />}></Route>),
        (<Route path={'/'} element={<MainPage appSettings={appSettings} currentSaveFile={currentSaveFile}/>}></Route>),
        (<Route path={'/settings'} element={<SettingsPage appSettings={appSettings}/>}></Route>),
      ]
    )
  )

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <RouterProvider router={router}></RouterProvider> 
    </ThemeProvider>
  );
}

export default App;
