import { NavbarComponent } from "@/components/custom/custom-navbar-component";
import { SponsorAvatarComponent } from "@/components/custom/sponsor-avatar-component";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { TypographyP } from "@/components/ui/typography";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export const SponsorPage = () => {
  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <NavbarComponent />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <main className="grid flex-1 items-start gap-4 p-4">
            <div>
              <h1 className="text-3xl font-semibold mb-4">Sponsor Page</h1>

              <Card className="mx-20 my-10">
                <CardHeader>
                  <div className="relative">
                    <CardTitle>Thank you!</CardTitle>
                    <CardDescription>
                      As you know, this project is open-source and free to use.
                      However, it is not free to maintain.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <TypographyP
                    text="If you would like to support the editor, please consider sponsoring
          the project. Your support will help keep the project alive and
          well-maintained."
                  />

                  <TypographyP
                    text="By sponsoring the editor, you're not just supporting a project; you're
          investing in a tool that you rely on for your gaming experience. Your
          sponsorship helps the developer to continuously improve the editor by
          adding new features, enhancing existing ones, and fixing bugs. This
          means a more efficient, reliable, and enjoyable experience for you and
          the community. Plus, sponsors often have a say in future developments,
          ensuring the editor evolves in ways that serve your needs best. Join
          us in making this tool even better for everyone."
                  />
                </CardContent>
              </Card>

                <div className="flex w-full justify-center align-center">
                    <Link
                    to={"https://github.com/sponsors/Marcel-TO"} target="_blank"
                    className="flex h-20 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground border"
                    >
                    <Heart className="hover:text-pink-500 hover:fill-pink-500" size="80%" />
                    <span className="text-2xl text-center mr-8">Click Heart to Sponsor the Editor</span>
                    </Link>
                </div>

              <Card className="mx-20 my-10">
                <CardHeader>
                  <div className="relative">
                    <CardTitle> Hall of Fame</CardTitle>
                    <CardDescription>
                      The Hall of Fame showcases the generous sponsors who have
                      supported the editor. Thank you for everything!
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                <SponsorAvatarComponent
                    sponsor={{
                      avatar: "assets/pictures/sponsors/easily-spooked.jpeg",
                      initials: "ES",
                      name: "Easily Spooked",
                      tier: "Ultimate Sponsor of Doom",
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};
