import { Biohazard, Droplet, Ghost, Moon, PawPrint, Sparkle, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ui/theme-provider";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

export function ThemeModeToggle() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="transition-all">
          {theme === "light" && (
            <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
          )}
          {theme === "dark" && (
            <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
          )}
          {theme === "dl2" && (
            <Biohazard className="h-[1.2rem] w-[1.2rem] transition-all" />
          )}
          {theme === "spooked" && (
            <Ghost className="h-[1.2rem] w-[1.2rem] transition-all" />
          )}
          {theme === "skyfall" && (
            <Droplet className="h-[1.2rem] w-[1.2rem] transition-all" />
          )}
          {theme === "hope" && (
            <Sparkle className="h-[1.2rem] w-[1.2rem] transition-all" />
          )}
          {theme === "beast" && (
            <PawPrint className="h-[1.2rem] w-[1.2rem] transition-all" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Background</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              setTheme("dl2");
              navigate("/main");
            }}
            className={`${theme === "dl2" ? "bg-muted" : "bg-transparent"} p-2`}
          >
            DL2
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setTheme("spooked");
              navigate("/main");
            }}
            className={`${
              theme === "spooked" ? "bg-muted" : "bg-transparent"
            } p-2`}
          >
            Spooked
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setTheme("skyfall");
              navigate("/main");
            }}
            className={`${
              theme === "skyfall" ? "bg-muted" : "bg-transparent"
            } p-2`}
          >
            Skyfall
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setTheme("hope");
              navigate("/main");
            }}
            className={`${
              theme === "hope" ? "bg-muted" : "bg-transparent"
            } p-2`}
          >
            Hope
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setTheme("beast");
              navigate("/main");
            }}
            className={`${
              theme === "beast" ? "bg-muted" : "bg-transparent"
            } p-2`}
          >
            Beast
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <Separator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Simple</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              setTheme("light");
              navigate("/main");
            }}
            className={`${
              theme === "light" ? "bg-muted/70" : "bg-transparent"
            } p-2`}
          >
            Light
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setTheme("dark");
              navigate("/main");
            }}
            className={`${
              theme === "dark" ? "bg-muted" : "bg-transparent"
            } p-2`}
          >
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setTheme("system");
              navigate("/main");
            }}
            className={`${
              theme === "system" ? "bg-muted" : "bg-transparent"
            } p-2`}
          >
            System
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
