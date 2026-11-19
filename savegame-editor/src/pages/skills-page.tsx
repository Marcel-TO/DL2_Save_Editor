import { NavbarComponent } from "@/components/custom/custom-navbar-component";
import { DataTable } from "@/components/custom/data-table-component";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SaveFile, SkillItem, Skills } from "@/models/save-models";
import { DataTableColumnDef } from "@/lib/table-features";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Sheet, SheetContent, SheetFooter, SheetHeader } from "@/components/ui/sheet";
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
import { invoke } from "@tauri-apps/api/core";
import { SettingState } from "@/models/settings-model";
import { ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";

type SkillsPageProps = {
  skills?: Skills;
  currentSaveFile: SettingState<SaveFile | undefined>;
};

export const skillFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  value: z.preprocess(
    (value: string | number) =>
      typeof value === "string" && value.trim() !== "" ? Number(value) : value,
    z
      .number({ error: "Enter a valid number." })
      .int({ message: "Value must be a whole number." })
      .gte(0, { message: "Value must be at least 0." })
      .max(65535, { message: "Value must be at most 65535." }),
  ),
});

export const columns: DataTableColumnDef<SkillItem>[] = [
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
    accessorKey: "value",
    accessorFn: (row) => row.points_value,
    header: "Value",
  },
  {
    accessorKey: "hex",
    accessorFn: (row) => row.points_data,
    header: "Value (HEX)",
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

export const SkillsPage = ({ skills, currentSaveFile }: SkillsPageProps) => {
  const [isSelectingItem, setIsSelectingItem] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [currentSkill, setCurrentSkill] = useState<SkillItem>();
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const [currentItemData, setCurrentItemData] = useState<SkillItem[] | undefined>(
    skills?.base_skills,
  );

  const handleSelectItem = (item: SkillItem, index: number) => {
    form.setValue("name", item.name);
    form.setValue("value", item.points_value);
    setCurrentSkill(item);
    setCurrentSkillIndex(index);
    setIsSelectingItem(true);
  };

  const form = useForm<z.input<typeof skillFormSchema>, unknown, z.output<typeof skillFormSchema>>({
    resolver: zodResolver(skillFormSchema),
    defaultValues: {
      name: "",
      value: 0,
    },
  });

  async function onSubmitChangeValues(data: z.output<typeof skillFormSchema>) {
    if (await submitSkillValue(data.value)) {
      setIsSelectingItem(false);
    }
  }

  async function submitSkillValue(skillValue: number): Promise<boolean> {
    const saveFile = currentSaveFile.value;
    if (!saveFile || !currentSkill) {
      return false;
    }

    try {
      const newSaveContent = await invoke<Uint8Array>("handle_edit_skill", {
        current_item_size: currentSkill.size,
        current_skill_index: currentSkill.index,
        new_value: skillValue,
        save_file_content: saveFile.file_content,
      });
      const currentSkills =
        currentTab === 0 ? saveFile.skills.base_skills : saveFile.skills.legend_skills;
      const updatedSkills = currentSkills.map((skill, index) =>
        index === currentSkillIndex
          ? {
              ...skill,
              points_value: skillValue,
              points_data: new Uint8Array([skillValue & 0xff, skillValue >>> 8]),
            }
          : skill,
      );
      const skills =
        currentTab === 0
          ? { ...saveFile.skills, base_skills: updatedSkills }
          : { ...saveFile.skills, legend_skills: updatedSkills };

      currentSaveFile.setValue({
        ...saveFile,
        file_content: newSaveContent,
        skills,
        is_dirty: true,
      });
      setCurrentItemData(updatedSkills);
      return true;
    } catch (error) {
      toast.error("Could not update the skill.", {
        description: String(error),
      });
      return false;
    }
  }

  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <NavbarComponent />
        <div className="flex flex-col pl-14 sm:gap-4 sm:py-4 sm:pl-56">
          <main className="grid flex-1 items-start gap-4 p-4">
            <div>
              <h1 className="text-3xl font-semibold mb-4">Skills Page</h1>

              {skills ? (
                <Tabs defaultValue="base">
                  <div className="flex items-center">
                    <TabsList>
                      <TabsTrigger
                        value="base"
                        onClick={() => {
                          setCurrentTab(0);
                          setCurrentItemData(skills.base_skills);
                        }}
                      >
                        Base Skills
                      </TabsTrigger>
                      <TabsTrigger
                        value="legend"
                        onClick={() => {
                          setCurrentTab(1);
                          setCurrentItemData(skills.legend_skills);
                        }}
                      >
                        Legend Skills
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="base">
                    <DataTable
                      title="Base Skills"
                      counter_description="Skills"
                      columns={columns}
                      data={currentItemData || []}
                      executeFunctionForRow={handleSelectItem}
                    />
                  </TabsContent>
                  <TabsContent value="legend">
                    <DataTable
                      title="Legend Skills"
                      counter_description="Skills"
                      columns={columns}
                      data={currentItemData || []}
                      executeFunctionForRow={handleSelectItem}
                    />
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
                          No skills found. Please make sure that you have loaded a valid save file.
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
                          <FormLabel className="text-right col-span-2">Value</FormLabel>
                          <FormControl className="col-span-6">
                            <Input type="number" placeholder="value" {...field} />
                          </FormControl>
                          <div className="col-span-6 col-start-3">
                            <FormDescription>
                              The value of the desired item. The maximum value is 65535.
                            </FormDescription>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <SheetFooter className="my-6">
                      <Button className="w-full" onClick={() => form.trigger()}>
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
