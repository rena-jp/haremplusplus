import React, { useCallback, useMemo } from 'react';
import { CommonGirlData, Element } from '../data/data';
import '../style/harem.css';
import { LabyrinthSkillIcon, RoleIcon, SkillIcon } from './common';
import { PanelProps } from './panels';
import {
  LabyrinthSkill,
  Role,
  Skill,
  SkillFilterState,
  isSkillFilterActive
} from '../hooks/skill-filter-hooks';

export interface SkillsSummaryProps extends PanelProps {
  allGirls: CommonGirlData[];
  filteredGirls: CommonGirlData[];
  skillFilterState: SkillFilterState;
}

export const SkillsSummary = React.memo<SkillsSummaryProps>(
  ({ allGirls, filteredGirls, skillFilterState, visible }) => {
    const className = `panel ${visible ? 'visible' : 'hidden'}`;
    return (
      <div className={className}>
        <div className="manage-filters">
          <button
            className="hh-action-button"
            disabled={!isSkillFilterActive(skillFilterState.skillFilter)}
            onClick={() => {
              skillFilterState.clearFilter();
            }}
          >
            Clear filters
          </button>
        </div>
        <SkillSummaries
          allGirls={allGirls}
          filteredGirls={filteredGirls}
          skillFilterState={skillFilterState}
        />
      </div>
    );
  }
);

interface SkillSummariesProps {
  allGirls: CommonGirlData[];
  filteredGirls: CommonGirlData[];
  skillFilterState: SkillFilterState;
}

const SkillSummaries: React.FC<SkillSummariesProps> = ({
  allGirls,
  filteredGirls,
  skillFilterState
}) => {
  const skillList: Skill[] = [
    { elements: [], name: 'None' },
    { elements: [Element.white, Element.orange], name: 'Shield' },
    { elements: [Element.green, Element.purple], name: 'Reflect' },
    { elements: [Element.dark, Element.yellow], name: 'Stun' },
    { elements: [Element.red, Element.blue], name: 'Execute' }
  ];
  const labyrinthSkillList: LabyrinthSkill[] = [
    { element: null, name: 'None' },
    { element: Element.white, name: 'Recovery' },
    { element: Element.orange, name: 'Reassurance' },
    { element: Element.green, name: 'Mana Boost' },
    { element: Element.purple, name: 'Mana Steal' },
    { element: Element.dark, name: 'Spank!' },
    { element: Element.yellow, name: 'Lovestruck' },
    { element: Element.red, name: 'Burnout' },
    { element: Element.blue, name: 'Protection' }
  ];
  const roleList: Role[] = useMemo(
    () => [
      { id: null, name: 'None' },
      ...[4, 10, 9, 3, 1, 2, 5, 6].map((e) => ({
        id: e,
        name: window.GT.design[`girl_role_${e}_name`]
      }))
    ],
    []
  );
  return (
    <div className="blessings-summary">
      <div key="cat_skill" className="cat_skill">
        <h2>BDSM Skill</h2>
        {skillList.map((skill) => (
          <SkillSummary
            key={skill.name}
            allGirls={allGirls}
            filteredGirls={filteredGirls}
            skillFilterState={skillFilterState}
            skill={skill}
          />
        ))}
      </div>
      <div key="cat_labyrinth_skill" className="cat_labyrinth_skill">
        <h2>Labyrinth Skill</h2>
        {labyrinthSkillList.map((skill) => (
          <LabyrinthSkillSummary
            key={skill.name}
            allGirls={allGirls}
            filteredGirls={filteredGirls}
            skillFilterState={skillFilterState}
            labyrinthSkill={skill}
          />
        ))}
      </div>
      <div key="cat_role" className="cat_role">
        <h2>Role</h2>
        {roleList.map((role) => (
          <RoleSummary
            key={role.name}
            allGirls={allGirls}
            filteredGirls={filteredGirls}
            skillFilterState={skillFilterState}
            role={role}
          />
        ))}
      </div>
    </div>
  );
};

interface SkillSummaryProps {
  allGirls: CommonGirlData[];
  filteredGirls: CommonGirlData[];
  skillFilterState: SkillFilterState;
  skill: Skill;
}

function matchSkill(girl: CommonGirlData, skill: Skill) {
  return skill.elements.length === 0
    ? girl.maxStars < 5
    : girl.maxStars >= 5 && skill.elements.includes(girl.element);
}

function matchLabyrinthSkill(
  girl: CommonGirlData,
  labyrinthSkill: LabyrinthSkill
) {
  return labyrinthSkill.element == null
    ? girl.maxStars < 5
    : girl.maxStars >= 5 && labyrinthSkill.element === girl.element;
}

function matchRole(girl: CommonGirlData, role: Role) {
  return girl.id_role === role.id;
}

function matchAll(
  girl: CommonGirlData,
  skill: Skill | null,
  labyrinthSkill: LabyrinthSkill | null,
  role: Role | null
) {
  if (skill != null) {
    if (!matchSkill(girl, skill)) return false;
  }
  if (labyrinthSkill != null) {
    if (!matchLabyrinthSkill(girl, labyrinthSkill)) return false;
  }
  if (role != null) {
    if (!matchRole(girl, role)) return false;
  }
  return true;
}

