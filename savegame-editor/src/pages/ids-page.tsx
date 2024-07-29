import { NavbarComponent } from "@/components/custom/custom-navbar-component";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const IDsPage = () => {
  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <NavbarComponent />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <main className="grid flex-1 items-start gap-4 p-4">
            <div>
              <h1 className="text-3xl font-semibold mb-4">IDs Page</h1>

              <div className="flex align-center justify-center w-full h-full">
                    <Card className="">
                      <CardHeader>
                        <CardTitle>There is nothing to see here</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-center">
                          Hold on, we're still working on this page. Please ignore it for now.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};
