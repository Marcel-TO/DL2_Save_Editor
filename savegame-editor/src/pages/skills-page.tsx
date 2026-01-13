import { NavbarComponent } from "@/components/custom/custom-navbar-component";
import { DataTable } from "@/components/custom/data-table-component";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SaveFile, SkillItem, Skills } from "@/models/save-models";
import { ColumnDef } from "@tanstack/react-table";
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
import { invoke } from "@tauri-apps/api/core";
import { SettingState } from "@/models/settings-model";
import { ChevronsUpDown } from "lucide-react";

type SkillsPageProps = {
    skills?: Skills;
    currentSaveFile: SettingState<SaveFile | undefined>;
};

export const columns: ColumnDef<SkillItem>[] = [
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
    const [currentItemData, setCurrentItemData] = useState<
        SkillItem[] | undefined
    >(skills?.base_skills);

    // initialize the current item values and their requriements
    const ItemFormSchema = z.object({
        name: z.string().min(1, { message: "Name is required" }),
        value: z.number()
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
        setCurrentTab(currentTab);
        setIsSelectingItem(false);
    }

    async function submitSkillValue(skillValue: number) {
        console.log("Submitting skill value: ", currentSkill);
        invoke<Uint8Array>("handle_edit_skill", {
            current_item_size: currentSkill?.size,
            current_skill_index: currentSkill?.index,
            new_value: skillValue,
            save_file_content: currentSaveFile.value?.file_content,
        }).then((new_save_content) => {
            console.log("New save content: ", new_save_content);
            let newSaveFile = currentSaveFile.value;
            if (newSaveFile != undefined) {
                newSaveFile.file_content = new_save_content;
                if (currentTab === 0) {
                    newSaveFile.skills.base_skills[currentSkillIndex].points_value = skillValue;
                } else {
                    newSaveFile.skills.legend_skills[currentSkillIndex].points_value = skillValue;
                }
                currentSaveFile.setValue(newSaveFile);
                setCurrentItemData(undefined);
                setTimeout(() => {
                    setCurrentItemData(
                        currentTab === 0
                            ? newSaveFile.skills.base_skills
                            : newSaveFile.skills.legend_skills
                    );
                }, 1);
            }
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
                                <Tabs>
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
