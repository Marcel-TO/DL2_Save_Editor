import { NavbarComponent } from "@/components/custom/custom-navbar-component";
import { HelixLoader } from "@/components/custom/helix-loader/helix-loader-component";
import { OutPostCarouselComponent } from "@/components/custom/outpost-carousel-component";
import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { ToastAction } from "@/components/ui/toast";
import { TypographyP } from "@/components/ui/typography";
import { toast } from "@/components/ui/use-toast";
import { OutpostSave, SaveFile } from "@/models/save-models";
import { SettingState } from "@/models/settings-model";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

type OutpostProps = {
  currentSaveFile: SettingState<SaveFile | undefined>;
  outpostSaves: SettingState<OutpostSave[] | undefined>;
};

export const HawksOutpostPage = ({
  currentSaveFile,
  outpostSaves,
}: OutpostProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchOutpostSaves = async () => {
      setIsLoading(true);
      const result = await invoke<OutpostSave[]>("get_outpost_saves").catch(
        (err) => {
          toast({
            title: "Uh oh! Something went wrong.",
            description: err,
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          });
          return;
        }
      );

      if (result) {
        outpostSaves.setValue(result);
        setIsLoading(false);
      }
    };

    // Check if outpostSaves has been set
    if (outpostSaves.value === undefined) {
      fetchOutpostSaves();
    }
  }, [outpostSaves.value]);

  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <NavbarComponent />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 flex-1">
          <main className="grid flex-1 items-start gap-4 p-4">
            <div className="flex-1">
              <h1 className="text-3xl font-semibold mb-4">Hawks Outpost</h1>

              <Card className="mx-20 my-10">
                <CardHeader>
                  <div className="relative">
                    <CardTitle>
                      Welcome to my humble Outpost Nightrunner
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-6 grid-rows-1 gap-4">
                  <div className="col-span-2 rounded-xl overflow-hidden shadow-sm">
                    <img
                      className="aspect-auto w-full roundex-xl overflow-hidden"
                      src="/assets/pictures/hawks-outpost.webp"
                    />
                  </div>

                  <div className="col-span-4 col-start-3 flex flex-col gap-2">
                    <TypographyP text="Let me introduce myself, I am McHawk but you can call me Hawk. I am a Pilgrim and I am here to help you with your journey. I have been around for a long time and I have seen many things. I have seen the rise and fall of many cities, the birth of many heroes and the fall of many villains. Okay thats enough about me. You probably didn't come here just to listen about my stories. Let me show you what my Outpost has to offer. I am confident you will find something to your liking!" />

                    <TypographyP text="As you know it is not easy to come by great gear and incredible modded weapons. During my travels I gathered some of the finest saves that you can imagine. Use them as template for your own and adjust them to your liking." />

                    <TypographyP text="Browse through the community favorites and find the perfect save for you to start with." />
                  </div>
                </CardContent>
              </Card>

              <OutPostCarouselComponent outpostSaves={outpostSaves.value ?? []} currentSaveFile={currentSaveFile} />
            </div>
          </main>
        </div>

        {/* Loading Animation */}
        {isLoading && (
          <>
            <section className="fixed w-full h-full grid place-content-center bg-background/50">
              <HelixLoader></HelixLoader>
            </section>
          </>
        )}
      </div>
    </>
  );
};
