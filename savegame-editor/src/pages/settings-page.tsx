import { GalleryHorizontal, HelpCircle, List, Save } from "lucide-react";

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
import { AppSettings, DefaultItemLayout } from "@/models/settings-model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Store } from "@tauri-apps/plugin-store";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

type SettingsProps = {
  appSettings: AppSettings;
  settingsManager: Store | undefined;
};

const settingsFormSchema = z.object({
  crcCheckbox: z.boolean().default(false),
  isDebugging: z.boolean().default(false),
  hasAutomaticBackup: z.boolean().default(false),
});

export const SettingsPage = ({
  appSettings,
  settingsManager,
}: SettingsProps) => {
  // Data states
  const [gameFolderPath, setGameFolderPath] = useState<string>(
    appSettings.gameFolderPath.value
  );
  const [defaultItemLayout, setDefaultItemLayout] = useState<DefaultItemLayout>(
    appSettings.defaultItemLayout.value
  );

  // Saving states
  const [isSavingCRC, setIsSavingCRC] = useState(false);
  const [isSavingDebugging, setIsSavingDebugging] = useState(false);
  const [isSavingAutomaticBackup, setIsSavingAutomaticBackup] = useState(false);
  const [isSavingDefaultItemLayout, setIsSavingDefaultItemLayout] =
    useState(false);

  const saveCrcDataToLocalStorage = async (crc: boolean, path: string) => {
    if (appSettings.crc.storageKey && settingsManager) {
      await settingsManager.set(appSettings.crc.storageKey, { value: crc });
    }

    if (appSettings.gameFolderPath.storageKey && settingsManager) {
      await settingsManager.set(appSettings.gameFolderPath.storageKey, {
        value: path,
      });
    }
  };

  const form = useForm<z.infer<typeof settingsFormSchema>>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      crcCheckbox: appSettings.crc.value,
      isDebugging: appSettings.isDebugging.value,
      hasAutomaticBackup: appSettings.hasAutomaticBackup.value,
    },
  });

  async function onSubmitCrcCheck(data: z.infer<typeof settingsFormSchema>) {
    setIsSavingCRC(true);
    saveCrcDataToLocalStorage(data.crcCheckbox, gameFolderPath);

    // Disable saving for 1 second to prevent spamming the button
    setTimeout(() => {
      setIsSavingCRC(false);
    }, 1000);

    if (!data.crcCheckbox) {
      toast({
        title: "Uh oh! Something went wrong!",
        description:
          "You will need to activate the CRC checkbox to allow the Editor to deploy the .dll file to the game folder. Please try again.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
      return;
    }

    await invoke("add_crc_bypass_files", {
      file_path: gameFolderPath,
    }).catch((err) => {
      toast({
        title: "Uh oh! Something went wrong!",
        description:
          err ??
          "An error occured while trying to add the CRC bypass files to the game folder. Please make sure the path is correct and try again.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
      return;
    });
  }

  const onSubmitIsDebugging = async (
    data: z.infer<typeof settingsFormSchema>
  ) => {
    setIsSavingDebugging(true);

    if (appSettings.isDebugging.storageKey && settingsManager) {
      await settingsManager.set(appSettings.isDebugging.storageKey, {
        value: data.isDebugging,
      });
    }

    // Disable saving for 1 second to prevent spamming the button
    setTimeout(() => {
      setIsSavingDebugging(false);
    }, 1000);
  };

  const onSubmitIsAutomaticBackup = async (
    data: z.infer<typeof settingsFormSchema>
  ) => {
    setIsSavingAutomaticBackup(true);

    if (appSettings.hasAutomaticBackup.storageKey && settingsManager) {
      await settingsManager.set(appSettings.hasAutomaticBackup.storageKey, {
        value: data.hasAutomaticBackup,
      });
    }

    // Disable saving for 1 second to prevent spamming the button
    setTimeout(() => {
      setIsSavingAutomaticBackup(false);
    }, 1000);
  };

  const onSubmitDefaultItemLayout = async () => {
    setIsSavingDefaultItemLayout(true);

    if (appSettings.defaultItemLayout.storageKey && settingsManager) {
      await settingsManager.set(appSettings.defaultItemLayout.storageKey, {
        value: defaultItemLayout,
      });
    }

    // Disable saving for 1 second to prevent spamming the button
    setTimeout(() => {
      setIsSavingDefaultItemLayout(false);
    }, 1000);
  };

  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <NavbarComponent />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <main className="grid flex-1 items-start gap-4 p-4">
            <div>
              <h1 className="text-3xl font-semibold mb-4">Settings</h1>

              <Card className="mx-20 my-10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="">
                      <CardTitle>Editor Theme</CardTitle>
                      <CardDescription>
                        People have different preferences when it comes to the
                        theme of choice. Choose the one that suits you best.
                      </CardDescription>
                    </div>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <HelpCircle className="w-6 h-6 text-muted-foreground cursor-pointer" />
                      </HoverCardTrigger>
                      <HoverCardContent className="relative w-80" side="left">
                        <div className="flex justify-between space-x-4">
                          <div className="space-y-1">
                            <p className="text-sm">
                              Choose between light and dark theme. The editor
                              will remember your choice. If you want a custom
                              theme, you can always create one yourself. Follow
                              the instructions in the documentation to create
                              your own theme. If you dont want to bother with
                              creating a custom theme, but really want a
                              personalized one, you can always support the
                              Editor by joining the Sponsor program. There you
                              can request custom theme only for you.
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
                      <ThemeModeToggle />
                    </div>
                    <label
                      htmlFor="theme-toggle"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Selected Theme: {appSettings.theme.value.toUpperCase()}
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
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>DL2 Game Folder</CardTitle>
                            <CardDescription>
                              The path where Dying Light 2 Game is installed.
                            </CardDescription>
                          </div>
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <HelpCircle className="w-6 h-6 text-muted-foreground cursor-pointer" />
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80" side="left">
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
                            isSavingCRC
                              ? "rounded-full w-12 h-12"
                              : "py-2 px-4 rounded flex items-center justify-center"
                          }`}
                        >
                          {!isSavingCRC && (
                            <span className="transition-opacity duration-700 ease-in-out">
                              Submit
                            </span>
                          )}
                          {isSavingCRC && (
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

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitIsDebugging)}
                  className="space-y-6"
                >
                  <FormItem>
                    <Card className="mx-20 my-10">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Debug Logs</CardTitle>
                            <CardDescription>
                              Activating the debug logs so that every action the
                              Editor does is logged..
                            </CardDescription>
                          </div>
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <HelpCircle className="w-6 h-6 text-muted-foreground cursor-pointer" />
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80" side="left">
                              <div className="flex justify-between space-x-4">
                                <div className="space-y-1">
                                  <h4 className="text-sm font-semibold">
                                    Why debug logs?
                                  </h4>
                                  <p className="text-sm">
                                    Since the save structure is very complex,
                                    there can always be issues regarding the
                                    loading process. Whether some problems
                                    regarding the save file or the Editor
                                    itself, the debug logs will help finding the
                                    issue.
                                  </p>
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="isDebugging"
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
                                  Activate Debug Logs
                                </label>
                              </div>
                            </div>
                          )}
                        />
                      </CardContent>
                      <CardFooter className="border-t px-6 py-4 transition-all">
                        <Button
                          type="submit"
                          className={`transition-all duration-300 ease-in-out ${
                            isSavingDebugging
                              ? "rounded-full w-12 h-12"
                              : "py-2 px-4 rounded flex items-center justify-center"
                          }`}
                        >
                          {!isSavingDebugging && (
                            <span className="transition-opacity duration-700 ease-in-out">
                              Submit
                            </span>
                          )}
                          {isSavingDebugging && (
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

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitIsAutomaticBackup)}
                  className="space-y-6"
                >
                  <FormItem>
                    <Card className="mx-20 my-10">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Automatic Backup</CardTitle>
                            <CardDescription>
                              Activating the automatic backup setting will allow
                              the Editor to create a backup of the save file
                              before any changes are made.
                            </CardDescription>
                          </div>
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <HelpCircle className="w-6 h-6 text-muted-foreground cursor-pointer" />
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80" side="left">
                              <div className="flex justify-between space-x-4">
                                <div className="space-y-1">
                                  <h4 className="text-sm font-semibold">
                                    Why Automatic Backup?
                                  </h4>
                                  <p className="text-sm">
                                    Since the save structure is very complex,
                                    there can always be issues regarding the
                                    editing process. When overwriting your
                                    savefile without a backup, you might lose
                                    your progress. The automatic backup will
                                    create a backup of your save file before any
                                    changes are made.
                                  </p>
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="hasAutomaticBackup"
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
                                  Activate Debug Logs
                                </label>
                              </div>
                            </div>
                          )}
                        />
                      </CardContent>
                      <CardFooter className="border-t px-6 py-4 transition-all">
                        <Button
                          type="submit"
                          className={`transition-all duration-300 ease-in-out ${
                            isSavingAutomaticBackup
                              ? "rounded-full w-12 h-12"
                              : "py-2 px-4 rounded flex items-center justify-center"
                          }`}
                        >
                          {!isSavingAutomaticBackup && (
                            <span className="transition-opacity duration-700 ease-in-out">
                              Submit
                            </span>
                          )}
                          {isSavingAutomaticBackup && (
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

              <Card className="mx-20 my-10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Default Item Layout</CardTitle>
                      <CardDescription>
                        How do you want the inventory items to be displayed?
                      </CardDescription>
                    </div>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <HelpCircle className="w-6 h-6 text-muted-foreground cursor-pointer" />
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80" side="left">
                        <div className="flex justify-between space-x-4">
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold">
                              Why different Layouts?
                            </h4>
                            <p className="text-sm">
                              Since every person has a different preference, you
                              can choose between a list or grid layout for the
                              inventory items. The Editor will remember your
                              choice. Keep in mind that when changing the
                              default settings for the layout, it will only
                              affect the Editor after a restart.
                            </p>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="items-top flex space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 gap-2 text-sm bg-card/50"
                        >
                          {defaultItemLayout === "grid" ? (
                            <GalleryHorizontal className="h-3.5 w-3.5" />
                          ) : (
                            <List className="h-3.5 w-3.5" />
                          )}
                          <span className="sr-only sm:not-sr-only">View</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>View Items as</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                          checked={defaultItemLayout === "grid"}
                          onClick={() => setDefaultItemLayout("grid")}
                          className="h-7 gap-1 text-sm"
                        >
                          <GalleryHorizontal className="h-3.5 w-3.5" />
                          Gallery
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={defaultItemLayout === "list"}
                          onClick={() => setDefaultItemLayout("list")}
                          className="h-7 gap-1 text-sm"
                        >
                          <List className="h-3.5 w-3.5" />
                          List
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4 transition-all">
                  <Button
                    onClick={onSubmitDefaultItemLayout}
                    className={`transition-all duration-300 ease-in-out ${
                      isSavingDefaultItemLayout
                        ? "rounded-full w-12 h-12"
                        : "py-2 px-4 rounded flex items-center justify-center"
                    }`}
                  >
                    {!isSavingDefaultItemLayout && (
                      <span className="transition-opacity duration-700 ease-in-out">
                        Submit
                      </span>
                    )}
                    {isSavingDefaultItemLayout && (
                      <span className="inline-block animate-popUpAndVanish">
                        <Save className="w-6 h-6" />
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <Toaster />
          </main>
        </div>
      </div>
    </>
  );
};
