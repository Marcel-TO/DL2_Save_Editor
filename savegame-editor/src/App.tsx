import "./App.css";
import { useState } from "react";
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import { SettingsManager } from 'tauri-settings';

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
import { SettingsSchema } from "./models/settings-schema";
import { DebugConsole } from "./components/debug-console/debug-console";

function App() {
  const [idDatas, setCurrentIdDatas] = useState<IdData[]>([])
  const [currentSaveFile, setCurrentSaveFile] = useState<SaveFile>();

  const settingsManager = new SettingsManager<SettingsSchema>(
  { // defaults
      theme: 'light',
      startFullscreen: true,
      debugMode: false
  },
  { // options
      fileName: 'customization-settings'
  })

  // checks whether the settings file exists and created it if not
  // loads the settings if it exists
  settingsManager.initialize();

  const router = createBrowserRouter(
    createRoutesFromElements(
      [
        (<Route path={'/'} element={<MainPage currentSaveFile={currentSaveFile} setCurrentSaveFile={setCurrentSaveFile} setIdData={setCurrentIdDatas}/>}></Route>),
        (<Route path={'/skills'} element={<SkillPage currentSaveFile={currentSaveFile} setCurrentSaveFile={setCurrentSaveFile}/>}></Route>),
        (<Route path={'/unlockables'} element={<UnlockablePage currentSaveFile={currentSaveFile}/>}></Route>),
        (<Route path={'/experience'} element={<ExperiencePage/>}></Route>),
        (<Route path={'/inventory'} element={<InventoryPage currentSaveFile={currentSaveFile} setCurrentSaveFile={setCurrentSaveFile} idDatas={idDatas}/>}></Route>),
        (<Route path={'/backpack'} element={<BackpackPage/>}></Route>),
        (<Route path={'/campaign'} element={<CampaignPage/>}></Route>),
        (<Route path={'/player'} element={<PlayerPage/>}></Route>),
        (<Route path={'/ids'} element={<IDsPage idData={idDatas}/>}></Route>),
        (<Route path={'/info'} element={<InfoPage/>}></Route>),
        (<Route path={'/outpost'} element={<CazOutpostPage/>}></Route>),
        (<Route path={'/caz-collection'} element={<CazCollectionPage/>}></Route>),
        (<Route path={'/knowledge-vault'} element={<KnowledgeVaultPage/>}></Route>),
        (<Route path={'/settings'} element={<SettingsPage settingsManager={settingsManager}/>}></Route>),
      ]
    )
  )

  return (
    <>
      <Background/>
      <DebugConsole/>
      {/* <RouterProvider router={router}></RouterProvider> */}
    </>
  );
}

export default App;


// // Base Tauri Return
// <div className="container">
//       <h1>Welcome to Tauri!</h1>

//       <div className="row">
//         <a href="https://vitejs.dev" target="_blank">
//           <img src="/vite.svg" className="logo vite" alt="Vite logo" />
//         </a>
//         <a href="https://tauri.app" target="_blank">
//           <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
//         </a>
//         <a href="https://reactjs.org" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>

//       <p>Click on the Tauri, Vite, and React logos to learn more.</p>

//       <form
//         className="row"
//         onSubmit={(e) => {
//           e.preventDefault();
//           greet();
//         }}
//       >
//         <input
//           id="greet-input"
//           onChange={(e) => setName(e.currentTarget.value)}
//           placeholder="Enter a name..."
//         />
//         <button type="submit">Greet</button>
//       </form>

//       <p>{greetMsg}</p>
//     </div>