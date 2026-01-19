import { useCallback, useState } from 'react';
import { TraitEnum, Trait, Traits, equalTrait } from '../data/data';
import { useAtom } from 'jotai';
import { filterBySkill3Atom } from '../data/atoms';

type TraitsFilterTraits = Partial<Record<TraitEnum, Trait | undefined>>;

export type TraitsFilter = {
  filterBySkill3: boolean;
  traits: TraitsFilterTraits;
};

export interface TraitsFilterState {
  traitsFilter: TraitsFilter;
  toggleSingleTrait(trait: Trait): void;
  toggleMultipleTraits(trait: Trait): void;
  clearTraits(): void;
  toggleFilterBySkill3(): void;
}

export const useTraitsFilter = (): TraitsFilterState => {
  const [filterBySkill3, setFilterBySkill3] = useAtom(filterBySkill3Atom);
  const [traits, setTraitsFilter] = useState<TraitsFilterTraits>({});

  const toggleSingleTrait = useCallback(
    (trait: Trait) => {
      setTraitsFilter((old) => {
        if (filterBySkill3) {
          setFilterBySkill3(false);
        } else {
          const match = Traits.values().every((key) => {
            if (key === trait.traitEnum) {
              return old[key]?.traitValue === trait.traitValue;
            } else {
              return old[key] === undefined;
            }
          });
          if (match) {
            return {
              ...old,
              [trait.traitEnum]: undefined
            };
          }
        }
        return { [trait.traitEnum]: trait };
      });
    },
    [filterBySkill3, setFilterBySkill3, setTraitsFilter]
  );

  const toggleMultipleTraits = useCallback(
    (trait: Trait) => {
      setTraitsFilter((old) => {
        const newFilter = { ...old }; // must copy
        const oldTrait = old[trait.traitEnum];
        if (oldTrait !== undefined && equalTrait(oldTrait, trait)) {
          newFilter[trait.traitEnum] = undefined;
        } else {
          newFilter[trait.traitEnum] = trait;
        }
        return newFilter;
      });
    },
    [setTraitsFilter]
  );

  const clearTraits = useCallback(() => {
    setTraitsFilter({});
  }, [setTraitsFilter]);

  const toggleFilterBySkill3 = useCallback(() => {
    setFilterBySkill3((old) => !old);
  }, [setFilterBySkill3]);

  return {
    traitsFilter: {
      filterBySkill3,
      traits
    },
    toggleSingleTrait,
    toggleMultipleTraits,
    clearTraits,
    toggleFilterBySkill3
  };
};

export const isTraitsFilterActive = (filter: TraitsFilter) =>
  Traits.values().some((key) => filter.traits[key] !== undefined);
