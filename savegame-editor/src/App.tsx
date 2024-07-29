import "./App.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import { MainPage } from "./pages/main-page";
import { InfoPage } from "./pages/info-page";
import { useState } from "react";
import { SaveFile } from "./models/save-models";
import { SettingsPage } from "./pages/settings-page";
import { AppSettings, SettingState } from "./models/settings-model";
import { SkillsPage } from "./pages/skills-page";
import { InventoryPage } from "./pages/inventory-page";
import { UnlockablesPage } from "./pages/unlockables-page";
import { BackpackPage } from "./pages/backpack-page";
import { CampaignPage } from "./pages/campaign-page";
import { IDsPage } from "./pages/ids-page";
import { PlayerPage } from "./pages/player-page";
import { KnowledgeVaultPage } from "./pages/knowledge-vault";

function App() {
  // Declare all app settings
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
        (<Route path={'/'} element={<MainPage appSettings={appSettings} currentSaveFile={currentSaveFile}/>}></Route>),
        (<Route path={'/settings'} element={<SettingsPage appSettings={appSettings}/>}></Route>),
        (<Route path={'/info'} element={<InfoPage/>}></Route>),
        (<Route path={'/skills'} element={<SkillsPage skills={currentSaveFileValue?.skills}/>}></Route>),
        (<Route path={'/inventory'} element={<InventoryPage item_rows={currentSaveFileValue?.items}/>}></Route>),
        (<Route path={'/unlockables'} element={<UnlockablesPage unlockables={currentSaveFileValue?.unlockable_items}/>}></Route>),
        (<Route path={'/backpack'} element={<BackpackPage/>}></Route>),
        (<Route path={'/campaign'} element={<CampaignPage/>}></Route>),
        (<Route path={'/player'} element={<PlayerPage/>}></Route>),
        (<Route path={'/ids'} element={<IDsPage/>}></Route>),
        (<Route path={'/knowledge-vault'} element={<KnowledgeVaultPage/>}></Route>),
      ]
    )
  )

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="bg-muted/40 background-image-container">
        <RouterProvider router={router}></RouterProvider> 
      </div>
    </ThemeProvider>
  );
}

export default App;
