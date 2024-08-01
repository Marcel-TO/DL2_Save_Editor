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
import { GalleryHorizontal, List, Split } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { InventoryItemCard } from "@/components/custom/inventory-item-card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [isGalleryView, setIsGalleryView] = useState<boolean>(false);
  const [isSelectingItem, setIsSelectingItem] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem>();

  const handleSelectItem = (item: InventoryItem) => {
    setCurrentItem(item);
    console.log(item);
    setIsSelectingItem(true);
  };

  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
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
                          <TabsTrigger
                            key={item_row.name}
                            value={index.toString()}
                          >
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
                              {isGalleryView ? (
                                <GalleryHorizontal className="h-3.5 w-3.5" />
                              ) : (
                                <List className="h-3.5 w-3.5" />
                              )}
                              <span className="sr-only sm:not-sr-only">
                                View
                              </span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>View Items as</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem
                              checked={!isGalleryView}
                              onClick={() => setIsGalleryView(false)}
                              className="h-7 gap-1 text-sm"
                            >
                              <List className="h-3.5 w-3.5" />
                              List
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                              checked={isGalleryView}
                              onClick={() => setIsGalleryView(true)}
                              className="h-7 gap-1 text-sm"
                            >
                              <GalleryHorizontal className="h-3.5 w-3.5" />
                              Gallery
                            </DropdownMenuCheckboxItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    {isGalleryView ? (
                      <>
                        {item_rows?.map((item_row, index) => (
                          <TabsContent
                            key={item_row.name}
                            value={index.toString()}
                          >
                            <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4 px-8 sm:px-4 md:px-6 lg:px-8">
                              {item_row.inventory_items.map(
                                (item: InventoryItem) => (
                                  <InventoryItemCard
                                    item={item}
                                    executeAction={handleSelectItem}
                                  />
                                )
                              )}
                            </div>
                          </TabsContent>
                        ))}
                      </>
                    ) : (
                      <Card className="my-4">
                        {item_rows?.map((item_row, index) => (
                          <TabsContent
                            key={item_row.name}
                            value={index.toString()}
                          >
                            <DataTable
                              columns={columns}
                              data={item_row.inventory_items}
                              executeFunctionForRow={handleSelectItem}
                            />
                          </TabsContent>
                        ))}
                      </Card>
                    )}
                  </Tabs>
                </>
              ) : (
                <>
                  <div className="flex justify-center">
                    <Card className="">
                      <CardHeader>
                        <CardTitle>There is nothing to see here</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-center">
                          No inventory items found. Please make sure that you
                          have loaded a valid save file.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>

            <Dialog open={isSelectingItem} onOpenChange={setIsSelectingItem}>
              <DialogContent className="w-1/3">
                <DialogHeader>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-4/5 truncate">
                          {currentItem?.name}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>{currentItem?.name}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </DialogHeader>
                <div className="grid gap-4 py-4 mr-8">
                  <div className="grid grid-cols-8 items-center gap-4">
                    <Label htmlFor="level" className="text-right">
                      Level
                    </Label>
                    <Input
                      id="level"
                      value={currentItem?.chunk_data.level_value}
                      className="col-span-7"
                    />
                  </div>
                  <div className="grid grid-cols-8 items-center gap-2">
                    <Label htmlFor="seed" className="text-right col-span-1">
                      Seed
                    </Label>
                    <Input
                      id="seed"
                      value={currentItem?.chunk_data.seed_value}
                      className="col-span-6"
                    />
                    <Button className="col-span-1" variant="outline" size="sm">
                      <Split className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-8 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      Amount
                    </Label>
                    <Input
                      id="amount"
                      value={currentItem?.chunk_data.amount_value}
                      className="col-span-7"
                    />
                  </div>
                  <div className="grid grid-cols-8 items-center gap-4">
                    <Label htmlFor="durability" className="text-right">
                      Durability
                    </Label>
                    <Input
                      id="durability"
                      value={currentItem?.chunk_data.durability_value}
                      className="col-span-7"
                    />
                  </div>
                </div>
                <DialogFooter className="mr-8">
                  <DialogClose asChild>
                    <Button onClick={() => setIsSelectingItem(false)}>
                      Save
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </>
  );
};
