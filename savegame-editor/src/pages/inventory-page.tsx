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
import { ItemIdComboboxComponent } from "@/components/custom/item-id-combobox-component";

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
  const [isGalleryView, setIsGalleryView] = useState<boolean>(false);
  const [isSelectingItem, setIsSelectingItem] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem>();
  const [currentItemRow, setCurrentItemRow] = useState<InventoryItemRow>();
  const [item_rows, setItemRows] = useState<InventoryItemRow[]>(currentSaveFile.value?.items ?? []);

  // initialize the current item values
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(0);
  const [currentSelectedItemName, setCurrentSelectedItemName] =
    useState<string>("");
  const [currentSelectedItemLevel, setCurrentSelectedItemLevel] =
    useState<string>("0");
  const [currentSelectedItemSeed, setCurrentSelectedItemSeed] =
    useState<string>("0");
  const [currentSelectedItemAmount, setCurrentSelectedItemAmount] =
    useState<string>("0");
  const [currentSelectedItemDurability, setCurrentSelectedItemDurability] =
    useState<string>("0");

  const handleSelectItem = (item: InventoryItem, index: number) => {
    setCurrentItem(item);
    setIsSelectingItem(true);
    setCurrentItemIndex(index);
    setCurrentSelectedItemName(item.name);
    setCurrentSelectedItemLevel(item.chunk_data.level_value.toString());
    setCurrentSelectedItemSeed(item.chunk_data.seed_value.toString());
    setCurrentSelectedItemAmount(item.chunk_data.amount_value.toString());
    setCurrentSelectedItemDurability(
      item.chunk_data.durability_value.toString()
    );
  };

  const handleLevelValue = (event: ChangeEvent<HTMLInputElement>) => {
    const maxValue = 65535;

    // Allow only numbers
    var value = event.target.value.replace(/[^0-9]/g, "");

    // Check Max Range
    if (Number(value) > maxValue) {
      value = maxValue.toString();
    }

    // If the input is empty, set it to '0'
    if (value === "") {
      setCurrentSelectedItemLevel("0");
    } else if (value.charAt(0) === "0") {
      setCurrentSelectedItemLevel(value.substring(1));
    } else {
      setCurrentSelectedItemLevel(value);
    }
  };

  const handleSeedValue = (event: ChangeEvent<HTMLInputElement>) => {
    const maxValue = 65535;

    // Allow only numbers
    var value = event.target.value.replace(/[^0-9]/g, "");

    // Check Max Range
    if (Number(value) > maxValue) {
      value = maxValue.toString();
    }

    // If the input is empty, set it to '0'
    if (value === "") {
      setCurrentSelectedItemSeed("0");
    } else if (value.charAt(0) === "0") {
      setCurrentSelectedItemSeed(value.substring(1));
    } else {
      setCurrentSelectedItemSeed(value);
    }
  };

  const handleAmountValue = (event: ChangeEvent<HTMLInputElement>) => {
    const maxValue = 4294967295;

    // Allow only numbers
    var value = event.target.value.replace(/[^0-9]/g, "");

    // Check Max Range
    if (Number(value) > maxValue) {
      value = maxValue.toString();
    }

    // If the input is empty, set it to '0'
    if (value === "") {
      setCurrentSelectedItemAmount("0");
    } else if (value.charAt(0) === "0") {
      setCurrentSelectedItemAmount(value.substring(1));
    } else {
      setCurrentSelectedItemAmount(value);
    }
  };

  const handleDurabilityValue = (event: ChangeEvent<HTMLInputElement>) => {
    const maxValue = 4294967295;

    // Allow only numbers
    var value = event.target.value.replace(/[^-0-9]/g, "");

    // Check Max Range
    if (Number(value) > maxValue) {
      value = maxValue.toString();
    }

    // If the input is empty, set it to '0'
    if (value === "") {
      setCurrentSelectedItemDurability("0");
    } else if (value.charAt(0) === "0") {
      setCurrentSelectedItemDurability(value.substring(1));
    } else {
      setCurrentSelectedItemDurability(value);
    }
  };

  async function handleChangeValues(
    itemName: string,
    level: string,
    seed: string,
    amount: string,
    durability: string
  ) {
    let levelValue = Number(level);
    let seedValue = Number(seed);
    let amountValue = Number(amount);
    let durabilityValue = Number(durability);

    // Rewrite locally for performance reasons.
    if (currentItemRow?.inventory_items != undefined) {
      currentItemRow.inventory_items[currentItemIndex].name = itemName;
      currentItemRow.inventory_items[currentItemIndex].chunk_data.level_value =
        levelValue;
      currentItemRow.inventory_items[currentItemIndex].chunk_data.seed_value =
        seedValue;
      currentItemRow.inventory_items[currentItemIndex].chunk_data.amount_value =
        amountValue;
      currentItemRow.inventory_items[
        currentItemIndex
      ].chunk_data.durability_value = durabilityValue;
      setCurrentItemRow(currentItemRow);
      setItemRows(item_rows);
    }

    // setIsOpen(false);
    submitItemValues(
      itemName,
      levelValue,
      seedValue,
      amountValue,
      durabilityValue,
      currentSaveFile.value
    );
  }

  async function submitItemValues(
    itemName: string,
    levelValue: number,
    seedValue: number,
    amountValue: number,
    durabilityValue: number,
    saveFile?: SaveFile
  ) {
    console.log("Submitting item values...");
    console.log("Current Item: " + currentItem);
    console.log("Item Name: " + itemName);
    console.log("Level: " + levelValue);
    console.log("Seed: " + seedValue);
    console.log("Amount: " + amountValue);
    console.log("Durability: " + durabilityValue);
    console.log("Save File: " + saveFile);

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
    }).then((new_save_content) => {
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
    });
  }

  const generateRandomSeed = () => {
    const min = 10000; // Minimum 5-digit value
    const max = 65334; // Maximum 5-digit value (exclusive)

    const randomValue = Math.floor(Math.random() * (max - min) + min);
    setCurrentSelectedItemSeed(randomValue.toString());
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
                  <DialogTitle>Edit Item</DialogTitle>
                <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-4/5 truncate">
                          {currentSelectedItemName}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>{currentSelectedItemName}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </DialogHeader>
                <div className="grid gap-4 py-4 mr-8">
                  <div className="grid grid-cols-8 items-center gap-4">
                    <Label htmlFor="level" className="text-right col-span-2">
                      Level
                    </Label>
                    <Input
                      id="level"
                      value={currentSelectedItemLevel}
                      className="col-span-6"
                    />
                  </div>
                  <div className="grid grid-cols-8 items-center gap-2">
                    <Label htmlFor="seed" className="text-right col-span-2">
                      Seed
                    </Label>
                    <Input
                      id="seed"
                      value={currentSelectedItemSeed}
                      className="col-span-5"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            className="col-span-1"
                            variant="outline"
                            size="sm"
                            onClick={generateRandomSeed}
                          >
                            <Split className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Generate Random Seed</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="grid grid-cols-8 items-center gap-4">
                    <Label htmlFor="amount" className="text-right col-span-2">
                      Amount
                    </Label>
                    <Input
                      id="amount"
                      value={currentSelectedItemAmount}
                      className="col-span-6"
                    />
                  </div>
                  <div className="grid grid-cols-8 items-center gap-4">
                    <Label
                      htmlFor="durability"
                      className="text-right col-span-2"
                    >
                      Durability
                    </Label>
                    <Input
                      id="durability"
                      value={currentSelectedItemDurability}
                      className="col-span-6"
                    />
                  </div>
                </div>
                <DialogFooter className="mr-8">
                  <DialogClose asChild>
                    <Button onClick={() => {
                      handleChangeValues(
                        currentSelectedItemName,
                        currentSelectedItemLevel,
                        currentSelectedItemSeed,
                        currentSelectedItemAmount,
                        currentSelectedItemDurability
                      );
                      setIsSelectingItem(false)
                    }}>
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
