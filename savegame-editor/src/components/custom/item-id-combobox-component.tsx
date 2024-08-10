'use client';

import * as React from 'react';
import { ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search } from '@/components/custom/id-search-component';
import { IdData } from '@/models/save-models';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const POPOVER_WIDTH = 'w-full';

type ComboboxProps = {
  ids: IdData[];
}

export function IdComboBox({ids}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string>('');

  const handleSetActive = React.useCallback((id: string) => {
    setSelected(id);
  }, []);

  const displayName = selected ? selected : 'Select ID';
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn('justify-between', POPOVER_WIDTH)}
          >
            {displayName}

            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent side="bottom" className={cn('p-0', POPOVER_WIDTH)}>
          <Search selectedResult={selected} onSelectResult={handleSetActive} ids={ids}/>
        </PopoverContent>
      </Popover>

    </QueryClientProvider>
  );
}