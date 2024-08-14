import { NavbarComponent } from "@/components/custom/custom-navbar-component";
import { DataTable } from "@/components/custom/data-table-component";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SaveFile, SkillItem, Skills } from "@/models/save-models";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { invoke } from "@tauri-apps/api/tauri";
import { SettingState } from "@/models/settings-model";

type SkillsPageProps = {
  skills?: Skills;
  currentSaveFile: SettingState<SaveFile | undefined>;
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

export const SkillsPage = ({ skills, currentSaveFile }: SkillsPageProps) => {
  const [isSelectingItem, setIsSelectingItem] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [currentSkill, setCurrentSkill] = useState<SkillItem>();
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);

  // initialize the current item values and their requriements
  const ItemFormSchema = z.object({
    name: z.string({
      invalid_type_error: "Name must be a string",
    }),
    value: z.coerce
      .number()
      .gte(0, { message: "Level must be a positive number" })
      .max(65535, { message: "Level must be less than 65535" }),
  });

  const handleSelectItem = (item: SkillItem, index: number) => {
    form.setValue("name", item.name);
    form.setValue("value", item.points_value);
    setCurrentSkill(item);
    setCurrentSkillIndex(index);
    setIsSelectingItem(true);
  };

  const form = useForm<z.infer<typeof ItemFormSchema>>({
    resolver: zodResolver(ItemFormSchema),
    defaultValues: {
      name: "",
      value: 0,
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
    form.setValue("value", Number(data.value));

    await submitSkillValue(Number(data.value));
    setIsSelectingItem(false);
  }

  async function submitSkillValue(skillValue: number) {
    invoke<string>("handle_edit_skill", {
        current_skill: JSON.stringify(currentSkill),
        current_skill_index: currentSkillIndex,
        is_base_skill: currentTab === 0,
        new_value: skillValue,
        save_file: JSON.stringify(currentSaveFile.value)
    }).then((new_save) => {
        let convertedSave: SaveFile = JSON.parse(new_save);
        currentSaveFile.setValue(convertedSave);
    });
}

  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <NavbarComponent />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <main className="grid flex-1 items-start gap-4 p-4">
            <div>
              <h1 className="text-3xl font-semibold mb-4">Skills Page</h1>

              {skills ? (
                <Tabs defaultValue="base">
                  <div className="flex items-center">
                    <TabsList>
                      <TabsTrigger value="base" onClick={() => setCurrentTab(0)}>Base Skills</TabsTrigger>
                      <TabsTrigger value="legend" onClick={() => setCurrentTab(1)}>Legend Skills</TabsTrigger>
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
                  <TabsContent value="base">
                    <Card className="my-4">
                      <DataTable
                        columns={columns}
                        data={skills ? skills.base_skills : []}
                        executeFunctionForRow={handleSelectItem}
                      />
                    </Card>
                  </TabsContent>
                  <TabsContent value="legend">
                    <Card className="my-4">
                      <DataTable
                        columns={columns}
                        data={skills ? skills.legend_skills : []}
                        executeFunctionForRow={handleSelectItem}
                      />
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : (
                <>
                  <div className="flex align-center justify-center w-full h-full">
                    <Card className="">
                      <CardHeader>
                        <CardTitle>There is nothing to see here</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-center">
                          No skills found. Please make sure that you have loaded
                          a valid save file.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>

            <Sheet open={isSelectingItem} onOpenChange={setIsSelectingItem}>
              <SheetContent>
                <SheetHeader>Edit Skill</SheetHeader>
                
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitChangeValues)}>
                       <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                          <FormItem className="grid grid-cols-8 grid-rows-2 items-center gap-x-2 my-4">
                            <FormLabel className="text-right col-span-2">
                              Value
                            </FormLabel>
                            <FormControl className="col-span-6">
                              <Input
                                type="number"
                                placeholder="value"
                                {...field}
                              />
                            </FormControl>
                            <div className="col-span-6 col-start-3">
                              <FormDescription>
                                The value of the desired item. The maximum value
                                is 65534.
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
            </Sheet>
          </main>
        </div>
      </div>
    </>
  );
};