const SkillSummary: React.FC<SkillSummaryProps> = ({
  allGirls,
  filteredGirls,
  skillFilterState,
  skill
}) => {
  const filter = skillFilterState.skillFilter;
  const isValid = useMemo(() => {
    return allGirls.some((girl) => matchSkill(girl, skill));
  }, [allGirls, skill]);
  const matchingGirls = useMemo(() => {
    return filteredGirls.filter((girl) =>
      matchAll(girl, skill, filter.labyrinthSkill, filter.role)
    );
  }, [filteredGirls, skill, filter.labyrinthSkill, filter.role]);
  if (!isValid) return null;

  const total = matchingGirls.length;
  const owned = matchingGirls.filter((g) => g.own).length;

  const styles: string[] = [];
  styles.push('blessing-summary-entry');

  styles.push('toggle-filter');
  if (skillFilterState.skillFilter.skill?.name === skill.name) {
    styles.push('filter-enabled');
  }

  return (
    <div
      className={styles.join(' ')}
      onClick={() => {
        skillFilterState.toggleSkill(skill);
      }}
    >
      <SkillLabel skill={skill} /> : <Counter owned={owned} total={total} />
    </div>
  );
};

interface LabylinthSkillSummaryProps {
  allGirls: CommonGirlData[];
  filteredGirls: CommonGirlData[];
  skillFilterState: SkillFilterState;
  labyrinthSkill: LabyrinthSkill;
}

const LabyrinthSkillSummary: React.FC<LabylinthSkillSummaryProps> = ({
  allGirls,
  filteredGirls,
  skillFilterState,
  labyrinthSkill
}) => {
  const filter = skillFilterState.skillFilter;
  const isValid = useMemo(() => {
    return allGirls.some((girl) => matchLabyrinthSkill(girl, labyrinthSkill));
  }, [allGirls, labyrinthSkill]);
  const matchingGirls = useMemo(() => {
    return filteredGirls.filter((girl) =>
      matchAll(girl, filter.skill, labyrinthSkill, filter.role)
    );
  }, [filteredGirls, filter.skill, labyrinthSkill, filter.role]);
  if (!isValid) return null;

  const total = matchingGirls.length;
  const owned = matchingGirls.filter((g) => g.own).length;

  const styles: string[] = [];
  styles.push('blessing-summary-entry');

  styles.push('toggle-filter');
  if (
    skillFilterState.skillFilter.labyrinthSkill?.element ===
    labyrinthSkill.element
  ) {
    styles.push('filter-enabled');
  }

  return (
    <div
      className={styles.join(' ')}
      onClick={() => {
        skillFilterState.toggleLabyrinthSkill(labyrinthSkill);
      }}
    >
      <LabyrinthSkillLabel skill={labyrinthSkill} /> :{' '}
      <Counter owned={owned} total={total} />
    </div>
  );
};

interface RoleSummaryProps {
  allGirls: CommonGirlData[];
  filteredGirls: CommonGirlData[];
  skillFilterState: SkillFilterState;
  role: Role;
}

const RoleSummary: React.FC<RoleSummaryProps> = ({
  allGirls,
  filteredGirls,
  skillFilterState,
  role
}) => {
  const filter = skillFilterState.skillFilter;
  const isValid = useMemo(() => {
    return allGirls.some((girl) => matchRole(girl, role));
  }, [allGirls, role]);
  const matchingGirls = useMemo(() => {
    return filteredGirls.filter((girl) =>
      matchAll(girl, filter.skill, filter.labyrinthSkill, role)
    );
  }, [filteredGirls, filter.skill, filter.labyrinthSkill, role]);
  if (!isValid) return null;

  const total = matchingGirls.length;
  const owned = matchingGirls.filter((g) => g.own).length;

  const styles: string[] = [];
  styles.push('blessing-summary-entry');

  styles.push('toggle-filter');
  if (skillFilterState.skillFilter.role?.id === role.id) {
    styles.push('filter-enabled');
  }

  return (
    <div
      className={styles.join(' ')}
      onClick={() => {
        skillFilterState.toggleRole(role);
      }}
    >
      <RoleLabel role={role} /> : <Counter owned={owned} total={total} />
    </div>
  );
};

const SkillLabel = React.memo<{ skill: Skill }>(({ skill }) => (
  <>
    {skill.elements.length === 0 ? (
      <span className="skill-icon">?</span>
    ) : (
      <SkillIcon element={skill.elements[0]} />
    )}
    <span>{skill.name}</span>
  </>
));

const LabyrinthSkillLabel = React.memo<{ skill: LabyrinthSkill }>(
  ({ skill }) => (
    <>
      {skill.element == null ? (
        <span className="skill-icon">?</span>
      ) : (
        <LabyrinthSkillIcon element={skill.element} />
      )}
      <span>{skill.name}</span>
    </>
  )
);

const RoleLabel = React.memo<{ role: Role }>(({ role }) => (
  <>
    {role.id == null ? (
      <span className="role-icon">?</span>
    ) : (
      <RoleIcon roleId={role.id} />
    )}
    <span>{role.name}</span>
  </>
));

const Counter = React.memo<{ owned: number; total: number }>(
  ({ owned, total }) => (
    <>
      <span className="owned">{owned}</span>/
      <span className="total">{total}</span>
    </>
  )
);
