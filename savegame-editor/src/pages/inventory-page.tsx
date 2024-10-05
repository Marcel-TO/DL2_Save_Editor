import { NavbarComponent } from "@/components/custom/custom-navbar-component";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IdData,
  InventoryItem,
  InventoryItemRow,
  Mod,
  SaveFile,
} from "@/models/save-models";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  ChevronsUpDown,
  GalleryHorizontal,
  List,
  Split,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { InventoryItemCard } from "@/components/custom/inventory-item-card";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { invoke } from "@tauri-apps/api/tauri";
import {
  AppSettings,
  DefaultItemLayout,
  SettingState,
} from "@/models/settings-model";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { IdComboBox } from "@/components/custom/item-id-combobox-component";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
} from "@/components/ui/sheet";
import { ColumnDef, CellContext } from "@tanstack/react-table";
import { DataTable } from "@/components/custom/data-table-component";

type InventoryPageProps = {
  currentSaveFile: SettingState<SaveFile | undefined>;
  currentIdData: SettingState<IdData[] | undefined>;
  appSettings: AppSettings;
};

export const columns: ColumnDef<InventoryItem>[] = [
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
    accessorKey: "level",
    accessorFn: (row) => row.chunk_data.level_value,
    header: "Level",
  },
  {
    accessorKey: "seed",
    accessorFn: (row) => row.chunk_data.seed_value,
    header: "Seed",
  },
  {
    accessorKey: "amount",
    accessorFn: (row) => row.chunk_data.amount_value,
    header: "Amount",
  },
  {
    accessorKey: "durability",
    accessorFn: (row) => row.chunk_data.durability_value,
    header: "Durability",
  },
  {
    accessorKey: "mods",
    accessorFn: (row) => row.mod_data,
    header: "Mods",
    cell: ({ getValue }: CellContext<InventoryItem, any>) => {
      const modData = getValue() as Mod[];
      return modData.length;
    },
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
  {
    accessorKey: "chunk_offset",
    accessorFn: (row) => row.chunk_data.index,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Chunk Offset
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue("chunk_offset")}</div>,
  },
];

