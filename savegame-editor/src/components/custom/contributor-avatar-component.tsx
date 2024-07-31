import { ExternalLinkIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface ContributorAvatarProps {
    avatar: string;
    initials: string;
    name: string;
    role: string;
    github: string;
    background?: string;
};

export const ContributorAvatarComponent = ({contributor}: {contributor: ContributorAvatarProps}) => {
  return (
    <>
      <div className="flex items-center gap-4 border rounded-md my-5 p-5">
        <Avatar className={`hidden h-9 w-9 sm:flex bg-${contributor.background}`}>
          <AvatarImage src={contributor.avatar} alt="Avatar" />
          <AvatarFallback>{contributor.initials}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <p className="text-sm font-medium leading-none">{contributor.name}</p>
          <p className="text-sm text-muted-foreground">
            {contributor.role}
          </p>
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
