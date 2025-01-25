import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Theme, useTheme } from "@/components/ui/theme-provider";
import { useNavigate } from "react-router-dom";

export interface SponsorAvatarProps {
    avatar: string;
    initials: string;
    name: string;
    tier: string;
    background?: string;
    themeName?: Theme;
};

export const SponsorAvatarComponent = ({sponsor}: {sponsor: SponsorAvatarProps}) => {
  const { setTheme } = useTheme();
  const navigate = useNavigate();
  
  return (
    <>
      <div className="flex items-center gap-4 border rounded-md my-5 p-5">
        <Avatar 
          className={`hidden h-9 w-9 sm:flex ${sponsor.themeName ? 'cursor-pointer' : ''} ${sponsor.background}`}
          onClick={() => {
            if (sponsor.themeName !== undefined) {
              setTheme(sponsor.themeName);
              navigate("/main");
            }
          }}
        >
          <AvatarImage src={sponsor.avatar} alt="Avatar" />
          <AvatarFallback>{sponsor.initials}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <p className="text-sm font-medium leading-none">{sponsor.name}</p>
          <p className="text-sm text-muted-foreground">
            {sponsor.tier}
          </p>
        </div>
      </div>
    </>
  );
};