export const InventoryPage = ({
  currentSaveFile,
  currentIdData,
  appSettings,
}: InventoryPageProps) => {
  const [itemView, setItemView] = useState<DefaultItemLayout>(
    appSettings.defaultItemLayout.value
  );
  const [isSelectingItem, setIsSelectingItem] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem>();
  const [currentItemData, setCurrentItemData] = useState<InventoryItem[]>();
  const [currentItemRow, setCurrentItemRow] = useState<InventoryItemRow>();
  const [item_rows, setItemRows] = useState<InventoryItemRow[]>(
    currentSaveFile.value?.items ?? []
  );
  // initialize the current item values
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(0);

  // initialize the current item values and their requriements
  const ItemFormSchema = z.object({
    name: z.string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
    }),
    level: z.coerce
      .number()
      .gte(0, { message: "Level must be a positive number" })
      .max(65535, { message: "Level must be less than 65535" }),
    seed: z.coerce
      .number()
      .gte(0, { message: "Seed must be a positive number" })
      .max(65535, { message: "Seed must be less than 65535" }),
    amount: z.coerce
      .number()
      .gte(0, { message: "Amount must be a positive number" })
      .max(4294967295, { message: "Amount must be less than 4294967295" }),
    durability: z.coerce
      .number()
      .max(4294967295, { message: "Durability must be less than 4294967295" }),
  });

  const handleSelectItem = (item: InventoryItem, index: number) => {
    setCurrentItem(item);
    setIsSelectingItem(true);
    setCurrentItemIndex(index);
    form.setValue("name", item.name);
    form.setValue("level", item.chunk_data.level_value);
    form.setValue("seed", item.chunk_data.seed_value);
    form.setValue("amount", item.chunk_data.amount_value);
    form.setValue("durability", item.chunk_data.durability_value);
  };

  const form = useForm<z.infer<typeof ItemFormSchema>>({
    resolver: zodResolver(ItemFormSchema),
    defaultValues: {
      name: currentItem ? currentItem.name : "",
      level: currentItem ? currentItem.chunk_data.level_value : 0,
      seed: currentItem ? currentItem.chunk_data.seed_value : 0,
      amount: currentItem ? currentItem.chunk_data.amount_value : 0,
      durability: currentItem ? currentItem.chunk_data.durability_value : 0,
    },
  });

  async function onSubmitChangeValues(data: z.infer<typeof ItemFormSchema>) {
    // Check whether the validation went through and it is ok to save values.
    try {
      ItemFormSchema.parse(data);
    } catch (error: any) {
      return;
    }

    form.setValue("name", data.name);
    form.setValue("level", Number(data.level));
    form.setValue("seed", data.seed);
    form.setValue("amount", data.amount);
    form.setValue("durability", data.durability);

    // Rewrite locally for performance reasons.
    if (currentItemRow?.inventory_items != undefined) {
      currentItemRow.inventory_items[currentItemIndex].name = data.name;
      currentItemRow.inventory_items[currentItemIndex].chunk_data.level_value =
        data.level;
      currentItemRow.inventory_items[currentItemIndex].chunk_data.seed_value =
        data.seed;
      currentItemRow.inventory_items[currentItemIndex].chunk_data.amount_value =
        data.amount;
      currentItemRow.inventory_items[
        currentItemIndex
      ].chunk_data.durability_value = data.durability;
    }

    await submitItemValues(
      data.name,
      data.level,
      data.seed,
      data.amount,
      data.durability,
      currentSaveFile.value
    );

    setCurrentItemRow(currentItemRow);
    setItemRows(item_rows);
    setIsSelectingItem(false);
  }

  async function submitItemValues(
    itemName: string,
    levelValue: number,
    seedValue: number,
    amountValue: number,
    durabilityValue: number,
    saveFile?: SaveFile
  ) {
    invoke<Uint8Array>("handle_edit_item_chunk", {
      current_item_index: currentItem?.index,
      new_id: itemName,
      current_item_chunk_index: currentItem?.chunk_data.index,
      current_item_size: currentItem?.size,
      new_level: levelValue,
      new_seed: seedValue,
      new_amount: amountValue,
      new_durability: durabilityValue,
      save_file_content: currentSaveFile.value?.file_content,
    })
      .then((new_save_content) => {
        if (saveFile != undefined && currentItemRow != undefined) {
          saveFile.file_content = new_save_content;

          for (let i = 0; i < item_rows.length; i++) {
            if (
              currentItemRow.name == item_rows[i].name &&
              currentItemRow.inventory_items.length ==
                item_rows[i].inventory_items.length
            ) {
              item_rows[i] = currentItemRow;
              setItemRows(item_rows);
              setCurrentItemData(undefined);
              setTimeout(() => {
                setCurrentItemData(currentItemRow.inventory_items);
              }, 1);
              console.log("Updated Data");
              saveFile.items = item_rows;
              currentSaveFile.setValue(saveFile);
              return;
            }
          }
        }
      })
      .catch((err) => {
        console.error(err);
        toast({
          title: "Uh oh! Something went wrong. :/",
          description:
            "The Editor stumbled accross the following error: " + err,
        });
        return;
      });
  }

  const generateRandomSeed = () => {
    const min = 10000; // Minimum 5-digit value
    const max = 65334; // Maximum 5-digit value (exclusive)

    const randomValue = Math.floor(Math.random() * (max - min) + min);
    form.setValue("seed", randomValue);
  };

  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <NavbarComponent />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <main className="grid flex-1 items-start gap-4 p-4">
            <div>
              <h1 className="text-3xl font-semibold mb-4">Inventory Page</h1>
              {currentSaveFile.value ? (
                <>
                  <Tabs>
                    <div className="flex items-center">
                      <TabsList>
                        {item_rows?.map((item_row, index) => (
                          <TabsTrigger
                            key={index}
                            value={index.toString()}
                            onClick={() => {
                              setCurrentItemRow(item_row);
                              setCurrentItemData(item_row.inventory_items);
                            }}
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
                              className="h-7 gap-2 text-sm bg-card/50"
                            >
                              {itemView === "grid" ? (
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
                              checked={itemView === "grid"}
                              onClick={() => setItemView("grid")}
                              className="h-7 gap-1 text-sm"
                            >
                              <GalleryHorizontal className="h-3.5 w-3.5" />
                              Gallery
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                              checked={itemView === "list"}
                              onClick={() => setItemView("list")}
                              className="h-7 gap-1 text-sm"
                            >
                              <List className="h-3.5 w-3.5" />
                              List
                            </DropdownMenuCheckboxItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    {itemView === "grid" ? (
                      <>
                        {item_rows?.map((item_row, index) => (
                          <TabsContent key={index} value={index.toString()}>
                            <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4 px-8 sm:px-4 md:px-6 lg:px-8">
                              {item_row.inventory_items.map(
                                (item: InventoryItem, index: number) => (
                                  <InventoryItemCard
                                    key={index}
                                    item={item}
                                    itemIndex={index}
                                    executeAction={handleSelectItem}
                                  />
                                )
                              )}
                            </div>
                          </TabsContent>
                        ))}
                      </>
                    ) : (
                      <>
                        {item_rows?.map((item_row, index) => (
                          <TabsContent key={index} value={index.toString()}>
                            <DataTable
                              title={item_row.name}
                              counter_description="Items"
                              columns={columns}
                              data={currentItemData ?? []}
                              executeFunctionForRow={handleSelectItem}
                            />
                          </TabsContent>
                        ))}
                      </>
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

            <Sheet open={isSelectingItem} onOpenChange={setIsSelectingItem}>
              <TooltipProvider>
                <SheetContent>
                  <SheetHeader className="my-6">Edit Item</SheetHeader>

                  <IdComboBox
                    ids={currentIdData.value ?? []}
                    currentSelected={form.getValues("name")}
                    setCurrentSelected={(id: string) =>
                      form.setValue("name", id)
                    }
                  />

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitChangeValues)}>
                      <FormField
                        control={form.control}
                        name="level"
                        render={({ field }) => (
                          <FormItem className="grid grid-cols-8 grid-rows-2 items-center gap-x-2 my-4">
                            <FormLabel className="text-right col-span-2">
                              Level
                            </FormLabel>
                            <FormControl className="col-span-6">
                              <Input
                                type="number"
                                placeholder="level"
                                min={0}
                                {...field}
                              />
                            </FormControl>
                            <div className="col-span-6 col-start-3">
                              <FormDescription>
                                The level of the desired item. The maximum level
                                is 65534.
                              </FormDescription>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="seed"
                        render={({ field }) => (
                          <FormItem className="grid grid-cols-8 grid-rows-2 items-center gap-x-2 my-4">
                            <FormLabel className="text-right col-span-2">
                              Seed
                            </FormLabel>
                            <FormControl className="col-span-4">
                              <Input
                                type="number"
                                placeholder="seed"
                                min={0}
                                {...field}
                              />
                            </FormControl>
                            <Tooltip>
                              <TooltipTrigger className="col-span-2">
                                <Button
                                  onClick={() => generateRandomSeed()}
                                  variant="outline"
                                  className="col-span-2 m-0 p-0 w-full"
                                  type="button"
                                >
                                  <Split className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Generate a random seed value.
                              </TooltipContent>
                            </Tooltip>
                            <div className="col-span-6 col-start-3">
                              <FormDescription>
                                The seed of the desired item. The maximum seed
                                is 65534.
                              </FormDescription>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem className="grid grid-cols-8 grid-rows-2 items-center gap-x-2 my-4">
                            <FormLabel className="text-right col-span-2">
                              Amount
                            </FormLabel>
                            <FormControl className="col-span-4">
                              <Input
                                type="number"
                                placeholder="amount"
                                min={0}
                                {...field}
                              />
                            </FormControl>
                            <DropdownMenu>
                              <DropdownMenuTrigger className="col-span-2">
                                <Button
                                  variant="outline"
                                  className="col-span-2 w-full m-0 p-0"
                                  type="button"
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  onSelect={() => form.setValue("amount", 0)}
                                >
                                  0
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => form.setValue("amount", 999)}
                                >
                                  999
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() => form.setValue("amount", 9999)}
                                >
                                  9999
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() =>
                                    form.setValue("amount", 999999)
                                  }
                                >
                                  999999
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <div className="col-span-6 col-start-3">
                              <FormDescription>
                                The maximum amount is 4294967295. But use higher
                                values than the game allows at your own risk.
                              </FormDescription>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="durability"
                        render={({ field }) => (
                          <FormItem className="grid grid-cols-8 grid-rows-2 items-center gap-x-2 my-4">
                            <FormLabel className="text-right col-span-2">
                              Durability
                            </FormLabel>
                            <FormControl className="col-span-4">
                              <Input
                                type="number"
                                placeholder="durability"
                                {...field}
                              />
                            </FormControl>
                            <DropdownMenu>
                              <DropdownMenuTrigger className="col-span-2">
                                <Button
                                  variant="outline"
                                  className="col-span-2 w-full m-0 p-0"
                                  type="button"
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  onSelect={() =>
                                    form.setValue("durability", -1.0)
                                  }
                                >
                                  -1.0
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() =>
                                    form.setValue("durability", 0)
                                  }
                                >
                                  0
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() =>
                                    form.setValue("durability", 9999)
                                  }
                                >
                                  9999
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() =>
                                    form.setValue("durability", 999999)
                                  }
                                >
                                  999999
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <div className="col-span-6 col-start-3">
                              <FormDescription>
                                The maximum durability is 4294967295. But use
                                higher values than the game allows at your own
                                risk.
                              </FormDescription>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <SheetFooter className="my-6">
                        <Button
                          className="w-full"
                          onClick={() => form.trigger()}
                        >
                          Save
                        </Button>
                      </SheetFooter>
                    </form>
                  </Form>
                </SheetContent>
              </TooltipProvider>
            </Sheet>
          </main>
        </div>
      </div>
    </>
  );
};
