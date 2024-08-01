import { NavbarComponent } from "@/components/custom/custom-navbar-component";
import { DataTable } from "@/components/custom/data-table-component";
import { UnlockableItem } from "@/models/save-models";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type UnlockablesPageProps = {
  unlockables?: UnlockableItem[];
};

export const columns: ColumnDef<UnlockableItem>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "index",
    header: "Index",
  },
];

export const UnlockablesPage = ({ unlockables }: UnlockablesPageProps) => {
  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <NavbarComponent />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <main className="grid flex-1 items-start gap-4 p-4">
            <div>
              <h1 className="text-3xl font-semibold mb-4">Unlockables Page</h1>

              {unlockables ? (
                <Card className="my-4">
                  <DataTable
                    columns={columns}
                    data={unlockables ? unlockables : []}
                  />
                </Card>
              ) : (
                <>
                  <div className="flex align-center justify-center w-full h-full">
                    <Card className="">
                      <CardHeader>
                        <CardTitle>There is nothing to see here</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-center">
                          No Unlockables found. Please make sure that you have
                          loaded a valid save file.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};
