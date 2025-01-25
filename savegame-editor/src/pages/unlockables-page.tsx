import { NavbarComponent } from "@/components/custom/custom-navbar-component";
import { DataTable } from "@/components/custom/data-table-component";
import { UnlockableItem } from "@/models/save-models";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronsUpDown } from "lucide-react";

type UnlockablesPageProps = {
  unlockables?: UnlockableItem[];
};

export const columns: ColumnDef<UnlockableItem>[] = [
  {
    accessorKey: "name",
    accessorFn: (row) => row.name,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "offset",
    accessorFn: (row) => row.index,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Offset
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("offset")}</div>,
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
                <DataTable columns={columns} data={unlockables} />
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
