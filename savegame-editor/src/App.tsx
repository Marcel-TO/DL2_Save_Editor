import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

import { MainPage } from "./pages/main/main-page";
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import { SkillPage } from "./pages/skills/skill-page";
import { ExperiencePage } from "./pages/experience/experience-page";
import { InventoryPage } from "./pages/inventory/inventory-page";
import { BackpackPage } from "./pages/backpack/backpack-page";
import { CampaignPage } from "./pages/campaign/campaign-page";
import { PlayerPage } from "./pages/player/player-page";
import { IDsPage } from "./pages/ids/ids-page";
import { InfoPage } from "./pages/info/info-page";
import { Background } from "./components/background/background";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name }));
  }

  const router = createBrowserRouter(
    createRoutesFromElements(
      [
        (<Route path={'/'} element={<MainPage/>}></Route>),
        (<Route path={'/skills'} element={<SkillPage/>}></Route>),
        (<Route path={'/experience'} element={<ExperiencePage/>}></Route>),
        (<Route path={'/inventory'} element={<InventoryPage/>}></Route>),
        (<Route path={'/backpack'} element={<BackpackPage/>}></Route>),
        (<Route path={'/campaign'} element={<CampaignPage/>}></Route>),
        (<Route path={'/player'} element={<PlayerPage/>}></Route>),
        (<Route path={'/ids'} element={<IDsPage/>}></Route>),
        (<Route path={'/info'} element={<InfoPage/>}></Route>),
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