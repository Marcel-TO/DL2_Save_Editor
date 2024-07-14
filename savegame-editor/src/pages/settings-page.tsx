import { HelpCircle, Link } from "lucide-react";

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
import { Input } from "@/components/ui/input";

import { NavbarComponent } from "@/components/custom/custom-navbar-component";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { useState } from "react";
import { ThemeModeToggle } from "@/components/custom/theme-button";
import { AppSettings } from "@/models/settings-model";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"

type SettingsProps = {
  appSettings: AppSettings;
}

export const SettingsPage = ({appSettings}: SettingsProps) => {
  const [isCRC, setIsCRC] = useState<boolean>(appSettings.crc.value);
  const [gameFolderPath, setGameFolderPath] = useState<string>(appSettings.gameFolderPath.value);

  const CrCSchema = z.object({
    crc: z.boolean().default(false).optional(),
  })

  export function CheckboxReactHookFormSingle() {
    const form = useForm<z.infer<typeof CrCSchema>>({
      resolver: zodResolver(CrCSchema),
      defaultValues: {
        crc: false,
      },
    })
   
    function onSubmitCRC(data: z.infer<typeof CrCSchema>) {
      
    }

  const saveCrcDataToLocalStorage = () => {
    if (appSettings.crc.storageKey) {
      localStorage.setItem(appSettings.crc.storageKey, JSON.stringify(isCRC));
    }
  }

  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <NavbarComponent />
        <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
          <div className="mx-auto grid w-full max-w-6xl gap-2">
            <h1 className="text-3xl font-semibold">Settings</h1>
          </div>
          <div className="mx-auto grid w-full max-w-6xl gap-2">
            <ThemeModeToggle/>
            <Card x-chunk="dashboard-04-chunk-2">
              <CardHeader>
                <div className="relative">
                  <CardTitle>DL2 Game Folder</CardTitle>
                  <CardDescription>
                    The path where Dying Light 2 Game is installed.
                  </CardDescription>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <HelpCircle className="absolute top-0 right-0 w-6 h-6 text-muted-foreground cursor-pointer" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="flex justify-between space-x-4">
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold">PC only</h4>
                          <p className="text-sm">
                            Due to a collaboration with @EricPlayZ, we are able
                            to provide a way to bypass the CRC check. This will
                            allow you to use and modify PC save files as well.
                            The editor will deploy a .dll file to the game
                            folder and with that bypass the check.
                          </p>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </CardHeader>
              <CardContent>
                <form className="flex flex-col gap-4">
                  <Input
                    placeholder="File path"
                    defaultValue="/fullpath/where/game/is/installed"
                    value={gameFolderPath}
                    onChange={(e) => setGameFolderPath(e.target.value)}
                  />
                  <div className="flex items-center space-x-2">
                  <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmitCRC)} className="space-y-6">
        <FormField
          control={form.control}
          name="crc"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
              <Checkbox id="CRC" checked={isCRC}/>
                    <label
                      htmlFor="CRC"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Allow to bypass CRC check.
                    </label>
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Use different settings for my mobile devices
                </FormLabel>
                <FormDescription>
                  You can manage your mobile notifications in the{" "}
                  <Link href="/examples/forms">mobile settings</Link> page.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button onClick={saveCrcDataToLocalStorage}>Save</Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}
