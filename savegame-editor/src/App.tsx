import "./App.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import { MainPage } from "./pages/main-page";
import { LandingPage } from "./pages/landing-page";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      [
        // (<Route path={'/'} element={<LandingPage />}></Route>),
        (<Route path={'/'} element={<MainPage />}></Route>),
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
