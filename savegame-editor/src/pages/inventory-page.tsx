import { NavbarComponent } from "@/components/custom/custom-navbar-component";
import { DataTable } from "@/components/custom/data-table-component";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryItem, InventoryItemRow, Mod } from "@/models/save-models";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { SortAsc } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type InventoryPageProps = {
  item_rows?: InventoryItemRow[];
};

export const columns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "chunk_data.level_value",
    header: "Level",
  },
  {
    accessorKey: "chunk_data.seed_value",
    header: "Seed",
  },
  {
    accessorKey: "chunk_data.amount_value",
    header: "Amount",
  },
  {
    accessorKey: "chunk_data.durability_value",
    header: "Durability",
  },
  {
    accessorKey: "mod_data",
    header: "Mods",
    cell: ({ getValue }: CellContext<InventoryItem, any>) => {
      const modData = getValue() as Mod[];
      return modData.length;
    },
  },
];

export const InventoryPage = ({ item_rows }: InventoryPageProps) => {
  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <NavbarComponent />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <main className="grid flex-1 items-start gap-4 p-4">
            <div>
              <h1 className="text-3xl font-semibold mb-4">Inventory Page</h1>

              {item_rows ? (
                <>
                <Tabs defaultValue={item_rows ? "0" : ""}>
                <div className="flex items-center">
                  <TabsList>
                    {item_rows?.map((item_row, index) => (
                      <TabsTrigger key={item_row.name} value={index.toString()}>
                        {item_row.name}
                      </TabsTrigger>
                    ))}
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
                <Card className="my-4">
                  {item_rows?.map((item_row, index) => (
                    <TabsContent key={item_row.name} value={index.toString()}>
                      <DataTable
                        columns={columns}
                        data={item_row.inventory_items}
                      />
                    </TabsContent>
                  ))}
                </Card>
              </Tabs>
                </>
              ) : (
                <>
                  <div className="flex align-center justify-center w-full h-full">
                    <Card className="">
                      <CardHeader>
                        <CardTitle>There is nothing to see here</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-center">
                          No inventory items found. Please make sure that you have loaded a valid save file.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )
              }
              
            </div>
          </main>
        </div>
      </div>
    </>
  );
};
