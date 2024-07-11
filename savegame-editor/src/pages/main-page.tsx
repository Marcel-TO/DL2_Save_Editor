import {
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  Download,
  File,
  ListFilter,
  MoreVertical,
  Save,
  Settings,
  Truck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavbarComponent } from "@/components/custom/custom-navbar-component";
import { SaveFile } from "@/models/save-models";
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

type MainPageProps = {
  currentSaveFile: SaveFile | undefined;
};

export function MainPage({ currentSaveFile }: MainPageProps) {
  const [latestEditorVersion, setLatestEditorVersion] = useState<string>("");
  const [amountOfDownloads, setAmountOfDownloads] = useState<number | null>(
    null
  );
  const [percentageToNextThousand, setPercentageToNextThousand] = useState(0);

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

    fetchReleaseInfo();
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <NavbarComponent />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div>
            <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4">
              <CardHeader className="flex flex-row items-start bg-muted/50">
                <div className="grid gap-0.5">
                  <CardTitle className="group flex items-center gap-2 text-lg">
                    {currentSaveFile?.path ?? "No Save Selected"}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <Save className="h-3 w-3" />
                            <span className="sr-only">Save</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy Path</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>
                  <CardDescription>
                    Save Version: {currentSaveFile?.save_version}
                  </CardDescription>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1"
                    disabled={currentSaveFile ? false : true}
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
                        disabled={currentSaveFile ? false : true}
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                        <span className="sr-only">More</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Export</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Backup</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="p-6 text-sm">
                <div className="grid gap-3">
                  <div className="font-semibold">Skills</div>
                  <ul className="grid gap-3">
                    <li className="flex items-center justify-between">
                      {currentSaveFile ? (
                        <>
                          <span className="text-muted-foreground">
                            Base Skills
                          </span>
                          <span>
                            {currentSaveFile?.skills.base_skills.length}
                          </span>
                        </>
                      ) : (
                        <Skeleton className="w-full h-4" />
                      )}
                    </li>
                    <li className="flex items-center justify-between">
                      {currentSaveFile ? (
                        <>
                          <span className="text-muted-foreground">
                            Legend Skills
                          </span>
                          <span>
                            {currentSaveFile?.skills.legend_skills.length}
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
                  {currentSaveFile ? (
                    <>
                      {currentSaveFile.items.map((item) => (
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
                  {currentSaveFile ? (
                    <li className="flex items-center justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span>{currentSaveFile?.unlockable_items.length}</span>
                    </li>
                  ) : (
                    <Skeleton className="w-full h-4" />
                  )}
                </ul>
                <Separator className="my-4" />
                <div className="font-semibold mb-2">Campaign</div>
                {currentSaveFile ? (
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
                  Path: {currentSaveFile?.path}
                </div>
              </CardFooter>
            </Card>
          </div>
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
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
                  <Button>Load Save</Button>
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
              <Card className="sm:col-span-2" x-chunk="dashboard-05-chunk-0">
                <CardHeader className="pb-3">
                  <CardTitle>DL2 Save Editor</CardTitle>
                  <CardDescription className="max-w-lg text-balance leading-relaxed">
                    Take control of your game saves, unlocking a realm of
                    possibilities and customization.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button>Load Save</Button>
                </CardFooter>
              </Card>
            </div>
            <Tabs defaultValue="favorite">
              <div className="flex items-center">
                <TabsList>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="favorites">Favorites</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="recent">
                <Card>
                  <CardHeader className="px-7">
                    <CardTitle>Recent</CardTitle>
                    <CardDescription>
                      Recent saves that you edited.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead className="hidden sm:table-cell">
                            Type
                          </TableHead>
                          <TableHead className="hidden sm:table-cell">
                            Status
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            Date
                          </TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="bg-accent">
                          <TableCell>
                            <div className="font-medium">Liam Johnson</div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                              liam@example.com
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            Sale
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge className="text-xs" variant="secondary">
                              Fulfilled
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            2023-06-23
                          </TableCell>
                          <TableCell className="text-right">$250.00</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <div className="font-medium">Olivia Smith</div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                              olivia@example.com
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            Refund
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge className="text-xs" variant="outline">
                              Declined
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            2023-06-24
                          </TableCell>
                          <TableCell className="text-right">$150.00</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <div className="font-medium">Noah Williams</div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                              noah@example.com
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            Subscription
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge className="text-xs" variant="secondary">
                              Fulfilled
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            2023-06-25
                          </TableCell>
                          <TableCell className="text-right">$350.00</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <div className="font-medium">Emma Brown</div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                              emma@example.com
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            Sale
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge className="text-xs" variant="secondary">
                              Fulfilled
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            2023-06-26
                          </TableCell>
                          <TableCell className="text-right">$450.00</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <div className="font-medium">Liam Johnson</div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                              liam@example.com
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            Sale
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge className="text-xs" variant="secondary">
                              Fulfilled
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            2023-06-23
                          </TableCell>
                          <TableCell className="text-right">$250.00</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <div className="font-medium">Liam Johnson</div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                              liam@example.com
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            Sale
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge className="text-xs" variant="secondary">
                              Fulfilled
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            2023-06-23
                          </TableCell>
                          <TableCell className="text-right">$250.00</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <div className="font-medium">Olivia Smith</div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                              olivia@example.com
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            Refund
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge className="text-xs" variant="outline">
                              Declined
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            2023-06-24
                          </TableCell>
                          <TableCell className="text-right">$150.00</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <div className="font-medium">Emma Brown</div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                              emma@example.com
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            Sale
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge className="text-xs" variant="secondary">
                              Fulfilled
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            2023-06-26
                          </TableCell>
                          <TableCell className="text-right">$450.00</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
