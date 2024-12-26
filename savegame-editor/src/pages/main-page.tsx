import { Copy, Download, MoreVertical, Save, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { NavbarComponent } from "@/components/custom/custom-navbar-component";
import { IdData, SaveFile } from "@/models/save-models";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import packageJson from "../../package.json";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { listen, TauriEvent } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { writeFile } from "@tauri-apps/plugin-fs";
import { open, save } from "@tauri-apps/plugin-dialog";
import { AppSettings, SettingState } from "@/models/settings-model";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction, ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { TypographyH1 } from "@/components/ui/typography";
import { HelixLoader } from "@/components/custom/helix-loader/helix-loader-component";

type MainPageProps = {
  appSettings: AppSettings;
  currentSaveFile: SettingState<SaveFile | undefined>;
  idData: SettingState<IdData[] | undefined>;
};

export function MainPage({
  currentSaveFile,
  appSettings,
  idData,
}: MainPageProps) {
  // State for the current loading state.
  const [isLoading, setIsLoading] = useState(false);
  // States for the Card Details
  const [latestEditorVersion, setLatestEditorVersion] = useState<string>("");
  const [amountOfDownloads, setAmountOfDownloads] = useState<number | null>(
    null
  );
  const [percentageToNextThousand, setPercentageToNextThousand] = useState(0);
  const [userName, setUserName] = useState<string>("");

  // States for the Save File
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // initialize toast for error messages
  const { toast } = useToast();

  useEffect(() => {
    const fetchReleaseInfo = async () => {
      try {
        const response = await fetch(
          "https://api.github.com/repos/Marcel-TO/DL2_Save_Editor/releases"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch release information");
        }

        const releases = await response.json();

        // Calculate total downloads for all releases and assets
        const downloads = releases.reduce(
          (total: any, release: { assets: any[] }) => {
            return (
              total +
              release.assets.reduce(
                (assetTotal: any, asset: { download_count: any }) => {
                  return assetTotal + asset.download_count;
                },
                0
              )
            );
          },
          0
        );
        setAmountOfDownloads(downloads);
        setPercentageToNextThousand(
          Math.ceil(((downloads % 1000) / 1000) * 100)
        );

        // Get the latest release
        const latestRelease = releases[0];
        setLatestEditorVersion(latestRelease.tag_name);
      } catch (error) {
        console.error("Error fetching GitHub release information:", error);
      }
    };

    // Function to get the value of the --background-image CSS variable
    const getUserName = () => {
      const element = document.documentElement; // Target the root element
      if (element) {
        return getComputedStyle(element).getPropertyValue("--user-name");
      }
      return "";
    };

    fetchReleaseInfo();
    setUserName(getUserName());
    handleSetIdData();
  }, []);

  async function listenDragDrop() {
    listen<{ paths: string[] }>(TauriEvent.DRAG_DROP, async (event) => {
      let filepath = event.payload.paths[0];

      if (filepath == null) {
        toast({
          title: "Uh oh! Something went wrong. :/",
          description: "No file path found.",
          action: (
            <ToastAction
              altText="Try again"
              onClick={() => setIsDrawerOpen(true)}
            >
              Try again
            </ToastAction>
          ),
        });
        return;
      } else if (event.payload.paths.length > 1) {
        toast({
          title: "Uh oh! Something went wrong.",
          description: "Please only drop one file at a time.",
          action: (
            <ToastAction
              altText="Try again"
              onClick={() => setIsDrawerOpen(true)}
            >
              Try again
            </ToastAction>
          ),
        });
        return;
      } else if (!filepath.endsWith(".sav")) {
        toast({
          title: "Uh oh! Something went wrong.",
          description:
            "Please only drop .sav files that contain your save data.",
          action: (
            <ToastAction
              altText="Try again"
              onClick={() => setIsDrawerOpen(true)}
            >
              Try again
            </ToastAction>
          ),
        });
        return;
      }

      loadSave(filepath);
    });
  }


  const loadSave = async (filepath: string) => {
      setIsLoading(true);
      setIsDrawerOpen(false);
    let newSave = await invoke<SaveFile>("load_save", {
      file_path: filepath,
      is_debugging: appSettings.isDebugging.value,
      has_automatic_backup: appSettings.hasAutomaticBackup.value,
    }).catch((err) => {
      toast({
        title: "Uh oh! Something went wrong.",
        description: err,
        action: (
          <ToastAction
            altText="Try again"
            onClick={() => setIsDrawerOpen(true)}
          >
            Try again
          </ToastAction>
        ),
      });
      return;
    });

    if (newSave) {
      currentSaveFile.setValue(newSave);
      console.log(newSave);
      setIsLoading(false);
    }
  };

  async function selectCurrentSaveFile() {
    let filepath = await open({
      multiple: false,
      filters: [
        {
          name: "SAV File",
          extensions: ["sav"],
        },
      ],
    });

    if (filepath != null && !Array.isArray(filepath)) {
      loadSave(filepath);
    }
  }

  function handleSavingCurrentSaveFile() {
    if (currentSaveFile.value?.is_compressed == true) {
      saveCurrentSaveFileCompressed();
    } else {
      saveCurrentSaveFileDecompressed();
    }
  }

  async function saveCurrentSaveFileDecompressed() {
    let filePath = await save({
      defaultPath: "/save_main_0",
      filters: [
        {
          name: "SAV File",
          extensions: ["sav"],
        },
      ],
    });

    if (filePath != null && currentSaveFile.value != undefined) {
      // Save data to file
      await writeFile(filePath, currentSaveFile.value.file_content).catch(
        (err) => {
          toast({
            title: "Uh oh! Something went wrong. :/",
            description:
              "The Editor stumbled accross the following error: " + err,
          });
          return;
        }
      );
    }
  }

  async function saveCurrentSaveFileCompressed() {
    let filePath = await save({
      defaultPath: "/save_main_0",
      filters: [
        {
          name: "SAV File",
          extensions: ["sav"],
        },
      ],
    });

    if (filePath != null && currentSaveFile.value != undefined) {
      // Save data to file
      let compressed = await invoke<Uint8Array>("compress_save", {
        data: currentSaveFile.value.file_content,
      }).catch((err) => {
        toast({
          title: "Uh oh! Something went wrong. :/",
          description:
            "The Editor stumbled accross the following error: " + err,
        });
        return;
      });

      if (compressed) {
        await writeFile(filePath, compressed).catch((err) => {
          toast({
            title: "Uh oh! Something went wrong. :/",
            description:
              "The Editor stumbled accross the following error: " + err,
          });
          return;
        });
      }
    }
  }

  async function saveBackupSaveFile() {
    let filePath = await save({
      defaultPath: "/save_main_0",
      filters: [
        {
          name: "SAV Backup File",
          extensions: ["sav.bak"],
        },
      ],
    });

    if (filePath != null && currentSaveFile.value != undefined) {
      // Save data to file
      await writeFile(filePath, currentSaveFile.value.file_content).catch(
        (err) => {
          toast({
            title: "Uh oh! Something went wrong. :/",
            description:
              "The Editor stumbled accross the following error: " + err,
          });
          return;
        }
      );
    }
  }

  async function handleSetIdData() {
    let ids = await invoke<IdData[]>("get_ids", {}).catch((err) => {
      toast({
        title: "Uh oh! Something went wrong!",
        description:
          err ??
          "An error occured while trying to load the IDs file. Please make sure the IDs folder exists in the editor's directory.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
      return;
    });

    if (ids) {
      idData.setValue(ids);
    }
  }

  const openSecondWindow = async () => {
    await invoke("open_second_window").catch((err) => {
      toast({
        title: "Uh oh! Something went wrong.",
        description: err ?? "An error occured while loading the save file.",
        action: (
          <ToastAction
            altText="Try again"
            onClick={() => setIsDrawerOpen(true)}
          >
            Try again
          </ToastAction>
        ),
      });
      return;
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <NavbarComponent />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div>
            <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4">
              <CardHeader className="flex flex-row items-start bg-muted/50">
                <div className="grid gap-0.5">
                  <CardTitle className="group flex items-center gap-2 text-lg">
                    {currentSaveFile.value?.path.split(/[/\\]/).pop() ??
                      "No Save Selected"}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={() =>
                              navigator.clipboard.writeText(
                                currentSaveFile.value?.path ?? ""
                              )
                            }
                          >
                            <Copy className="h-3 w-3" />
                            <span className="sr-only">Copy</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy Path</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>
                  <CardDescription>
                    {currentSaveFile.value ? (
                      <>
                        <div className="flex flex-col">
                          <div>
                            Save Version: {currentSaveFile.value?.game_version}
                          </div>
                          <div>
                            Is Compressed:{" "}
                            {currentSaveFile.value?.is_compressed == true
                              ? "Yes"
                              : "No"}
                          </div>
                        </div>
                      </>
                    ) : (
                      <></>
                    )}
                  </CardDescription>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1"
                    disabled={currentSaveFile.value ? false : true}
                    onClick={() => handleSavingCurrentSaveFile()}
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                      Save File
                    </span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        disabled={currentSaveFile.value ? false : true}
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                        <span className="sr-only">More</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <Link to={"/debug"}>
                          <DropdownMenuItem>Debug</DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem onClick={() => openSecondWindow()}>
                          Hex View
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Export As</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => saveCurrentSaveFileCompressed()}
                        >
                          Compressed
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => saveCurrentSaveFileDecompressed()}
                        >
                          Decompressed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => saveBackupSaveFile()}>
                          Backup
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive" className="w-full">
                            Reset
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            Are you sure that you want to reset?
                          </DialogHeader>
                          <DialogDescription>
                            When resetting, the current save will be deselcted.
                            This means that all unsaved changes to the save will
                            be lost. If this is not your intention, please save
                            before continuing.
                          </DialogDescription>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button
                                onClick={() =>
                                  currentSaveFile.setValue(undefined)
                                }
                                variant="destructive"
                              >
                                Reset
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-6 text-sm">
                <div className="grid gap-3">
                  <div className="font-semibold">Skills</div>
                  <ul className="grid gap-3">
                    <li className="flex items-center justify-between">
                      {currentSaveFile.value ? (
                        <>
                          <span className="text-muted-foreground">
                            Base Skills
                          </span>
                          <span>
                            {currentSaveFile.value?.skills.base_skills.length}
                          </span>
                        </>
                      ) : (
                        <Skeleton className="w-full h-4" />
                      )}
                    </li>
                    <li className="flex items-center justify-between">
                      {currentSaveFile.value ? (
                        <>
                          <span className="text-muted-foreground">
                            Legend Skills
                          </span>
                          <span>
                            {currentSaveFile.value?.skills.legend_skills.length}
                          </span>
                        </>
                      ) : (
                        <Skeleton className="w-full h-4" />
                      )}
                    </li>
                  </ul>
                </div>
                <Separator className="my-2" />
                <div className="font-semibold">Inventory</div>
                <ul className="grid gap-3">
                  {currentSaveFile.value ? (
                    <>
                      {currentSaveFile.value.items.map((item) => (
                        <li
                          key={item.name}
                          className="flex items-center justify-between"
                        >
                          <span className="text-muted-foreground">
                            {item.name}
                          </span>
                          <span>{item.inventory_items.length}</span>
                        </li>
                      ))}
                    </>
                  ) : (
                    <Skeleton className="w-full h-[100px]" />
                  )}
                </ul>
                <Separator className="my-4" />
                <div className="font-semibold">Unlockables</div>
                <ul className="grid gap-3">
                  {currentSaveFile.value ? (
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span>
                        {currentSaveFile.value?.unlockable_items.length}
                      </span>
                    </li>
                  ) : (
                    <Skeleton className="w-full h-4" />
                  )}
                </ul>
                <Separator className="my-4" />
                <div className="font-semibold mb-2">Campaign</div>
                {currentSaveFile.value ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid">
                        <div className="font-semibold">Chapter 1</div>
                        <div className="grid not-italic text-muted-foreground">
                          <span>Level: xx</span>
                          <span>Token: xxxxxx</span>
                        </div>
                      </div>
                      <div className="grid">
                        <div className="font-semibold">Chapter 2</div>
                        <div className="grid not-italic text-muted-foreground">
                          <span>Level: xx</span>
                          <span>Token: xxxxxx</span>
                        </div>
                      </div>
                      <div className="grid">
                        <div className="font-semibold">Chapter 3</div>
                        <div className="grid not-italic text-muted-foreground">
                          <span>Level: xx</span>
                          <span>Token: xxxxxx</span>
                        </div>
                      </div>
                      <div className="grid">
                        <div className="font-semibold">Chapter 4</div>
                        <div className="grid not-italic text-muted-foreground">
                          <span>Level: xx</span>
                          <span>Token: xxxxxx</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <Skeleton className="w-full h-[100px]" />
                )}
                <Separator className="my-4" />
              </CardContent>
              <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
                <div className="text-xs text-muted-foreground">
                  Path: {currentSaveFile.value?.path}
                </div>
              </CardFooter>
            </Card>
          </div>
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <TypographyH1
              text={`Welcome ${userName}`}
              className="text-primary mt-4 text-7xl"
            />
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              <Card className="sm:col-span-2" x-chunk="dashboard-05-chunk-0">
                <CardHeader className="pb-3">
                  <CardTitle>DL2 Save Editor</CardTitle>
                  <CardDescription className="max-w-lg text-balance leading-relaxed">
                    Take control of your game saves, unlocking a realm of
                    possibilities and customization.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                    <DrawerTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-primary text-primary transform transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
                        onClick={() => listenDragDrop()}
                      >
                        Load Save
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <div className="mx-auto w-full max-w-sm">
                        <DrawerHeader>
                          <DrawerTitle>Load a Save</DrawerTitle>
                          <DrawerDescription>
                            Select or drag your save file to load.
                          </DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4">
                          <div className="mt-3 h-[120px] bg-muted">
                            <div className="flex flex-col items-center justify-center h-full">
                              <Save
                                className="h-12 w-12 text-muted-foreground"
                                strokeWidth={1}
                              />
                              <span className="text-muted-foreground">
                                Drag and drop your save file here.
                              </span>
                            </div>
                          </div>
                        </div>
                        <Toaster />
                        <ToastProvider />
                        <DrawerFooter>
                          <Button onClick={selectCurrentSaveFile}>
                            Select
                          </Button>
                          <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </div>
                    </DrawerContent>
                  </Drawer>
                </CardFooter>
              </Card>
              <Card x-chunk="dashboard-05-chunk-1">
                <CardHeader className="pb-2">
                  <CardDescription>Editor Version</CardDescription>
                  <CardTitle className="text-4xl">
                    {packageJson.version}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    Latest Version: {latestEditorVersion}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link
                    to={
                      "https://github.com/Marcel-TO/DL2_Save_Editor/releases/" +
                      latestEditorVersion
                    }
                    target="_blank"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1 text-sm"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only">
                        latest release
                      </span>
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              <Card x-chunk="dashboard-05-chunk-2">
                <CardHeader className="pb-2">
                  <CardDescription>Downloads</CardDescription>
                  <CardTitle className="text-4xl">
                    {amountOfDownloads}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    {100 - percentageToNextThousand}% to next thousand
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress
                    value={percentageToNextThousand}
                    aria-label="Progress to next thousands"
                  />
                </CardFooter>
              </Card>
            </div>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              <Link to={"/settings"}>
                <Card className="transform transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg w-full h-full">
                  <CardHeader className="grid center">
                    <CardDescription>Select to visit</CardDescription>
                    <CardTitle className="text-4xl flex flex-row">
                      Settings
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>
              <Link
                to={"https://github.com/Marcel-TO/DL2_Save_Editor"}
                target="_blank"
              >
                <Card className="transform transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg w-full h-full">
                  <CardHeader className="pb-2">
                    <CardDescription className="flex flex-row gap-2">
                      Select to visit
                      <ExternalLink className="w-4" />
                    </CardDescription>
                    <CardTitle className="text-4xl">Github</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
              <Card className="sm:col-span-2" x-chunk="dashboard-05-chunk-0">
                <CardHeader className="pb-3">
                  <CardTitle>Knowledge-Vault</CardTitle>
                  <CardDescription className="max-w-lg text-balance leading-relaxed">
                    A collection of guides, tutorials and information on how to
                    use the editor and what you can do with it.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Link
                    to={"/knowledge-vault"}
                    className="transform transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
                  >
                    <Button
                      variant="outline"
                      className="border-primary text-primary"
                    >
                      Learn more
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Loading Animation */}
      {isLoading && (
        <>
          <section className="fixed w-full h-full grid place-content-center bg-background/50">
            <HelixLoader></HelixLoader>
          </section>
        </>
      )}
    </div>
  );
}
