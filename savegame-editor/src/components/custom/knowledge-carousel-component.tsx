import { invoke } from "@tauri-apps/api/tauri";
import {
  Carousel,
  CarouselNext,
  CarouselPrevious,
  CarouselMainContainer,
  SliderMainItem,
  CarouselThumbsContainer,
  CarouselIndicator,
} from "../ui/carousel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { ToastAction } from "@radix-ui/react-toast";
import { toast } from "../ui/use-toast";
import { Button } from "../ui/button";
import { ToastProvider } from "../ui/toast";

const knowledge: [string, string, string][] = [
  [
    "Getting Started",
    "https://marcel-to.notion.site/Getting-Started-with-the-Editor-496ffcc2b46a4f39b6e7ca04ed1b3b32",
    "/assets/pictures/backgrounds/slider-2.jpg",
  ],
  [
    "Tutorial",
    "https://marcel-to.notion.site/Tutorial-95ff57c3d2c14314b6e89613f0f14a7a",
    "/assets/pictures/backgrounds/slider-3.jpg",
  ],
  [
    "Commonly Asked Questions",
    "https://marcel-to.notion.site/Commonly-asked-Questions-QnA-5c05da103a304c3e99b9bc024c35cf7d",
    "/assets/pictures/backgrounds/slider-4.jpg",
  ],
  [
    "Prerequisites for Programming",
    "https://marcel-to.notion.site/Prerequisites-for-Programming-bcd84864e7e4454283bac25d619015e7",
    "/assets/pictures/backgrounds/slider-5.jpg",
  ],
  [
    "The Editor in Detail: Frontend",
    "https://marcel-to.notion.site/The-Editor-in-Detail-Frontend-9c72b33073eb43c2acfbf9210ff80c71",
    "/assets/pictures/backgrounds/slider-2.jpg",
  ],
  [
    "Video Tutorial",
    "https://youtu.be/BfgnVI4v-Jo?si=onXnwUkU9Oc7HEf",
    "/assets/pictures/backgrounds/slider-6.jpg",
  ],
  [
    "Feature Release Plan",
    "https://github.com/users/Marcel-TO/projects/2/views/2",
    "/assets/pictures/backgrounds/slider-7.jpg",
  ],
];

export const KnowledgeCarouselComponent = () => {
  const handleSelectKnowledge = async (title: string, link: string) => {
    await invoke("open_knowledge_window", {
      url: link,
      name: title
    }).catch((err) => {
      toast({
        title: "Uh oh! Something went wrong.",
        description:
          err ?? "An error occured while trying to open a knowledge link.",
        action: (
          <ToastAction
            altText="Try again"
          >
            Try again
          </ToastAction>
        ),
      });
      return;
    });
  }

  return (
    <TooltipProvider>

    <Carousel carouselOptions={{ loop: true }}>
      <CarouselNext className="scale-150 bg-card/70"/>
      <CarouselPrevious className="scale-150 bg-card/70"/>
      <div className="relative h-full">
        <CarouselMainContainer className="h-[80vh]">
          {knowledge.map(([title, link, backgroundImage]) => (
            <SliderMainItem key={title} className="relative size-full flex items-center justify-center rounded-xl bg-transparent h-full overflow-hidden">
              <Tooltip>
                {/* <TooltipTrigger className="absolute transition-all hover:scale-110 hover:shadow-2xl hover:shadow-primary"> */}
                <TooltipTrigger className="absolute transition-all hover:scale-110 hover:shadow-2xl hover:shadow-primary">
                <Button
                  onClick={() => handleSelectKnowledge(title, link)}
                  className={"roundex-xl bg-card/70 text-7xl text-card/70 font-drip hover:bg-primary hover:text-primary-foreground"}
                >
                  {title}
                </Button>
                </TooltipTrigger>
                <TooltipContent>{title}</TooltipContent>
              </Tooltip>

              <img
                className="w-full h-full aspect-video"
                src={backgroundImage}
              />
            </SliderMainItem>
          ))}
          <ToastProvider/>
        </CarouselMainContainer>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          <CarouselThumbsContainer className="gap-x-1">
            {Array.from({ length: knowledge.length }).map((_, index) => (
              <CarouselIndicator key={index} index={index} className="h-[3vh] w-[4vh]"/>
            ))}
          </CarouselThumbsContainer>
        </div>
      </div>
    </Carousel>
    </TooltipProvider>
  );
};
