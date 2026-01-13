import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { InventoryItem } from "@/models/save-models";
import { Separator } from "@/components/ui/separator";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type InventoryItemCardProps = {
  item: InventoryItem;
  itemIndex: number;
  executeAction?: Function;
};

export const InventoryItemCard = ({ item, itemIndex, executeAction }: InventoryItemCardProps) => {
  return (
    <Card className="overflow-visible transform transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg w-full h-full"
      onClick={() => executeAction && executeAction(item, itemIndex)}
    >
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="relative w-full">
        <CardTitle className="w-full group flex items-center gap-2 text-lg">
          <div className="w full truncate">
            {item.name}
          </div>
        </CardTitle>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="absolute top-0 right-0 w-6 h-6 text-muted-foreground cursor-pointer">
                <HelpCircle className="" />
            </TooltipTrigger>
              <TooltipContent className="z-100">
                <div>Chunk Index: {item.chunk_data.index}</div>
                <div>Index: {item.index}</div>
              </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="text-sm">
        <div className="font-semibold mb-2">Values</div>
        <ul className="grid gap-3">
          <li className="flex items-center justify-between">
            <span className="text-muted-foreground">Level</span>
            <span>{item.chunk_data.level_value}</span>
          </li>

          <li className="flex items-center justify-between">
            <span className="text-muted-foreground">Seed</span>
            <span>{item.chunk_data.seed_value}</span>
          </li>

          <li className="flex items-center justify-between">
            <span className="text-muted-foreground">Amount</span>
            <span>{item.chunk_data.amount_value}</span>
          </li>

          <li className="flex items-center justify-between">
            <span className="text-muted-foreground">Durability</span>
            <span>{item.chunk_data.durability_value}</span>
          </li>
        </ul>

        {item.mod_data.length > 0 ? (
          <>
            <Separator className="my-4" />
            <div className="font-semibold mb-2">Mods</div>
            <ul className="grid gap-3">
              {item.mod_data.map((mod) => (
                <li>
                  <span className="text-muted-foreground">{mod.name}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <></>
        )}
      </CardContent>
    </Card>
  );
};
