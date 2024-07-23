import { HelpCircle, Save } from "lucide-react";

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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

type SettingsProps = {
  appSettings: AppSettings;
};

const CrcFormSchema = z.object({
  crcCheckbox: z.boolean().default(false),
});

export const SettingsPage = ({ appSettings }: SettingsProps) => {
  const [gameFolderPath, setGameFolderPath] = useState<string>(
    appSettings.gameFolderPath.value
  );
  const [isSaving, setIsSaving] = useState(false);

  const saveCrcDataToLocalStorage = (crc: boolean, path: string) => {
    if (appSettings.crc.storageKey) {
      localStorage.setItem(appSettings.crc.storageKey, crc.toString());
    }

    if (appSettings.gameFolderPath.storageKey) {
      localStorage.setItem(appSettings.gameFolderPath.storageKey, path);
    }
  };

  const form = useForm<z.infer<typeof CrcFormSchema>>({
    resolver: zodResolver(CrcFormSchema),
    defaultValues: {
      crcCheckbox: appSettings.crc.value,
    },
  });

  function onSubmitCrcCheck(data: z.infer<typeof CrcFormSchema>) {
    setIsSaving(true);
    saveCrcDataToLocalStorage(data.crcCheckbox, gameFolderPath);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  }

  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <NavbarComponent />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <main className="grid flex-1 items-start gap-4 p-4">
            <div>
              <h1 className="text-3xl font-semibold mb-4">Settings</h1>

              <Card className="mx-20 my-10">
                      <CardHeader>
                        <div className="relative">
                          <CardTitle>Editor Theme</CardTitle>
                          <CardDescription>
                            People have different preferences when it comes to the theme of choice. Choose the one that suits you best.
                          </CardDescription>
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <HelpCircle className="absolute top-0 right-0 w-6 h-6 text-muted-foreground cursor-pointer" />
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="flex justify-between space-x-4">
                                <div className="space-y-1">
                                  <p className="text-sm">
                                    Choose between light and dark theme. The
                                    editor will remember your choice. If you want a custom theme, you can always create one yourself. Follow the instructions in the documentation to create your own theme.

                                    If you dont want to bother with creating a custom theme, but really want a personalized one, you can always support the Editor by joining the Sponsor program. There you can request custom theme only for you.
                                  </p>
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-row gap-1.5 items-center">
                          <div id="theme-toggle">
                            <ThemeModeToggle/>
                          </div>
                          <label
                                  htmlFor="theme-toggle"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Selected Theme
                                </label>
                        </div>
                        </CardContent>
                      </Card>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitCrcCheck)}
                  className="space-y-6"
                >
                  <FormItem>
                    <Card className="mx-20 my-10">
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
                                  <h4 className="text-sm font-semibold">
                                    PC only
                                  </h4>
                                  <p className="text-sm">
                                    Due to a collaboration with @EricPlayZ, we
                                    are able to provide a way to bypass the CRC
                                    check. This will allow you to use and modify
                                    PC save files as well. The editor will
                                    deploy a .dll file to the game folder and
                                    with that bypass the check.
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
                          <div className="flex items-center space-x-2"></div>
                        </form>

                        <FormField
                          control={form.control}
                          name="crcCheckbox"
                          render={({ field }) => (
                            <div className="items-top flex space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="grid gap-1.5 leading-none">
                                <label
                                  htmlFor="terms1"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Bypass CRC
                                </label>
                                <p className="text-sm text-muted-foreground">
                                  You agree that the Editor will deploy a .dll
                                  file. For more information, click on the help
                                  icon.
                                </p>
                              </div>
                            </div>
                          )}
                        />
                      </CardContent>
                      <CardFooter className="border-t px-6 py-4 transition-all">
                        <Button
                          type="submit"
                          className={`transition-all duration-300 ease-in-out ${
                            isSaving
                              ? "rounded-full w-12 h-12"
                              : "py-2 px-4 rounded flex items-center justify-center"
                          }`}
                        >
                          {!isSaving && (
                            <span className="transition-opacity duration-700 ease-in-out">
                              Submit
                            </span>
                          )}
                          {isSaving && (
                            <span className="inline-block animate-popUpAndVanish">
                              <Save className="w-6 h-6" />
                            </span>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </FormItem>
                </form>
              </Form>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};
