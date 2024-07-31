import { NavbarComponent } from "@/components/custom/custom-navbar-component";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { TypographyList } from "@/components/ui/typography";
import { ContributorAvatarComponent } from "@/components/custom/contributor-avatar-component";
import { Separator } from "@/components/ui/separator";

export const InfoPage = () => {
  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <NavbarComponent />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <main className="grid flex-1 items-start gap-4 p-4">
            <div>
              <h1 className="text-3xl font-semibold mb-4">Info Page</h1>

              <Card className="mx-20 my-10">
                <CardHeader>
                  <div className="relative">
                    <CardTitle>What has the Editor to offer?</CardTitle>
                    <CardDescription>
                      A brief summary of the experience the editor provides.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <TypographyList
                    texts={[
                      "It is fully open source, fostering a collaborative environment where fellow gamers and developers alike can contribute to its evolution.",
                      "The whole User Interface is customized for Dying Light 2 and provides not only functionality but a fitting design.",
                      "Enhancing the gaming experience is the goal of this editor. The community will therefore play a big role regarding future features.",
                    ]}
                  />
                </CardContent>
              </Card>

              <Card className="mx-20 my-10">
                <CardHeader>
                  <div className="relative">
                    <CardTitle>Key Features of the Editor</CardTitle>
                    <CardDescription>
                      An overview of the most important features of the editor.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <TypographyList
                    texts={[
                      "All Skills can be adjusted and manipulated.",
                      "An Index visualization of all IDs currently inside the game.",
                      "Items can be repaired or switched (currently still limited due to the savefile size).",
                      "Change Inventory Item Stats (Level, Seed, Amount, Durability)",
                      "Swap Inventory Weapons",
                      "Change Skill Values",
                      "Use Templates (for example: to add max durability to all weapons)",
                      "Compress/Decompress Feature",
                    ]}
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
                        background: "white",
                      }}
                    />
                    <ContributorAvatarComponent
                      contributor={{
                        avatar: "assets/pictures/contributors/batang.png",
                        initials: "BT",
                        name: "Batang",
                        role: "Head of Testing & Contributor",
                        github: "https://github.com/B-a-t-a-n-g",
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
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};
