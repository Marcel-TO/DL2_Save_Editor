import "./App.css";
import { useEffect, useState } from "react";
import { Route, Router, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import { SettingsManager } from 'tauri-settings';
import { SettingsSchema } from "./models/settings-schema";

import { MainPage } from "./pages/main/main-page";
import { SkillPage } from "./pages/skills/skill-page";
import { ExperiencePage } from "./pages/experience/experience-page";
import { InventoryPage } from "./pages/inventory/inventory-page";
import { BackpackPage } from "./pages/backpack/backpack-page";
import { CampaignPage } from "./pages/campaign/campaign-page";
import { PlayerPage } from "./pages/player/player-page";
import { IDsPage } from "./pages/ids/ids-page";
import { InfoPage } from "./pages/info/info-page";
import { Background } from "./components/background/background";
import { IdData, SaveFile } from "./models/save-models";
import { UnlockablePage } from "./pages/unlockable/unlockable-page";
import { CazOutpostPage } from "./pages/caz-outpost/caz-outpost";
import { CazCollectionPage } from "./pages/caz-collection/caz-collection";
import { KnowledgeVaultPage } from "./pages/knowledge-vault/knowledge-vault";
import { SettingsPage } from "./pages/settings/settings-page";
import { DebugPage } from "./pages/debug/debug-page";
import { StartPage } from "./pages/start/start-page";
import { RedirectPage } from "./pages/redirect/redirect-page";

function App() {
  const [idDatas, setCurrentIdDatas] = useState<IdData[]>([])
  const [currentSaveFile, setCurrentSaveFile] = useState<SaveFile>();
  const [redirectPath, setRedirectPath] = useState('/');
  const settingsManager = new SettingsManager<SettingsSchema>(
    { // defaults
        theme: 'light',
        startFullscreen: true,
        debugMode: false,
        isNewToEditor: true
    },
    { // options
        fileName: 'customization-settings'
    }
  );

  // checks whether the settings file exists and created it if not
  // loads the settings if it exists
  settingsManager.initialize();

  const router = createBrowserRouter(
    createRoutesFromElements(
      [
        (<Route path={'/'} element={<StartPage settingsManager={settingsManager} redirectPath={redirectPath} setRedirectPath={setRedirectPath}/>}></Route>),
        (<Route path={'/redirect'} element={<RedirectPage navigateTo={redirectPath}/>}></Route>),
        (<Route path={'/main'} element={<MainPage currentSaveFile={currentSaveFile} setCurrentSaveFile={setCurrentSaveFile} setIdData={setCurrentIdDatas} settingsManager={settingsManager}/>}></Route>),
        (<Route path={'/skills'} element={<SkillPage currentSaveFile={currentSaveFile} setCurrentSaveFile={setCurrentSaveFile} settingsManager={settingsManager}/>}></Route>),
        (<Route path={'/unlockables'} element={<UnlockablePage currentSaveFile={currentSaveFile} settingsManager={settingsManager}/>}></Route>),
        (<Route path={'/experience'} element={<ExperiencePage settingsManager={settingsManager}/>}></Route>),
        (<Route path={'/inventory'} element={<InventoryPage currentSaveFile={currentSaveFile} setCurrentSaveFile={setCurrentSaveFile} idDatas={idDatas} settingsManager={settingsManager}/>}></Route>),
        (<Route path={'/backpack'} element={<BackpackPage settingsManager={settingsManager}/>}></Route>),
        (<Route path={'/campaign'} element={<CampaignPage settingsManager={settingsManager}/>}></Route>),
        (<Route path={'/player'} element={<PlayerPage settingsManager={settingsManager}/>}></Route>),
        (<Route path={'/ids'} element={<IDsPage idData={idDatas} settingsManager={settingsManager}/>}></Route>),
        (<Route path={'/info'} element={<InfoPage settingsManager={settingsManager}/>}></Route>),
        (<Route path={'/outpost'} element={<CazOutpostPage settingsManager={settingsManager}/>}></Route>),
        (<Route path={'/caz-collection'} element={<CazCollectionPage settingsManager={settingsManager}/>}></Route>),
        (<Route path={'/knowledge-vault'} element={<KnowledgeVaultPage settingsManager={settingsManager}/>}></Route>),
        (<Route path={'/settings'} element={<SettingsPage settingsManager={settingsManager}/>}></Route>),
        (<Route path={'/debug'} element={<DebugPage settingsManager={settingsManager}/>}></Route>),
      ]
    )
  )
  
  return (
    <>
      <Background/>
      <RouterProvider router={router}></RouterProvider>
    </>
  );
}

export default App;