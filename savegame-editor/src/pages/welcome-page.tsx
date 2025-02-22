import { NavbarComponent } from "@/components/custom/custom-navbar-component";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTheme } from "@/components/ui/theme-provider";
import { AppSettings } from "@/models/settings-model";
import { useNavigate } from "react-router-dom";

type WelcomePageProps = {
  appSettings: AppSettings;
};

export const WelcomePage = ({ appSettings }: WelcomePageProps) => {
  const { setTheme } = useTheme();
  const navigate = useNavigate();

  const handleContinueWithEditor = () => {
    setTheme(appSettings.theme.value);
    navigate("/main");
  };

  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <NavbarComponent />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <main className="grid flex-1 items-start gap-4 p-4">
            <div>
              <h1 className="text-3xl font-semibold mb-4">Welcome</h1>

              <Dialog open={true}>
                <DialogContent className="bg-card/70">
                  <DialogHeader>
                    <DialogTitle>
                      Welcome to the Dying Light 2 Save Editor
                    </DialogTitle>
                  </DialogHeader>
                  <DialogDescription>
                    This tool allows you to take control of your game save,
                    unlocking a realm of possibilities and customization. It is
                    fully open source, so if you like to change something or
                    want to collaborate to improve the experience for all, feel
                    free to do so.
                  </DialogDescription>
                  <DialogFooter>
                    <Button
                      onClick={handleContinueWithEditor}
                      variant="outline"
                    >
                      Load settings and start Editing
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};
