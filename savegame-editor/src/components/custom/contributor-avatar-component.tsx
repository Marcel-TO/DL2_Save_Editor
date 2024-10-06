import { ExternalLinkIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Theme, useTheme } from "@/components/ui/theme-provider";

export interface ContributorAvatarProps {
  avatar: string;
  initials: string;
  name: string;
  role: string;
  github: string;
  background?: string;
  themeName?: Theme;
}

export const ContributorAvatarComponent = ({
  contributor,
}: {
  contributor: ContributorAvatarProps;
}) => {
  const { setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-center gap-4 border rounded-md my-5 p-5">
        <Avatar 
          className={`hidden h-9 w-9 sm:flex ${contributor.themeName ? 'cursor-pointer' : ''} ${contributor.background}`}
          onClick={() => {
            if (contributor.themeName !== undefined) {
              setTheme(contributor.themeName);
              navigate("/main");
            }
          }}
        >
          <AvatarImage src={contributor.avatar} alt="Avatar" />
          <AvatarFallback>{contributor.initials}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <p className="text-sm font-medium leading-none">{contributor.name}</p>
          <p className="text-sm text-muted-foreground">{contributor.role}</p>
        </div>
        <div className="ml-auto font-medium">
          <Link to={contributor.github} target="_blank">
            <ExternalLinkIcon />
          </Link>
        </div>
      </div>
    </>
  );
};
