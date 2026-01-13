import { NavbarComponent } from "@/components/custom/custom-navbar-component";
import { DataTable } from "@/components/custom/data-table-component";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatchedItems } from "@/models/save-models";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { ChevronsUpDown, Copy } from "lucide-react";
import {
    TooltipProvider,
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@radix-ui/react-tooltip";

type PatchedItemsPageProps = {
    patchedItems?: PatchedItems;
};

export const columns: ColumnDef<string>[] = [
    {
        accessorKey: "name",
        accessorFn: (row) => row,
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    className="w-full flex justify-between"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Name
                    <ChevronsUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="group flex items-center gap-2 text-md">
                {row.getValue("name")}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="icon"
                                variant="outline"
                                className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                                onClick={() =>
                                    navigator.clipboard.writeText(row.getValue("name"))
                                }
                            >
                                <Copy className="h-3 w-3" />
                                <span className="sr-only">Copy</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy Path</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        ),
    },
];

export const PatchedItemsPage = ({ patchedItems }: PatchedItemsPageProps) => {
    const [allPatchedItems, setAllPatchedItems] = useState<string[]>(() =>
        (patchedItems?.not_dropable || []).concat(patchedItems?.not_shareable || [])
    );

    useEffect(() => {
        setAllPatchedItems(
            (patchedItems?.not_dropable || []).concat(
                patchedItems?.not_shareable || []
            )
        );
    }, [patchedItems]);

    return (
        <>
            <div className="flex min-h-screen w-full flex-col">
                <NavbarComponent />
                <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                    <main className="grid flex-1 items-start gap-4 p-4">
                        <div>
                            <h1 className="text-3xl font-semibold mb-4">
                                Patched Items Page
                            </h1>
                            {patchedItems ? (
                                <>
                                    <Tabs defaultValue="0" className="max-w-screen h-full">
                                        <TabsList className="flex flex-wrap h-full">
                                            <TabsTrigger key={0} value="0" className="flex-shrink-0">
                                                All
                                            </TabsTrigger>
                                            <TabsTrigger key={1} value="1" className="flex-shrink-0">
                                                Not Dropable
                                            </TabsTrigger>
                                            <TabsTrigger key={2} value="2" className="flex-shrink-0">
                                                Not Shareable
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="0">
                                            <DataTable
                                                title="All IDs"
                                                counter_description="IDs"
                                                columns={columns}
                                                data={allPatchedItems || []}
                                            />
                                        </TabsContent>
                                        <TabsContent value="1">
                                            <DataTable
                                                title="All IDs"
                                                counter_description="IDs"
                                                columns={columns}
                                                data={patchedItems?.not_dropable || []}
                                            />
                                        </TabsContent>
                                        <TabsContent value="2">
                                            <DataTable
                                                title="All IDs"
                                                counter_description="IDs"
                                                columns={columns}
                                                data={patchedItems?.not_shareable || []}
                                            />
                                        </TabsContent>
                                    </Tabs>
                                </>
                            ) : (
                                <></>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};
