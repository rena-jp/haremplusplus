import { useCallback, useState } from 'react';
import { TraitEnum, Trait, Traits, equalTrait } from '../data/data';

export type TraitsFilter = {
  skilledOnly: boolean;
  traits: {
    [key in TraitEnum]?: Trait | undefined;
  };
};

export interface TraitsFilterState {
  traitsFilter: TraitsFilter;
  toggleSingleTrait(trait: Trait): void;
  toggleMultipleTraits(trait: Trait): void;
  clearTraits(): void;
  toggleSkilledOnly(): void;
}

export const useTraitsFilter = (skilledOnly = false): TraitsFilterState => {
  const [traitsFilter, setTraitsFilter] = useState<TraitsFilter>({
    skilledOnly,
    traits: {}
  });

  const toggleSingleTrait = useCallback(
    (trait: Trait) => {
      setTraitsFilter((old) => {
        if (!old.skilledOnly) {
          const match = Traits.values().every((key) => {
            if (key === trait.traitEnum) {
              return old.traits[key]?.traitValue === trait.traitValue;
            } else {
              return old.traits[key] === undefined;
            }
          });
          if (match) {
            return {
              skilledOnly: false,
              traits: {
                ...old.traits,
                [trait.traitEnum]: undefined
              }
            };
          }
        }
        return {
          skilledOnly: false,
          traits: { [trait.traitEnum]: trait }
        };
      });
    },
    [setTraitsFilter]
  );

  const toggleMultipleTraits = useCallback(
    (trait: Trait) => {
      setTraitsFilter((old) => {
        const newFilter = {
          skilledOnly: old.skilledOnly,
          traits: { ...old.traits } // must copy
        };
        const oldTrait = old.traits[trait.traitEnum];
        if (oldTrait !== undefined && equalTrait(oldTrait, trait)) {
          newFilter.traits[trait.traitEnum] = undefined;
        } else {
          newFilter.traits[trait.traitEnum] = trait;
        }
        return newFilter;
      });
    },
    [setTraitsFilter]
  );

  const clearTraits = useCallback(() => {
    setTraitsFilter((old) => {
      if (!isTraitsFilterActive(old)) return old;
      return { skilledOnly: old.skilledOnly, traits: {} };
    });
  }, [setTraitsFilter]);

  const toggleSkilledOnly = useCallback(() => {
    setTraitsFilter((old) => ({
      skilledOnly: !old.skilledOnly,
      traits: old.traits
    }));
  }, [setTraitsFilter]);

  return {
    traitsFilter,
    toggleSingleTrait,
    toggleMultipleTraits,
    clearTraits,
    toggleSkilledOnly
  };
};

export const isTraitsFilterActive = (filter: TraitsFilter) =>
  Traits.values().some((key) => filter.traits[key] !== undefined);
