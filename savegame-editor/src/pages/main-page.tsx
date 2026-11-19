import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { listen, TauriEvent, type UnlistenFn } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { writeFile } from "@tauri-apps/plugin-fs";
import { open, save } from "@tauri-apps/plugin-dialog";
import {
  ArrowUpRight,
  BookOpenText,
  Check,
  Copy,
  Download,
  FileArchive,
  FileWarning,
  FolderOpen,
  MoreVertical,
  PackageOpen,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  Swords,
} from "lucide-react";
import { toast } from "sonner";
import { NavbarComponent } from "@/components/custom/custom-navbar-component";
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { AppSettings, SettingState } from "@/models/settings-model";
import { IdData, PatchedItems, SaveFile } from "@/models/save-models";
import packageJson from "../../package.json";

type MainPageProps = {
  appSettings: AppSettings;
  currentSaveFile: SettingState<SaveFile | undefined>;
  idData: SettingState<IdData[] | undefined>;
  patchedItems: SettingState<PatchedItems | undefined>;
};

const getFileName = (path: string) => path.split(/[/\\]/).pop() || path;

export function MainPage({ currentSaveFile, appSettings, idData, patchedItems }: MainPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [latestEditorVersion, setLatestEditorVersion] = useState("");
  const [amountOfDownloads, setAmountOfDownloads] = useState<number>();
  const dragDropUnlisten = useRef<UnlistenFn | undefined>(undefined);
  const saveFile = currentSaveFile.value;
  const setIdData = idData.setValue;
  const setPatchedItems = patchedItems.setValue;

  useEffect(() => {
    let cancelled = false;

    const handleSetIdData = async () => {
      try {
        const ids = await invoke<IdData[]>("get_ids", {});
        if (!cancelled) setIdData(ids);
      } catch (error) {
        toast.error("Could not load item IDs.", {
          description: String(error),
        });
      }
    };

    const handleSetPatchedItems = async () => {
      try {
        const items = await invoke<PatchedItems>("get_patched_items", {});
        if (!cancelled) setPatchedItems(items);
      } catch (error) {
        toast.error("Could not load patched items.", {
          description: String(error),
        });
      }
    };

    const fetchReleaseInfo = async () => {
      try {
        const response = await fetch(
          "https://api.github.com/repos/Marcel-TO/DL2_Save_Editor/releases",
        );
        if (!response.ok) {
          throw new Error("Could not load release information.");
        }

        const releases: {
          tag_name: string;
          assets: { download_count: number }[];
        }[] = await response.json();
        const latestRelease = releases[0];
        const downloads = releases.reduce(
          (total, release) =>
            total +
            release.assets.reduce((assetTotal, asset) => assetTotal + asset.download_count, 0),
          0,
        );

        if (!cancelled) {
          setAmountOfDownloads(downloads);
          setLatestEditorVersion(latestRelease?.tag_name ?? "");
        }
      } catch (error) {
        console.error("Could not load release information:", error);
      }
    };

    void fetchReleaseInfo();
    void handleSetIdData();
    void handleSetPatchedItems();

    return () => {
      cancelled = true;
      dragDropUnlisten.current?.();
    };
  }, [setIdData, setPatchedItems]);

  async function loadSave(filePath: string) {
    setIsLoading(true);
    setIsDrawerOpen(false);

    try {
      const loadedSave = await invoke<SaveFile>("load_save", {
        file_path: filePath,
        is_debugging: appSettings.isDebugging.value,
        has_automatic_backup: appSettings.hasAutomaticBackup.value,
      });
      currentSaveFile.setValue({ ...loadedSave, is_dirty: false });

      if (loadedSave.backup_path) {
        toast.success("Save loaded and backup created.", {
          description: getFileName(loadedSave.backup_path),
        });
      } else {
        toast.success("Save loaded.", {
          description: "Automatic backups are turned off in Settings.",
        });
      }
    } catch (error) {
      toast.error("Could not load this save.", {
        description: String(error),
        action: (
          <Button variant="outline" onClick={() => setIsDrawerOpen(true)}>
            Try again
          </Button>
        ),
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function listenForSaveDrop() {
    dragDropUnlisten.current?.();
    dragDropUnlisten.current = await listen<{ paths: string[] }>(
      TauriEvent.DRAG_DROP,
      ({ payload }) => {
        if (payload.paths.length !== 1 || !payload.paths[0]?.endsWith(".sav")) {
          toast.error("Choose one .sav file at a time.");
          return;
        }
        void loadSave(payload.paths[0]);
      },
    );
  }

  async function openSaveDrawer() {
    setIsDrawerOpen(true);
    try {
      await listenForSaveDrop();
    } catch (error) {
      toast.error("Could not enable file drop.", {
        description: String(error),
      });
    }
  }

  async function selectCurrentSaveFile() {
    try {
      const filePath = await open({
        multiple: false,
        filters: [{ name: "Save file", extensions: ["sav"] }],
      });

      if (filePath && !Array.isArray(filePath)) {
        await loadSave(filePath);
      }
    } catch (error) {
      toast.error("Could not open the file picker.", {
        description: String(error),
      });
    }
  }

  function markSaveAsClean() {
    if (currentSaveFile.value) {
      currentSaveFile.setValue({
        ...currentSaveFile.value,
        is_dirty: false,
      });
    }
  }

  async function saveCurrentSaveFileDecompressed() {
    if (!currentSaveFile.value) return;

    try {
      const filePath = await save({
        defaultPath: getFileName(currentSaveFile.value.path),
        filters: [{ name: "Save file", extensions: ["sav"] }],
      });
      if (!filePath) return;

      await writeFile(filePath, new Uint8Array(currentSaveFile.value.file_content));
      markSaveAsClean();
      toast.success("Save exported.", { description: filePath });
    } catch (error) {
      toast.error("Could not export the save.", {
        description: String(error),
      });
    }
  }

  async function saveCurrentSaveFileCompressed() {
    if (!currentSaveFile.value) return;

    try {
      const filePath = await save({
        defaultPath: getFileName(currentSaveFile.value.path),
        filters: [{ name: "Save file", extensions: ["sav"] }],
      });
      if (!filePath) return;

      const compressed = await invoke<Uint8Array>("compress_save", {
        data: currentSaveFile.value.file_content,
      });
      await writeFile(filePath, new Uint8Array(compressed));
      markSaveAsClean();
      toast.success("Compressed save exported.", { description: filePath });
    } catch (error) {
      toast.error("Could not export the compressed save.", {
        description: String(error),
      });
    }
  }

  async function saveBackupSaveFile() {
    if (!currentSaveFile.value) return;

    try {
      const filePath = await save({
        defaultPath: `${getFileName(currentSaveFile.value.path)}.bak`,
        filters: [{ name: "Backup file", extensions: ["bak"] }],
      });
      if (!filePath) return;

      await writeFile(filePath, new Uint8Array(currentSaveFile.value.file_content));
      toast.success("Backup exported.", { description: filePath });
    } catch (error) {
      toast.error("Could not export the backup.", {
        description: String(error),
      });
    }
  }

  function handleSavingCurrentSaveFile() {
    if (!currentSaveFile.value) return;

    if (currentSaveFile.value.is_compressed) {
      void saveCurrentSaveFileCompressed();
    } else {
      void saveCurrentSaveFileDecompressed();
    }
  }

  const inventoryCount =
    saveFile?.items.reduce((total, row) => total + row.inventory_items.length, 0) ?? 0;
  const latestReleaseUrl = latestEditorVersion
    ? `https://github.com/Marcel-TO/DL2_Save_Editor/releases/tag/${encodeURIComponent(latestEditorVersion)}`
    : "https://github.com/Marcel-TO/DL2_Save_Editor/releases/latest";

  return (
    <div className="min-h-screen">
      <NavbarComponent />
      <main className="ml-14 px-4 py-6 sm:ml-56 sm:px-8 sm:py-10">
        <div className="mx-auto grid w-full max-w-6xl gap-6">
          <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Dying Light 2 · Save editor
              </p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Save workspace</h1>
              <p className="mt-2 truncate text-sm text-primary">
                {saveFile
                  ? getFileName(saveFile.path)
                  : "Open a save to review and edit your game data."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void openSaveDrawer()} disabled={isLoading}>
                <FolderOpen />
                {saveFile ? "Open another save" : "Open save"}
              </Button>
              {saveFile && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleSavingCurrentSaveFile}
                    disabled={isLoading}
                  >
                    <Save />
                    Export save
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="More save actions">
                        <MoreVertical />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Save actions</DropdownMenuLabel>
                      <DropdownMenuItem onSelect={() => void saveCurrentSaveFileCompressed()}>
                        <FileArchive />
                        Export compressed
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => void saveCurrentSaveFileDecompressed()}>
                        <PackageOpen />
                        Export decompressed
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => void saveBackupSaveFile()}>
                        <ShieldCheck />
                        Export backup
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => setIsResetDialogOpen(true)}
                        className="text-destructive focus:text-destructive"
                      >
                        Close save
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </header>

          {!saveFile ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
              <Card className="overflow-hidden">
                <CardHeader className="gap-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <FolderOpen className="size-6" />
                  </div>
                  <div className="grid gap-2">
                    <CardTitle className="text-2xl">Start with a save file</CardTitle>
                    <CardDescription className="max-w-xl text-sm leading-6">
                      Open a .sav file to inspect your skills, inventory, and unlockables. The
                      editor keeps changes in memory until you export the edited save.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardFooter className="flex flex-wrap gap-3 border-t">
                  <Button onClick={() => void openSaveDrawer()}>
                    <FolderOpen />
                    Choose save file
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    You can also drag a .sav file into the app window.
                  </p>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ShieldCheck className="size-5 text-primary" />
                    Backup protection
                  </CardTitle>
                  <CardDescription className="leading-6">
                    {appSettings.hasAutomaticBackup.value
                      ? "A numbered backup is created beside the original save each time you load it."
                      : "Automatic backups are off. Turn them on before loading a save if you want a recovery copy."}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="border-t">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/settings">
                      <Settings />
                      Backup settings
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Before you edit</CardTitle>
                  <CardDescription>A quick checklist for keeping your save safe.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                  <div className="flex gap-3">
                    <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
                    <p className="text-sm leading-6">
                      Keep an original or automatic backup before exporting changes.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <FileWarning className="mt-0.5 size-5 shrink-0 text-primary" />
                    <p className="text-sm leading-6">
                      Inventory editing is experimental. Review changes in-game.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <BookOpenText className="mt-0.5 size-5 shrink-0 text-primary" />
                    <p className="text-sm leading-6">
                      Check the knowledge vault for save editing guides.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {saveFile.is_dirty && (
                <div
                  aria-live="polite"
                  className="flex items-start gap-3 rounded-lg border border-primary/40 bg-primary/60 text-primary-foreground px-4 py-3 backdrop-blur-sm"
                >
                  <Sparkles className="mt-0.5 size-5 shrink-0 text-primary-foreground" />
                  <div>
                    <p className="text-sm font-medium">Unsaved edits</p>
                    <p className="text-sm text-secondary">
                      Export this save to keep your changes in a file.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
                <Card>
                  <CardHeader>
                    <CardDescription>Loaded save</CardDescription>
                    <CardTitle className="break-all text-xl">
                      {getFileName(saveFile.path)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Game version
                      </p>
                      <p className="mt-1">{saveFile.game_version || "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        File format
                      </p>
                      <p className="mt-1">
                        {saveFile.is_compressed ? "Compressed" : "Decompressed"}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        File path
                      </p>
                      <div className="mt-1 flex items-start gap-2">
                        <p className="min-w-0 break-all text-muted-foreground">{saveFile.path}</p>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="size-7 shrink-0"
                          aria-label="Copy save path"
                          onClick={() => {
                            void navigator.clipboard.writeText(saveFile.path);
                            toast.success("Save path copied.");
                          }}
                        >
                          <Copy />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {saveFile.backup_path ? (
                        <Check className="size-5 text-primary" />
                      ) : (
                        <FileWarning className="size-5 text-muted-foreground" />
                      )}
                      Automatic backup
                    </CardTitle>
                    <CardDescription className="leading-6">
                      {saveFile.backup_path
                        ? "A recovery copy was created before this save was loaded."
                        : "No automatic backup was created for this save."}
                    </CardDescription>
                  </CardHeader>
                  {saveFile.backup_path && (
                    <CardContent>
                      <p className="break-all text-sm text-muted-foreground">
                        {saveFile.backup_path}
                      </p>
                    </CardContent>
                  )}
                  {!saveFile.backup_path && (
                    <CardFooter className="border-t">
                      <Button asChild variant="outline" size="sm">
                        <Link to="/settings">
                          <Settings />
                          Turn on backups
                        </Link>
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </div>

              <section aria-label="Save contents" className="grid gap-4 sm:grid-cols-3">
                <Link
                  to="/skills"
                  className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Card className="h-full transition-colors hover:border-primary/60">
                    <CardHeader className="flex-row items-center justify-between">
                      <CardDescription>Skills</CardDescription>
                      <Sparkles className="size-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-3xl">
                        {saveFile.skills.base_skills.length + saveFile.skills.legend_skills.length}
                      </CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">Base and legend skills</p>
                    </CardContent>
                  </Card>
                </Link>
                <Link
                  to="/inventory"
                  className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Card className="h-full transition-colors hover:border-primary/60">
                    <CardHeader className="flex-row items-center justify-between">
                      <CardDescription>Inventory</CardDescription>
                      <Swords className="size-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-3xl">{inventoryCount}</CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">Items found in this save</p>
                    </CardContent>
                  </Card>
                </Link>
                <Link
                  to="/unlockables"
                  className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Card className="h-full transition-colors hover:border-primary/60">
                    <CardHeader className="flex-row items-center justify-between">
                      <CardDescription>Unlockables</CardDescription>
                      <PackageOpen className="size-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <CardTitle className="text-3xl">{saveFile.unlockable_items.length}</CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">Items found in this save</p>
                    </CardContent>
                  </Card>
                </Link>
              </section>
            </>
          )}

          <section aria-label="Editor resources" className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardDescription>Editor version</CardDescription>
                <CardTitle className="text-2xl">{packageJson.version}</CardTitle>
                <CardDescription>
                  {latestEditorVersion
                    ? `Latest release: ${latestEditorVersion}`
                    : "Release information is unavailable."}
                </CardDescription>
              </CardHeader>
              <CardFooter className="border-t">
                <Button asChild variant="outline" size="sm">
                  <a href={latestReleaseUrl} target="_blank" rel="noreferrer">
                    <Download />
                    View releases
                    <ArrowUpRight />
                  </a>
                </Button>
                {amountOfDownloads !== undefined && (
                  <p className="ml-auto text-sm text-muted-foreground">
                    {new Intl.NumberFormat().format(amountOfDownloads)} downloads
                  </p>
                )}
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need a hand?</CardTitle>
                <CardDescription className="leading-6">
                  Read the save editing guides and learn what each editor page changes.
                </CardDescription>
              </CardHeader>
              <CardFooter className="border-t">
                <Button asChild variant="outline" size="sm">
                  <Link to="/knowledge-vault">
                    <BookOpenText />
                    Open knowledge vault
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </section>
        </div>
      </main>

      <Drawer
        open={isDrawerOpen}
        onOpenChange={(open) => {
          setIsDrawerOpen(open);
          if (!open) {
            dragDropUnlisten.current?.();
            dragDropUnlisten.current = undefined;
          }
        }}
      >
        <DrawerContent>
          <div className="mx-auto w-full max-w-lg">
            <DrawerHeader>
              <DrawerTitle>Open a save file</DrawerTitle>
              <DrawerDescription>Choose a .sav file, or drop one in this window.</DrawerDescription>
            </DrawerHeader>
            <div className="mx-4 rounded-xl border border-dashed p-8 text-center">
              <FolderOpen className="mx-auto size-10 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                Select a file from your computer or drag it into the app.
              </p>
            </div>
            <DrawerFooter>
              <Button onClick={() => void selectCurrentSaveFile()}>
                <FolderOpen />
                Browse files
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close this save?</DialogTitle>
            <DialogDescription>
              {saveFile?.is_dirty
                ? "You have unsaved edits. Export the save first or close it and discard those edits."
                : "This removes the save from the current workspace."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Keep editing</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                currentSaveFile.setValue(undefined);
                setIsResetDialogOpen(false);
              }}
            >
              Close save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoading && (
        <div
          aria-live="polite"
          className="fixed inset-0 z-50 grid place-content-center bg-background/70 backdrop-blur-sm"
        >
          <div className="rounded-xl border bg-card p-6 text-center shadow-lg">
            <PackageOpen className="mx-auto size-8 animate-pulse text-primary" />
            <p className="mt-3 text-sm font-medium">Reading save file...</p>
          </div>
        </div>
      )}
    </div>
  );
}
