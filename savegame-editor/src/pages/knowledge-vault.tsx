import { NavbarComponent } from "@/components/custom/custom-navbar-component";
import { KnowledgeCarouselComponent } from "@/components/custom/knowledge-carousel-component";

export const KnowledgeVaultPage = () => {
  
  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <NavbarComponent />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 flex-1">
          <main className="grid flex-1 items-start gap-4 p-4">
            <div className="flex-1">
              <h1 className="text-3xl font-semibold mb-4">Knowledge Vault Page</h1>

              <KnowledgeCarouselComponent />
            </div>
          </main>
        </div>
      </div>
    </>
  );
};