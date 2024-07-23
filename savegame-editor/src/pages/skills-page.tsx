import { NavbarComponent } from "@/components/custom/custom-navbar-component";

export const SkillsPage = () => {
  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <NavbarComponent />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <main className="grid flex-1 items-start gap-4 p-4">
            <div>
              <h1 className="text-3xl font-semibold mb-4">Skills Page</h1>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};
