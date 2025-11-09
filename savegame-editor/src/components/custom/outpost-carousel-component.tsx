import {
    Carousel,
    CarouselNext,
    CarouselPrevious,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { OutpostSave, SaveFile } from "@/models/save-models";
import { SettingState } from "@/models/settings-model";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type OutpostProps = {
    currentSaveFile: SettingState<SaveFile | undefined>;
    outpostSaves: OutpostSave[];
};

export const OutPostCarouselComponent = ({
    outpostSaves,
    currentSaveFile,
}: OutpostProps) => {
    const [isSelectingTemplate, setIsSelectingTemplate] = useState(false);
    const [currentSelectedOutpostSave, setCurrentSelectedOutpostSave] = useState<
        OutpostSave | undefined
    >(undefined);
    const navigate = useNavigate();
    const handleSelectTemplate = (saveFile: SaveFile) => {
        currentSaveFile.setValue(saveFile);
        navigate("/main");
    };

    return (
        <TooltipProvider>
            <Carousel opts={{ loop: true }}>
                <CarouselNext className="scale-150 bg-card/70" />
                <CarouselPrevious className="scale-150 bg-card/70" />
                <div className="relative h-full">
                    <CarouselContent className="h-[80vh]">
                        {outpostSaves.map((save, index) => (
                            <CarouselItem
                                key={save.save_file.path}
                                className="flex items-center justify-center overflow-hidden"
                            >
                                <Tooltip>
                                    <TooltipTrigger className="absolute transition-all hover:scale-110 hover:shadow-2xl hover:shadow-primary">
                                        <Button
                                            onClick={() => {
                                                setIsSelectingTemplate(true);
                                                setCurrentSelectedOutpostSave(save);
                                            }}
                                            className={
                                                "roundex-xl bg-card/70 text-7xl text-card/70 font-drip hover:bg-primary hover:text-primary-foreground"
                                            }
                                        >
                                            {save.name}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{save.name}</TooltipContent>
                                </Tooltip>
                                <img
                                    className="w-full h-full aspect-video object-cover rounded-xl"
                                    src={`/assets/pictures/backgrounds/slider-${index + 1}.jpg`}
                                />
                                <Dialog
                                    open={isSelectingTemplate}
                                    onOpenChange={setIsSelectingTemplate}
                                >
                                    <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                            <DialogTitle>
                                                {currentSelectedOutpostSave?.name}
                                            </DialogTitle>
                                            <DialogDescription>
                                                @{currentSelectedOutpostSave?.owner}
                                            </DialogDescription>
                                            <div className="space-y-4">
                                                <p className="text-sm text-muted-foreground">
                                                    <strong>Description:</strong> {currentSelectedOutpostSave?.description}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    <strong>Version:</strong> {currentSelectedOutpostSave?.version}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    <strong>Features:</strong> {currentSelectedOutpostSave?.features.join(", ")}
                                                </p>
                                            </div>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button
                                                onClick={() => {
                                                    if (currentSelectedOutpostSave) {
                                                        handleSelectTemplate(
                                                            currentSelectedOutpostSave.save_file
                                                        );
                                                    }
                                                }}
                                            >
                                                Use this Save
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </div>

                <div className="absolute top-1/2 left-2 flex items-center justify-center">
                    <CarouselPrevious className="relative left-5 translate-x-0 w-12 scale-150 cursor-pointer bg-card/70 hover:translate-x-0 hover:bg-primary/90" />
                </div>
                <div className="absolute top-1/2 right-2 flex items-center justify-center">
                    <CarouselNext className="relative right-5 translate-x-0 w-12 scale-150 cursor-pointer bg-card/70 hover:translate-x-0 hover:bg-primary/90" />
                </div>
            </Carousel>
        </TooltipProvider>
    );
};
