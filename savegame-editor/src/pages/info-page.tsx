import { NavbarComponent } from "@/components/custom/custom-navbar-component";
import { ThemeModeToggle } from "@/components/custom/theme-button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  TypographyH1,
  TypographyH1Thin,
  TypographyH4,
  TypographyList,
  TypographyP,
} from "@/components/ui/typography";
import { AppSettings } from "@/models/settings-model";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@radix-ui/react-hover-card";
import { ArrowDownToDot, HelpCircle } from "lucide-react";

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
                      The people behind the project, who dedicated their time and effort to make it happen.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};
