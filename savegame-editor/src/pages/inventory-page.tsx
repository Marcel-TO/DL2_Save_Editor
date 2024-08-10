import { NavbarComponent } from "@/components/custom/custom-navbar-component";
import { DataTable } from "@/components/custom/data-table-component";
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
} from "@/components/ui/dropdown-menu";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { GalleryHorizontal, List, Split } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangeEvent, useState } from "react";
import { InventoryItemCard } from "@/components/custom/inventory-item-card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { invoke } from "@tauri-apps/api/tauri";
import { SettingState } from "@/models/settings-model";
import { set, useForm } from "react-hook-form";
import { z, ZodError } from "zod";
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

type InventoryPageProps = {
  currentSaveFile: SettingState<SaveFile | undefined>;
  currentIdData: SettingState<IdData[] | undefined>;
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

export const InventoryPage = ({
  currentSaveFile,
  currentIdData,
}: InventoryPageProps) => {
  const [isGalleryView, setIsGalleryView] = useState<boolean>(true);
  const [isSelectingItem, setIsSelectingItem] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem>();
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
      .multipleOf(1, { message: "Level must be a whole number" })
      .max(65535, { message: "Level must be less than 65535" })
      .positive({ message: "Level must be a positive number" }),
    seed: z.coerce
      .number()
      .multipleOf(1, { message: "Seed must be a whole number" })
      .max(65535, { message: "Seed must be less than 65535" })
      .positive({ message: "Seed must be a positive number" }),
    amount: z.coerce
      .number()
      .multipleOf(1, { message: "Amount must be a whole number" })
      .max(4294967295, { message: "Amount must be less than 4294967295" })
      .positive({ message: "Amount must be a positive number" }),
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
      name: currentItem?.name,
      level: currentItem?.chunk_data.level_value,
      seed: currentItem?.chunk_data.seed_value,
      amount: currentItem?.chunk_data.amount_value,
      durability: currentItem?.chunk_data.durability_value,
    },
  });

  async function onSubmitChangeValues(data: z.infer<typeof ItemFormSchema>) {
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
      setCurrentItemRow(currentItemRow);
      setItemRows(item_rows);
    }

    // Check whether the validation went through and it is ok to save values.
    try {
      ItemFormSchema.parse(data);
    } catch (error: any) {
      return;
    }

    await submitItemValues(
      data.name,
      data.level,
      data.seed,
      data.amount,
      data.durability,
      currentSaveFile.value
    );
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
                  <Tabs defaultValue={item_rows ? "0" : ""}>
                    <div className="flex items-center">
                      <TabsList>
                        {item_rows?.map((item_row, index) => (
                          <TabsTrigger
                            key={item_row.name}
                            value={index.toString()}
                            onClick={() => setCurrentItemRow(item_row)}
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
                              className="h-7 gap-2 text-sm"
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
                              checked={isGalleryView}
                              onClick={() => setIsGalleryView(true)}
                              className="h-7 gap-1 text-sm"
                            >
                              <GalleryHorizontal className="h-3.5 w-3.5" />
                              Gallery
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                              checked={!isGalleryView}
                              onClick={() => setIsGalleryView(false)}
                              className="h-7 gap-1 text-sm"
                            >
                              <List className="h-3.5 w-3.5" />
                              List
                            </DropdownMenuCheckboxItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    {isGalleryView ? (
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
                      <Card className="my-4">
                        {item_rows?.map((item_row, index) => (
                          <TabsContent key={index} value={index.toString()}>
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
                  <DialogTitle>Edit Item</DialogTitle>
                  {/* <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-4/5 truncate">
                          {form.getValues("name")}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>{form.getValues("name")}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider> */}
                </DialogHeader>

                <IdComboBox ids={currentIdData.value ?? []} />
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitChangeValues)}>
                  <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-8 items-center gap-4">
                          <FormLabel className="text-right col-span-2">
                            Name
                          </FormLabel>
                          <div className="col-span-6">
                            <FormControl className="">
                              <Input
                                placeholder="name"
                                {...field}
                              />
                            </FormControl>
                            <div className="px-4">
                              <FormDescription>
                                The name of the desired item.
                              </FormDescription>
                              <FormMessage />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-8 items-center gap-4">
                          <FormLabel className="text-right col-span-2">
                            Level
                          </FormLabel>
                          <div className="col-span-6">
                            <FormControl className="">
                              <Input
                                type="number"
                                placeholder="level"
                                min={0}
                                {...field}
                              />
                            </FormControl>
                            <div className="px-4">
                              <FormDescription>
                                The level of the desired item. The maximum level
                                is 9999.
                              </FormDescription>
                              <FormMessage />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="durability"
                      render={({ field }) => (
                        <FormItem className="grid grid-cols-8 items-center gap-4">
                          <FormLabel className="text-right col-span-2">
                            Durability
                          </FormLabel>
                          <div className="col-span-6">
                            <FormControl className="">
                              <Input
                                type="number"
                                placeholder="durability"
                                min={-1}
                                {...field}
                              />
                            </FormControl>
                            <div className="px-4">
                              <FormDescription>
                                The Durability of the desired item. The maximum
                                durability is 4294967295.
                              </FormDescription>
                              <FormMessage />
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                    <DialogFooter className="mr-8">
                      <Button type="submit">Save</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </>
  );
};
