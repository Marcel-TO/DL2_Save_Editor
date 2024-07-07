import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Home,
  ShoppingCart,
  Package,
  Users2,
  LineChart,
  Settings,
  Backpack,
  BookOpenText,
  Fingerprint,
  Info,
  LockKeyholeOpen,
  MessageSquareWarning,
  Split,
  Swords,
  User,
  Heart,
  PanelLeft,
  Search,
  Sheet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { title } from "process";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { SheetTrigger, SheetContent } from "../ui/sheet";
import { BreadcrumbComponent } from "./breadcrums-component";

// The different pages
const editPages: [string, JSX.Element, string, boolean][] = [
  [
    "Skills",
    <Split className="h-5 w-5 transition-all group-hover:scale-110" />,
    "/skills",
    false,
  ],
  [
    "Unlockables",
    <LockKeyholeOpen className="h-5 w-5 transition-all group-hover:scale-110" />,
    "/unlockables",
    false,
  ],
  [
    "Inventory",
    <Swords className="h-5 w-5 transition-all group-hover:scale-110" />,
    "/inventory",
    false,
  ],
  [
    "Backpack",
    <Backpack className="h-5 w-5 transition-all group-hover:scale-110" />,
    "/backpack",
    true,
  ],
  [
    "Campaign",
    <MessageSquareWarning className="h-5 w-5 transition-all group-hover:scale-110" />,
    "/campaign",
    true,
  ],
];
const otherPages: [string, JSX.Element, string, boolean][] = [
  [
    "Player",
    <User className="h-5 w-5 transition-all group-hover:scale-110" />,
    "/player",
    true,
  ],
  [
    "IDs",
    <Fingerprint className="h-5 w-5 transition-all group-hover:scale-110" />,
    "/ids",
    false,
  ],
];
const infoPages: [string, JSX.Element, string, boolean][] = [
  [
    "Info",
    <Info className="h-5 w-5 transition-all group-hover:scale-110" />,
    "/info",
    false,
  ],
  [
    "Knowledge Vault",
    <BookOpenText className="h-5 w-5 transition-all group-hover:scale-110" />,
    "/knowledge-vault",
    false,
  ],
  // ['Caz Outpost', <StoreRoundedIcon/>, '/outpost', false],
];

export const NavbarComponent = () => {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <TooltipProvider>
          <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <Link
              to={"/"}
              className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
            >
              <Home className="h-4 w-4 transition-all group-hover:scale-110" />
              <span className="sr-only">Home</span>
            </Link>
            <Separator />
            {infoPages.map(([text, icon, link, isDisabled]) => (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to={link}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                    aria-disabled={isDisabled}
                  >
                    {icon}
                    <span className="sr-only">{text}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{text}</TooltipContent>
              </Tooltip>
            ))}
            <Separator />
            {editPages.map(([text, icon, link, isDisabled]) => (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to={link}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                    aria-disabled={isDisabled}
                  >
                    {icon}
                    <span className="sr-only">{text}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{text}</TooltipContent>
              </Tooltip>
            ))}
            <Separator />
            {otherPages.map(([text, icon, link, isDisabled]) => (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to={link}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                    aria-disabled={isDisabled}
                  >
                    {icon}
                    <span className="sr-only">{text}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{text}</TooltipContent>
              </Tooltip>
            ))}
            <Separator />
          </nav>
          <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to={"/sponsor"}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Heart className="h-5 w-5 hover:text-pink-500 hover:fill-pink-500" />
                  <span className="sr-only">Sponsor</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Sponsor</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to={"/settings"}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </nav>
        </TooltipProvider>
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="sm:hidden">
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs">
            <nav className="grid gap-6 text-lg font-medium">
            {infoPages.map(([text, icon, link, isDisabled]) => (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to={link}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                    aria-disabled={isDisabled}
                  >
                    {icon}
                    <span className="sr-only">{text}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{text}</TooltipContent>
              </Tooltip>
            ))}
              <Link
                to={"/"}
                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
              >
                <Home className="h-5 w-5 transition-all group-hover:scale-110" />
                <span className="sr-only">Home</span>
              </Link>
              <Link
                to={"/"}
                className="flex items-center gap-4 px-2.5 text-foreground"
              >
                <ShoppingCart className="h-5 w-5" />
                Orders
              </Link>
              <Link
                to={"/"}
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <Package className="h-5 w-5" />
                Products
              </Link>
              <Link
                to={"/"}
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <Users2 className="h-5 w-5" />
                Customers
              </Link>
              <Link
                to={"/"}
                className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              >
                <LineChart className="h-5 w-5" />
                Settings
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="hidden md:flex">
          <BreadcrumbComponent breadcrumbLinks={[]} breadcrumbItem={title} />
        </div>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
          />
        </div>
      </header>
    </>
  );
};
