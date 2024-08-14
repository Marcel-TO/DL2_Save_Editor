import {
  Carousel,
  CarouselNext,
  CarouselPrevious,
  CarouselMainContainer,
  SliderMainItem,
  CarouselThumbsContainer,
  CarouselIndicator,
} from "../ui/carousel";

export const KnowledgeCarouselComponent = () => {
  const knowledge: [string, string, string][] = [
    [
      "Getting Started",
      "https://marcel-to.notion.site/Getting-Started-with-the-Editor-496ffcc2b46a4f39b6e7ca04ed1b3b32",
      "slider-2.jpg",
    ],
    [
      "Tutorial",
      "https://marcel-to.notion.site/Tutorial-95ff57c3d2c14314b6e89613f0f14a7a",
      "slider-3.jpg",
    ],
    [
      "Commonly Asked Questions",
      "https://marcel-to.notion.site/Commonly-asked-Questions-QnA-5c05da103a304c3e99b9bc024c35cf7d",
      "slider-4.jpg",
    ],
    [
      "Prerequisites for Programming",
      "https://marcel-to.notion.site/Prerequisites-for-Programming-bcd84864e7e4454283bac25d619015e7",
      "slider-5.jpg",
    ],
    [
      "The Editor in Detail: Frontend",
      "https://marcel-to.notion.site/The-Editor-in-Detail-Frontend-9c72b33073eb43c2acfbf9210ff80c71",
      "slider-2.jpg",
    ],
    [
      "Video Tutorial",
      "https://youtu.be/BfgnVI4v-Jo?si=onXnwUkU9Oc7HEf",
      "slider-6.jpg",
    ],
    [
      "Feature Release Plan",
      "https://github.com/users/Marcel-TO/projects/2/views/2",
      "slider-7.jpg",
    ],
  ];

  return (
    <Carousel carouselOptions={{ loop: true }}>
      <CarouselNext />
      <CarouselPrevious />
      <div className="relative h-full">
        <CarouselMainContainer className="h-[80vh]">
          {knowledge.map(([title, link, backgroundImage]) => (
            <SliderMainItem key={title} className="bg-transparent h-full">
              <a
                href={link}
                target="_blank"
                rel="noreferrer"
                // className={`outline outline-1 outline-border size-full flex items-center justify-center rounded-xl bg-[url('/assets/pictures/backgrounds/${backgroundImage}')] h-full`}
                className={`outline outline-1 outline-border size-full flex items-center justify-center rounded-xl bg-[url('/assets/pictures/backgrounds/slider-2.jpg')] h-full`}
              >
                {title}
              </a>
            </SliderMainItem>
          ))}
        </CarouselMainContainer>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
          <CarouselThumbsContainer className="gap-x-1">
            {Array.from({ length: knowledge.length }).map((_, index) => (
              <CarouselIndicator key={index} index={index} className="h-[2vh]"/>
            ))}
          </CarouselThumbsContainer>
        </div>
      </div>
    </Carousel>
  );
};
