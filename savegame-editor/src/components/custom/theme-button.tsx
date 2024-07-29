import { Droplet, Ghost, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/ui/theme-provider"
import { Separator } from "@/components/ui/separator"
import { useNavigate } from "react-router-dom"

export function ThemeModeToggle() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="transition-all">
          {theme === 'light' && <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />}
          {theme === 'dark' && <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />}
          {theme === 'dl2' && <Droplet className="h-[1.2rem] w-[1.2rem] transition-all" />}
          {theme === 'spooked' && <Ghost className="h-[1.2rem] w-[1.2rem] transition-all" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem  
          onClick={() => {
            setTheme("light")
            navigate('/')
          }}
          className={`${theme === "light" ? "bg-muted/70" : "bg-transparent"} p-2`}
          >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => {
            setTheme("dark")
            navigate('/')
          }}
          className={`${theme === "dark" ? "bg-muted" : "bg-transparent"} p-2`}
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => {
            setTheme("system")
            navigate('/')
          }}
          className={`${theme === "system" ? "bg-muted" : "bg-transparent"} p-2`}
        >
          System
        </DropdownMenuItem>
        <Separator />
        <DropdownMenuItem 
          onClick={() => {
            setTheme("dl2")
            navigate('/')
          }}
          className={`${theme === "dl2" ? "bg-muted" : "bg-transparent"} p-2`}
        >
          DL2
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => {
            setTheme("spooked")
            navigate('/')
          }}
          className={`${theme === "spooked" ? "bg-muted" : "bg-transparent"} p-2`}
        >
          Spooked
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
