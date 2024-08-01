import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface SponsorAvatarProps {
    avatar: string;
    initials: string;
    name: string;
    tier: string;
    background?: string;
};

export const SponsorAvatarComponent = ({sponsor}: {sponsor: SponsorAvatarProps}) => {
  return (
    <>
      <div className="flex items-center gap-4 border rounded-md my-5 p-5">
        <Avatar className={`hidden h-9 w-9 sm:flex ${sponsor.background}`}>
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
