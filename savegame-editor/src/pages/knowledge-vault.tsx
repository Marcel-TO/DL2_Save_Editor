import { NavbarComponent } from "@/components/custom/custom-navbar-component";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Carousel, CarouselIndicator, CarouselMainContainer, CarouselNext, CarouselPrevious, CarouselThumbsContainer, SliderMainItem } from "@/components/ui/carousel";

export const KnowledgeVaultPage = () => {
  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <NavbarComponent />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 flex-1">
          <main className="grid flex-1 items-start gap-4 p-4">
            <div className="flex-1">
              <h1 className="text-3xl font-semibold mb-4">Knowledge Vault Page</h1>

              <Carousel>
                <CarouselNext />
                <CarouselPrevious />
                <div className="relative h-full">
                  <CarouselMainContainer className="h-[80vh]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <SliderMainItem key={index} className="bg-transparent h-full">
                        <div className="outline outline-1 outline-border size-full flex items-center justify-center rounded-xl bg-background h-full">
                          Slide {index + 1}
                        </div>
                      </SliderMainItem>
                    ))}
                  </CarouselMainContainer>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                    <CarouselThumbsContainer className="gap-x-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <CarouselIndicator key={index} index={index} />
                      ))}
                    </CarouselThumbsContainer>
                  </div>
                </div>
              </Carousel>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};