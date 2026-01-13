import { invoke } from "@tauri-apps/api/core";
import {
    Carousel,
    CarouselNext,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const knowledge: [string, string, string][] = [
    [
        "Getting Started",
        "https://marcel-to.vercel.app/projects/dl2-save-editor/getting-started",
        "/assets/pictures/backgrounds/slider-2.jpg",
    ],
    [
        "Tutorial",
        "https://marcel-to.vercel.app/projects/dl2-save-editor/tutorial",
        "/assets/pictures/backgrounds/slider-3.jpg",
    ],
    [
        "Commonly Asked Questions",
        "https://marcel-to.vercel.app/projects/dl2-save-editor/qna",
        "/assets/pictures/backgrounds/slider-4.jpg",
    ],
    [
        "Prerequisites for Programming",
        "https://marcel-to.vercel.app/projects/dl2-save-editor/prerequisites-for-programming",
        "/assets/pictures/backgrounds/slider-5.jpg",
    ],
    [
        "The Editor in Detail: Frontend",
        "https://marcel-to.vercel.app/projects/dl2-save-editor/editor-in-detail-frontend",
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
            toast.error("Uh oh! Something went wrong.", {
                description:
                    err ?? "An error occured while trying to open a knowledge link.",
                duration: 8000,
                action: (
                    <Button
                        variant="outline"
                    >
                        Try again
                    </Button>
                ),
            });
            return;
        });
    }

    return (
        <TooltipProvider>
            <Carousel opts={{ loop: true }} className="w-full">
                <div>
                    <CarouselContent
                        className="h-[80vh]"
                    >
                        {knowledge.map(([title, link, backgroundImage]) => (
                            <CarouselItem key={title} className="flex justify-center items-center overflow-hidden ">
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
                                    className="w-full h-full aspect-video object-cover rounded-xl"
                                    src={backgroundImage}
                                />
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
