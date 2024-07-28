import { NavbarComponent } from "@/components/custom/custom-navbar-component";
import { DataTable } from "@/components/custom/data-table-component";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkillItem, Skills } from "@/models/save-models";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { SortAsc } from "lucide-react";

type SkillsPageProps = {
  skills?: Skills;
};

export const columns: ColumnDef<SkillItem>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "points_value",
    header: "Value",
  },
  {
    accessorKey: "points_data",
    header: "Value (HEX)",
  },
];

export const SkillsPage = ({ skills }: SkillsPageProps) => {
  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <NavbarComponent />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <main className="grid flex-1 items-start gap-4 p-4">
            <div>
              <h1 className="text-3xl font-semibold mb-4">Skills Page</h1>

              <Tabs defaultValue="base">
                <div className="flex items-center">
                  <TabsList>
                    <TabsTrigger value="base">Base Skills</TabsTrigger>
                    <TabsTrigger value="legend">Legend Skills</TabsTrigger>
                  </TabsList>

                  <div className="ml-auto flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1 text-sm"
                        >
                          <SortAsc className="h-3.5 w-3.5" />
                          <span className="sr-only sm:not-sr-only">Sort</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem checked>
                          save order
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem>
                          alphabetical
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="bg-card">
                  <TabsContent value="base">
                    <DataTable
                      columns={columns}
                      data={skills ? skills.base_skills : []}
                    />
                  </TabsContent>
                  <TabsContent value="legend">
                    <DataTable
                      columns={columns}
                      data={skills ? skills.legend_skills : []}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};
