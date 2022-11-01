import { useCallback, useState } from 'react';
import { QuickFilter } from '../components/harem';
import { BlessingDefinition, BlessingType, equalBlessing } from '../data/data';
import { HaremOptions } from '../data/options';

export interface QuickFilterState {
  activeQuickFilters: QuickFilter[];
  toggleQuickFilter(blessings: BlessingType | BlessingType[]): void;
  clearQuickFilters(): void;
}

export const useQuickFilters: (
  options: HaremOptions,
  currentBlessings: BlessingDefinition[],
  upcomingBlessings: BlessingDefinition[]
) => QuickFilterState = () => {
  const [quickFilters, setQuickFilters] = useState<QuickFilter[]>([]);

  const toggleQuickFilter = useCallback(
    (blessings: BlessingType | BlessingType[]) => {
      const allBlessings = Array.isArray(blessings) ? blessings : [blessings];
      const newFilters = [...quickFilters];
      for (const blessing of allBlessings) {
        const existingFilter = quickFilters.find((f) =>
          equalBlessing(f.blessing, blessing)
        );
        if (existingFilter) {
          const index = newFilters.indexOf(existingFilter);
          newFilters.splice(index, 1);
        } else {
          newFilters.push({ blessing });
        }
      }
      setQuickFilters(newFilters);
    },
    [quickFilters, setQuickFilters]
  );

  const clearQuickFilters = useCallback(() => {
    setQuickFilters([]);
  }, [setQuickFilters]);

  return {
    activeQuickFilters: quickFilters,
    toggleQuickFilter,
    clearQuickFilters
  };
};
