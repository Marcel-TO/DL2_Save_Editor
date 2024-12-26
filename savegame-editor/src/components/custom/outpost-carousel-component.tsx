import {
  Carousel,
  CarouselNext,
  CarouselPrevious,
  CarouselMainContainer,
  SliderMainItem,
  CarouselThumbsContainer,
  CarouselIndicator,
} from "../ui/carousel";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Button } from "../ui/button";
import { ToastProvider } from "../ui/toast";
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
  const handleSelectTemplate = async (saveFile: SaveFile) => {
    currentSaveFile.setValue(saveFile);
    navigate("/main");
  };

  return (
    <TooltipProvider>
      <Carousel carouselOptions={{ loop: true }}>
        <CarouselNext className="scale-150 bg-card/70" />
        <CarouselPrevious className="scale-150 bg-card/70" />
        <div className="relative h-full">
          <CarouselMainContainer className="h-[80vh]">
            {outpostSaves.map((save, index) => (
              <SliderMainItem
                key={save.save_file.path}
                className="relative size-full flex items-center justify-center rounded-xl bg-transparent h-full overflow-hidden"
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
                  className="w-full h-full aspect-video"
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
              </SliderMainItem>
            ))}
            <ToastProvider />
          </CarouselMainContainer>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <CarouselThumbsContainer className="gap-x-1">
              {Array.from({ length: outpostSaves.length }).map((_, index) => (
                <CarouselIndicator
                  key={index}
                  index={index}
                  className="h-[3vh] w-[4vh]"
                />
              ))}
            </CarouselThumbsContainer>
          </div>
        </div>
      </Carousel>
    </TooltipProvider>
  );
};
