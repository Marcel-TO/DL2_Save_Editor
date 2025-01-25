import { ContributorAvatarComponent } from "@/components/custom/contributor-avatar-component";
import { NavbarComponent } from "@/components/custom/custom-navbar-component";
import { SponsorAvatarComponent } from "@/components/custom/sponsor-avatar-component";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TypographyP } from "@/components/ui/typography";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export const SponsorPage = () => {
  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <NavbarComponent />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <main className="grid flex-1 items-start gap-4 p-4">
            <div>
              <h1 className="text-3xl font-semibold mb-4">
                Sponsors and Contributors Page
              </h1>
              <Card className="mx-20 my-10">
                <CardHeader>
                  <div className="relative">
                    <CardTitle>The Backbone of this Project</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <TypographyP
                    text="The Editor depends on the support of the community. May it be through code contributions, bug reports, or sponsor support, every bit helps. This page is dedicated to honor all those who have and continue to supported the project."
                  />
                </CardContent>
              </Card>

              <Card className="mx-20 my-10">
                <CardHeader>
                  <div className="relative">
                    <CardTitle>Contributors</CardTitle>
                    <CardDescription>
                      The people behind the project, who dedicated their time
                      and effort to make it happen.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <ContributorAvatarComponent
                    contributor={{
                      avatar: "assets/pictures/contributors/mchawk.jpg",
                      initials: "MH",
                      name: "Marcel McHawk",
                      role: "Owner, Creator & Main-Developer",
                      github: "https://github.com/Marcel-TO",
                      themeName: "mchawk"
                    }}
                  />

                  <Separator />
                  <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    <ContributorAvatarComponent
                      contributor={{
                        avatar: "assets/pictures/contributors/caz.png",
                        initials: "CZ",
                        name: "zCaazual",
                        role: "Reverse Engineer",
                        github: "https://github.com/zCaazual",
                        background: "bg-white",
                      }}
                    />
                    <ContributorAvatarComponent
                      contributor={{
                        avatar: "assets/pictures/contributors/batang.png",
                        initials: "BT",
                        name: "Batang",
                        role: "Head of Testing & Contributor",
                        github: "https://github.com/B-a-t-a-n-g",
                        themeName: "batang",
                      }}
                    />
                    <ContributorAvatarComponent
                      contributor={{
                        avatar: "assets/pictures/contributors/eric_playz.webp",
                        initials: "EP",
                        name: "EricPlayZ",
                        role: "DLL Contributor for CRC",
                        github: "https://github.com/EricPlayZ",
                      }}
                    />
                    <ContributorAvatarComponent
                      contributor={{
                        avatar: "assets/pictures/contributors/zdashero.png",
                        initials: "ZH",
                        name: "Zdashero",
                        role: "Tester & Contributor",
                        github: "https://youtube.com/@samuiyorus",
                        themeName: "beast",
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="mx-20 my-10">
                <CardHeader>
                  <div className="relative">
                    <CardTitle>Thank you!</CardTitle>
                    <CardDescription>
                      As you know, this project is open-source and free to use. However, it is not easy to maintain
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
                  to={"https://github.com/sponsors/Marcel-TO"}
                  target="_blank"
                  className="flex h-20 items-center justify-center rounded-lg text-primary bg-card transition-colors hover:text-foreground border"
                >
                  <Heart
                    className="hover:text-pink-500 hover:fill-pink-500"
                    size="80%"
                  />
                  <span className="text-2xl text-center mr-8">
                    Click Heart to Sponsor the Editor
                  </span>
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
                      themeName: "spooked",
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
