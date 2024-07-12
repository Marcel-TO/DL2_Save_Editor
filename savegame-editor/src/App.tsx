import "./App.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import { MainPage } from "./pages/main-page";
import { LandingPage } from "./pages/landing-page";
import { useState } from "react";
import { SaveFile } from "./models/save-models";
import { SettingsPage } from "./pages/settings-page";

function App() {
  const [currentSaveFile, setCurrentSaveFile] = useState<SaveFile>();
  
  const router = createBrowserRouter(
    createRoutesFromElements(
      [
        // (<Route path={'/'} element={<LandingPage />}></Route>),
        (<Route path={'/'} element={<MainPage currentSaveFile={currentSaveFile}/>}></Route>),
        (<Route path={'/settings'} element={<SettingsPage />}></Route>),
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
