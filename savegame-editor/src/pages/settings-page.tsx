import { CircleUser, HelpCircle, Menu, Package2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import { NavbarComponent } from "@/components/custom/custom-navbar-component";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const SettingsPage = () => {
  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <NavbarComponent />
        <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
          <div className="mx-auto grid w-full max-w-6xl gap-2">
            <h1 className="text-3xl font-semibold">Settings</h1>
          </div>
          <div className="mx-auto grid w-full max-w-6xl gap-2">
            <Card x-chunk="dashboard-04-chunk-2">
              <CardHeader>
                <div className="relative">
                <CardTitle>DL2 Game Folder</CardTitle>
                <CardDescription>
                  The path where Dying Light 2 Game is installed.
                </CardDescription>
                <TooltipProvider>

                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="absolute top-0 right-0 w-6 h-6 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">
                      Due to a collaboration with @EricPlayZ, we are able to provide a way to bypass the CRC check. This will allow you to use and modify PC save files as well. The editor will deploy a .dll file to the game folder to bypass the CRC check.
                    </p>
                  </TooltipContent>
                </Tooltip>
                </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent>
                <form className="flex flex-col gap-4">
                  <Input
                    placeholder="File path"
                    defaultValue="/fullpath/where/game/is/installed"
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox id="CRC" defaultChecked />
                    <label
                      htmlFor="CRC"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Allow to bypass CRC check.
                    </label>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button>Save</Button>
              </CardFooter>
            </Card>
            </div>
        </main>
      </div>
    </>
  );
};
