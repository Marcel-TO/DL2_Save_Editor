import { NavbarComponent } from "@/components/custom/custom-navbar-component";
import { DataTable } from "@/components/custom/data-table-component";
import { Card, CardContent } from "@/components/ui/card";
import { ColumnDef } from "@tanstack/react-table";

type LogEntry = {
    log: string;
}

type DebugPageProps = {
    log_history?: string[];
};

const columns: ColumnDef<LogEntry>[] = [
    {
        accessorKey: "log",
        header: "Logs",
    },
];

export const DebugPage = ({ log_history }: DebugPageProps) => {
    // Transform log_history into an array of objects
    const data = log_history ? log_history.map(log => ({ log })) : [];

    return (
        <>
            <div className="flex min-h-screen w-full flex-col">
                <NavbarComponent />
                <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                    <main className="grid flex-1 items-start gap-4 p-4">
                        <div>
                            <h1 className="text-3xl font-semibold mb-4">Debug Page</h1>

                            <Card>
                                <CardContent>
                                    <DataTable
                                        columns={columns}
                                        data={data}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};
