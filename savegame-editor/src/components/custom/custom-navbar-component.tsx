import {
  Backpack,
  BookOpenText,
  Fingerprint,
  Heart,
  Home,
  LockKeyholeOpen,
  MessageSquareWarning,
  Settings,
  ShieldAlert,
  Split,
  Star,
  Swords,
  User,
  type LucideIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

type NavItem = {
  label: string;
  icon: LucideIcon;
  path: string;
  comingSoon?: boolean;
};

const editPages: NavItem[] = [
  { label: "Skills", icon: Split, path: "/skills" },
  { label: "Inventory", icon: Swords, path: "/inventory" },
  { label: "Unlockables", icon: LockKeyholeOpen, path: "/unlockables" },
  { label: "Backpack", icon: Backpack, path: "/backpack", comingSoon: true },
  {
    label: "Campaign",
    icon: MessageSquareWarning,
    path: "/campaign",
    comingSoon: true,
  },
];

const dataPages: NavItem[] = [
  { label: "IDs", icon: Fingerprint, path: "/ids" },
  { label: "Patched items", icon: ShieldAlert, path: "/patched-items" },
  { label: "Player", icon: User, path: "/player", comingSoon: true },
];

const infoPages: NavItem[] = [
  { label: "Knowledge vault", icon: BookOpenText, path: "/knowledge-vault" },
  { label: "Hawks Outpost", icon: Star, path: "/hawks-outpost" },
];

const linkClassName =
  "group flex min-h-10 items-center gap-3 rounded-lg px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:px-3";

const PageLink = ({ item }: { item: NavItem }) => {
  const Icon = item.icon;

  if (item.comingSoon) {
    return (
      <div
        aria-disabled="true"
        className={cn(linkClassName, "cursor-not-allowed opacity-50")}
        title={`${item.label} is not available yet`}
      >
        <Icon className="size-5 shrink-0" />
        <span className="hidden sm:inline">{item.label}</span>
        <span className="ml-auto hidden text-xs sm:inline">Soon</span>
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      end={item.path === "/main"}
      className={({ isActive }) => cn(linkClassName, isActive && "bg-primary/15 text-foreground")}
    >
      <Icon className="size-5 shrink-0 transition-transform group-hover:scale-105" />
      <span className="hidden sm:inline">{item.label}</span>
    </NavLink>
  );
};

const PageGroup = ({ label, items }: { label: string; items: NavItem[] }) => (
  <div className="grid gap-1">
    <p className="hidden px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 sm:block">
      {label}
    </p>
    {items.map((item) => (
      <PageLink key={item.path} item={item} />
    ))}
  </div>
);

export const NavbarComponent = () => (
  <aside className="fixed inset-y-0 left-0 z-20 flex w-14 flex-col border-r bg-background/95 backdrop-blur sm:w-56">
    <nav
      aria-label="Main navigation"
      className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-2 py-4 sm:px-3"
    >
      <NavLink
        to="/main"
        end
        aria-label="Overview"
        className={({ isActive }) =>
          cn(
            "flex min-h-10 items-center gap-3 rounded-lg px-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent sm:px-3",
            isActive && "bg-primary/15",
          )
        }
      >
        <Home className="size-5 shrink-0" />
        <span className="hidden sm:inline">Save workspace</span>
      </NavLink>
      <Separator />
      <PageGroup label="Editor" items={editPages} />
      <PageGroup label="Save data" items={dataPages} />
      <PageGroup label="Resources" items={infoPages} />
    </nav>
    <nav aria-label="App settings" className="grid gap-1 border-t px-2 py-3 sm:px-3">
      <PageLink item={{ label: "Support", icon: Heart, path: "/sponsor" }} />
      <PageLink item={{ label: "Settings", icon: Settings, path: "/settings" }} />
    </nav>
  </aside>
);
