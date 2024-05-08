import { useCallback, useState } from 'react';
import { Element } from '../data/data';

export interface Skill {
  elements: Element[];
  name: string;
}

export interface LabyrinthSkill {
  element: Element | null;
  name: string;
}

export interface Role {
  id: number | null;
  name: string;
}

export interface SkillFilter {
  skill: Skill | null;
  labyrinthSkill: LabyrinthSkill | null;
  role: Role | null;
}

export interface SkillFilterState {
  skillFilter: SkillFilter;
  toggleSkill(skill: Skill): void;
  toggleLabyrinthSkill(skill: LabyrinthSkill): void;
  toggleRole(role: Role): void;
  clearFilter(): void;
}

export const useSkillFilter = (): SkillFilterState => {
  const [skillFilter, setSkillFilter] = useState<SkillFilter>({
    skill: null,
    labyrinthSkill: null,
    role: null
  });

  const toggleSkill = useCallback(
    (skill: Skill) => {
      setSkillFilter((old) => {
        if (old.skill?.name === skill.name) {
          return { ...old, skill: null };
        } else {
          return {
            ...old,
            skill,
            labyrinthSkill: null
          };
        }
      });
    },
    [setSkillFilter]
  );

  const toggleLabyrinthSkill = useCallback(
    (labyrinthSkill: LabyrinthSkill) => {
      setSkillFilter((old) => {
        if (old.labyrinthSkill?.element === labyrinthSkill.element) {
          return { ...old, labyrinthSkill: null };
        } else {
          return {
            ...old,
            skill: null,
            labyrinthSkill
          };
        }
      });
    },
    [setSkillFilter]
  );

  const toggleRole = useCallback(
    (role: Role) => {
      setSkillFilter((old) => {
        if (old.role?.id === role.id) {
          return { ...old, role: null };
        } else {
          return {
            ...old,
            role
          };
        }
      });
    },
    [setSkillFilter]
  );

  const clearFilter = useCallback(() => {
    setSkillFilter((old) => {
      if (!isSkillFilterActive(old)) return old;
      return { skill: null, labyrinthSkill: null, role: null };
    });
  }, [setSkillFilter]);

  return {
    skillFilter,
    toggleSkill,
    toggleLabyrinthSkill,
    toggleRole,
    clearFilter
  };
};

export const isSkillFilterActive = (filter: SkillFilter) =>
  filter.skill || filter.labyrinthSkill || filter.role;
