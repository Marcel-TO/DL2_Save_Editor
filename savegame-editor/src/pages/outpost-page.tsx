import { NavbarComponent } from "@/components/custom/custom-navbar-component";
import { HelixLoader } from "@/components/custom/helix-loader/helix-loader-component";
import { OutPostCarouselComponent } from "@/components/custom/outpost-carousel-component";
import { toast } from "sonner";
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
                    console.error("Error fetching outpost saves:", err);
                    toast.error("Uh oh! Something went wrong.", {
                        description: `Error details: ${err}`,
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
