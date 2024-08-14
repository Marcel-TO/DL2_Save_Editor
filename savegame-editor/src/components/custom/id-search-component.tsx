import * as React from "react";
import { useDebounce } from "use-debounce";
import { useQuery } from "@tanstack/react-query";

import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { Check, PenOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { IdData } from "@/models/save-models";
import { SearchResponse } from "@/models/models";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface SearchProps {
  selectedResult?: string;
  onSelectResult: Function;
  ids: IdData[];
  setOpen: Function;
}

export function Search({
  selectedResult,
  onSelectResult,
  ids,
  setOpen,
}: SearchProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [displayLimit, setDisplayLimit] = React.useState(30);

  const handleSelectResult = (id: string) => {
    onSelectResult(id);

    // reset the search query upon selection
    setSearchQuery("");
    setDisplayLimit(30);
    setOpen(false);
  };

  return (
    <Command
      shouldFilter={false}
      className="h-auto rounded-lg border border-b-0 shadow-md w-full"
    >
      <CommandInput
        value={searchQuery}
        onValueChange={(value) => setSearchQuery(value)}
        placeholder="Search for id"
      />

      <CommandList>
        <SearchResults
          query={searchQuery}
          selectedResult={selectedResult}
          onSelectResult={handleSelectResult}
          ids={ids}
          displayLimit={displayLimit}
        />
      </CommandList>
    </Command>
  );
}

interface SearchResultsProps {
  query: string;
  selectedResult: SearchProps["selectedResult"];
  onSelectResult: SearchProps["onSelectResult"];
  ids: IdData[];
  displayLimit: number;
}

function SearchResults({
  query,
  selectedResult,
  onSelectResult,
  ids,
  displayLimit,
}: SearchResultsProps) {
  const [debouncedSearchQuery] = useDebounce(query, 1000);
  const enabled = !!debouncedSearchQuery;

  const {
    data,
    isLoading: isLoadingOrig,
    isError,
  } = useQuery<SearchResponse>({
    queryKey: ["search", debouncedSearchQuery],
    queryFn: () =>
      searchIdsByQuery(
        debouncedSearchQuery,
        ids,
        displayLimit
      ),
    enabled,
  });

  // To get around this https://github.com/TanStack/query/issues/3584
  const isLoading = enabled && isLoadingOrig;

  if (!enabled) return null;

  return (
    <>
      {isLoading && <div className="p-4 text-sm">Searching...</div>}
      {!isError && !isLoading && !data?.ids.length && (
        <div className="p-4 text-sm">No ids found</div>
      )}
      {isError && <div className="p-4 text-sm">Something went wrong</div>}

      <div className="flex flex-col">

      {data?.ids.map((id) => {
        return (
          <>
            {selectedResult && selectedResult.length < id.length ? (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <CommandItem
                        key={id}
                        onSelect={(res: string) => onSelectResult(res)}
                        value={id}
                        className="flex w-full justify-center"
                      >
                        <PenOff className={cn("mr-2 h-4 w-4")} />
                        {id}
                      </CommandItem>
                    </TooltipTrigger>
                    <TooltipContent>
                      The ID you want to select is longer than the previous ID
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            ) : (
              <>
                <Button
                  key={id}
                  variant="ghost"
                  className="flex w-full"
                  onClick={() => onSelectResult(id)}
                >
                  <CommandItem
                    key={id}
                    onSelect={(res: string) => onSelectResult(res)}
                    value={id}
                    className="flex w-full justify-center"
                  >
                    <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedResult === id ? "opacity-100" : "opacity-0"
                          )}
                        />

                    {id}
                  </CommandItem>
                </Button>
              </>
            )}
          </>
        );
      })}
      </div>
    </>
  );
}

const searchIdsByQuery = async (
  query: string,
  ids: IdData[],
  displayLimit: number
): Promise<SearchResponse> => {
  // iterate through the IdDatas.ids and filter out the ones that match the query
  let result: string[] = [];

  for (let idData of ids) {
    for (let id of idData.ids) {
      if (id.toLowerCase().includes(query.toLowerCase())) {
        // Check whether the match is already in the result
        if (result.includes(id)) {
          continue;
        }

        // check whether the matches hit the display limit
        if (result.length > displayLimit) {
          return { ids: result };
        }
        result.push(id);
      }
    }
  }

  return { ids: result };
};
