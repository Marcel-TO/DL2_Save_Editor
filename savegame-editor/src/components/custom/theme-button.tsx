import { Moon, PaintBucket, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/ui/theme-provider"
import { Separator } from "@/components/ui/separator"

export function ThemeModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="transition-all">
          {theme === 'light' && <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />}
          {theme === 'dark' && <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />}
          {theme === 'dl2' && <PaintBucket className="h-[1.2rem] w-[1.2rem] transition-all" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
        <Separator />
        <DropdownMenuItem onClick={() => setTheme("dl2")}>
          DL2
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
