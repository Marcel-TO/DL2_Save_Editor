import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Home,
  Settings,
  Backpack,
  BookOpenText,
  Fingerprint,
  LockKeyholeOpen,
  MessageSquareWarning,
  Split,
  Swords,
  User,
  Heart,
  StarIcon,
  ShieldAlertIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

// The different pages
const editPages: [string, JSX.Element, string, boolean][] = [
  [
    "Skills",
    <Split className="h-5 w-5 transition-all group-hover:scale-110" />,
    "/skills",
    false,
  ],
  [
    "Inventory",
    <Swords className="h-5 w-5 transition-all group-hover:scale-110" />,
    "/inventory",
    false,
  ],
  [
    "Unlockables",
    <LockKeyholeOpen className="h-5 w-5 transition-all group-hover:scale-110" />,
    "/unlockables",
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
  [
    "Patched Items",
    <ShieldAlertIcon className="h-5 w-5 transition-all group-hover:scale-110" />,
    "/patched-items",
    false,
  ],
];
const infoPages: [string, JSX.Element, string, boolean][] = [
  [
    "Knowledge Vault",
    <BookOpenText className="h-5 w-5 transition-all group-hover:scale-110" />,
    "/knowledge-vault",
    false,
  ],
  [
    "Hawks Outpost",
    <StarIcon className="h-5 w-5 transition-all group-hover:scale-110 hover:fill-primary" />,
    "/hawks-outpost",
    false,
  ],
];

export const NavbarComponent = () => {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 h-full flex-col border-r bg-background sm:flex overflow-y-auto">
        <TooltipProvider>
          <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <Link
              to={"/main"}
              className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
            >
              <Home className="h-4 w-4 transition-all group-hover:scale-110" />
              <span className="sr-only">Home</span>
            </Link>
            <Separator />
            {infoPages.map(([text, icon, link, isDisabled]) => (
              <Tooltip key={link}>
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
              <Tooltip key={link}>
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
              <Tooltip key={link}>
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
    </>
  );
};
