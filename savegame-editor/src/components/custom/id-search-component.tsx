import * as React from 'react';
import { useDebounce } from 'use-debounce';
import { useQuery } from '@tanstack/react-query';

import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IdData } from '@/models/save-models';
import { SearchResponse } from '@/models/models';

interface SearchProps {
  selectedResult?: string;
  onSelectResult: (id: string) => void;
  ids: IdData[];
}

export function Search({ selectedResult, onSelectResult, ids }: SearchProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [displayLimit, setDisplayLimit] = React.useState(30);

  const handleSelectResult = (id: string) => {
    onSelectResult(id);

    // reset the search query upon selection
    setSearchQuery('');
    setDisplayLimit(30);
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
  selectedResult: SearchProps['selectedResult'];
  onSelectResult: SearchProps['onSelectResult'];
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
    queryKey: ['search', debouncedSearchQuery],
    queryFn: () => searchIdsByQuery(debouncedSearchQuery, ids, displayLimit),
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

      {data?.ids.map((id) => {
        return (
          <CommandItem
            key={id}
            onSelect={() => onSelectResult(id)}
            value={id}
          >
            <Check
              className={cn(
                'mr-2 h-4 w-4',
                selectedResult === id ? 'opacity-100' : 'opacity-0'
              )}
            />
            {id}
          </CommandItem>
        );
      })}
    </>
  );
}

const searchIdsByQuery = async (query: string, ids: IdData[], displayLimit: number): Promise<SearchResponse> => {
  // iterate through the IdDatas.ids and filter out the ones that match the query
  let result: string[] = [];

  for (let idData of ids) {
    for (let id of idData.ids) {
      if (id.toLowerCase().includes(query.toLowerCase())) {
        // check whether the matches hit the display limit
        if (result.length > displayLimit) {
          return { ids: result };
        }
        result.push(id);
      }
    }
  }

  return { ids: result };
}