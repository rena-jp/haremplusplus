import { useCallback, useMemo, useState } from 'react';
import {
  BlessingDefinition,
  Class,
  CommonGirlData,
  getBlessedStats
} from '../data/data';

const maxGirlsPerPlace = 50;

export interface PoPTeamsProps {
  girls: CommonGirlData[];
  activeBlessing: BlessingDefinition[];
}

export const PoPTeams: React.FC<PoPTeamsProps> = ({
  girls,
  activeBlessing
}) => {
  const [places, setPlaces] = useState<number[]>([3, 3, 3]);
  const [level, setLevel] = useState(15);
  const targetValue = useMemo(() => getTargetValue(level), [level]);
  const updatePlaces = useCallback(
    (index: number, value: number) => {
      const newPlaces = [...places];
      newPlaces[index] = value;
      setPlaces(newPlaces);
    },
    [places, setPlaces]
  );

  return (
    <div className="pop-simulation">
      <label>
        HC:{' '}
        <input
          id="pop_hc"
          value={places[0]}
          onChange={(event) => updatePlaces(0, Number(event.target.value))}
        />{' '}
      </label>
      <label>
        CH:{' '}
        <input
          id="pop_ch"
          value={places[1]}
          onChange={(event) => updatePlaces(1, Number(event.target.value))}
        />{' '}
      </label>
      <label>
        KH:{' '}
        <input
          id="pop_kh"
          value={places[2]}
          onChange={(event) => updatePlaces(2, Number(event.target.value))}
        />{' '}
      </label>
      <label>
        Lv:{' '}
        <input
          id="pop_lvl"
          value={level}
          onChange={(event) => setLevel(Number(event.target.value))}
        />{' '}
      </label>
      <PoPRepartition
        girls={girls}
        places={places}
        targetValue={targetValue}
        activeBlessing={activeBlessing}
      />
    </div>
  );
};

export interface PoPRepartitionProps extends PoPTeamsProps {
  places: number[];
  targetValue: number;
  activeBlessing: BlessingDefinition[];
}

export const PoPRepartition: React.FC<PoPRepartitionProps> = ({
  girls: girlsState,
  places,
  targetValue,
  activeBlessing
}) => {
  const [result, setResult] = useState<Class[]>([]);

  const [values, setValues] = useState<number[]>([]);
  const [girlsCount, setGirlsCount] = useState<number[]>([]);
  const [pctValues, setPctValues] = useState<number[]>([]);

  const girlsByHc = useMemo(
    () =>
      sortByClass(
        [...girlsState].filter((g) => g.own),
        Class.Hardcore,
        activeBlessing
      ),
    [girlsState, activeBlessing]
  );
  const girlsByCh = useMemo(
    () =>
      sortByClass(
        [...girlsState].filter((g) => g.own),
        Class.Charm,
        activeBlessing
      ),
    [girlsState, activeBlessing]
  );
  const girlsByKh = useMemo(
    () =>
      sortByClass(
        [...girlsState].filter((g) => g.own),
        Class.Knowhow,
        activeBlessing
      ),
    [girlsState, activeBlessing]
  );

  const computeResult = useCallback(
    () =>
      getOptimalRepartition(
        girlsByHc,
        girlsByCh,
        girlsByKh,
        places,
        targetValue,
        activeBlessing
      ).then((result) => {
        const usedGirls: Set<string> = new Set();
        const newValues: number[] = [];
        const newPctValues: number[] = [];
        const newGirlsCount: number[] = [];
        for (const currentClass of result) {
          let currentPower = 0;
          let count = 0;
          const girls =
            currentClass === Class.Hardcore
              ? girlsByHc
              : currentClass === Class.Charm
              ? girlsByCh
              : girlsByKh;
          for (const girl of girls.filter((g) => !usedGirls.has(g.id))) {
            const girlPower = getGirlValue(girl, currentClass, activeBlessing);
            currentPower += girlPower;
            count++;
            usedGirls.add(girl.id);
            if (currentPower >= targetValue || count >= maxGirlsPerPlace) {
              break;
            }
          }
          newValues.push(currentPower);
          newGirlsCount.push(count);
          newPctValues.push((currentPower / targetValue) * 100);
        }
        setResult(result);
        setValues(newValues);
        setPctValues(newPctValues);
        setGirlsCount(newGirlsCount);
      }),
    [
      places,
      targetValue,
      activeBlessing,
      girlsByHc,
      girlsByCh,
      girlsByKh,
      setResult,
      setValues,
      setPctValues,
      setGirlsCount
    ]
  );

  let i = 0;
  return (
    <div>
      <button onClick={() => computeResult()}>Compute</button>
      <div className="pop">
        <ul className="pop">
          {result.map((classs) => {
            const count = girlsCount[i];
            const value = values[i];
            const pctValue = pctValues[i];
            const pct = pctValue < 100 ? ` (${pctValue.toFixed(2)}%)` : '';
            const className = pctValues[i] < 100 ? 'nok' : 'ok';
            return (
              <li className={className} key={`${i++}`}>
                {Class[classs]}: {value.toFixed(0)} ({count}){pct}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

async function getOptimalRepartition(
  hcGirls: CommonGirlData[],
  chGirls: CommonGirlData[],
  khGirls: CommonGirlData[],
  places: number[],
  targetValue: number,
  activeBlessing: BlessingDefinition[]
): Promise<Class[]> {
  const combinations: Class[][] = getCombinations(places);
  const priorities = getPriorities(places);

  // Sort by priority (highest priority: class with the most PoP)
  // This doesn't change the result, but increases the chances of finding
  // a favorable repartition without having to go through all possible
  // combinations
  combinations.sort((c1, c2) => {
    for (let i = 0; i < c1.length; i++) {
      const c1Prio = priorities.indexOf(c1[i]);
      const c2Prio = priorities.indexOf(c2[i]);
      if (c1Prio !== c2Prio) {
        return c1Prio - c2Prio;
      }
    }
    return 0;
  });

  let bestCombination: Class[] = [];
  let bestResult = 0;

  for (const combination of combinations) {
    const result = getRepartitionResult(
      hcGirls,
      chGirls,
      khGirls,
      targetValue,
      combination,
      activeBlessing
    );
    if (result > targetValue) {
      bestCombination = combination;
      break;
    } else if (result > bestResult) {
      bestCombination = combination;
      bestResult = result;
    }
  }
  return bestCombination;
}

function getPriorities(places: number[]): Class[] {
  // [0, 1, 2]
  const classes = [Class.Hardcore, Class.Charm, Class.Knowhow];
  return classes.sort((c1, c2) => {
    const p1 = places[c1];
    const p2 = places[c2];
    return p2 - p1;
  });
}

function getCombinations(
  places: number[],
  length = -1,
  base: Class[] = []
): Class[][] {
  if (length === -1) {
    length =
      places[Class.Hardcore] + places[Class.Charm] + places[Class.Knowhow];
  }
  if (length > 9) {
    console.log('ERROR: Too many places of power.');
    return [];
  }

  if (places[0] + places[1] + places[2] === 1) {
    const lastSlot = places.indexOf(1);
    const result = [...base];
    result.push(lastSlot);
    return [result];
  }

  let result: Class[][] = [];
  if (places[0] > 0) {
    const newBase = [...base];
    newBase.push(0);
    const newPlaces = [...places];
    newPlaces[0]--;
    result = result.concat(getCombinations(newPlaces, length, newBase));
  }
  if (places[1] > 0) {
    const newBase = [...base];
    newBase.push(1);
    const newPlaces = [...places];
    newPlaces[1]--;
    result = result.concat(getCombinations(newPlaces, length, newBase));
  }
  if (places[2] > 0) {
    const newBase = [...base];
    newBase.push(2);
    const newPlaces = [...places];
    newPlaces[2]--;
    result = result.concat(getCombinations(newPlaces, length, newBase));
  }

  return result;
}

function getRepartitionResult(
  hcGirls: CommonGirlData[],
  chGirls: CommonGirlData[],
  khGirls: CommonGirlData[],
  targetValue: number,
  order: Class[],
  activeBlessing: BlessingDefinition[]
): number {
  const usedGirls: Set<string> = new Set();
  const values: number[] = [];
  for (const currentClass of order) {
    const girls = (
      currentClass === Class.Hardcore
        ? hcGirls
        : currentClass === Class.Charm
        ? chGirls
        : khGirls
    ).filter((girl) => !usedGirls.has(girl.id));
    let currentPower = 0;
    let count = 0;
    for (const girl of girls) {
      const girlPower = getGirlValue(girl, currentClass, activeBlessing);
      currentPower += girlPower;
      count++;
      usedGirls.add(girl.id);
      if (currentPower >= targetValue || count >= maxGirlsPerPlace) {
        break;
      }
    }
    values.push(currentPower);
  }
  return Math.min(...values);
}

function getGirlValue(
  girl: CommonGirlData,
  classs: Class,
  activeBlessing: BlessingDefinition[]
): number {
  if (!girl.stats) {
    return 0;
  }

  const stats = getBlessedStats(girl, girl.stats, activeBlessing);

  switch (classs) {
    case Class.Hardcore:
      return stats.hardcore;
    case Class.Charm:
      return stats.charm;
    case Class.Knowhow:
      return stats.knowhow;
    default:
      return 0;
  }
}

function sortByClass(
  girls: CommonGirlData[],
  classs: Class,
  activeBlessing: BlessingDefinition[]
): CommonGirlData[] {
  girls.sort((a, b) => {
    const aPower = getGirlValue(a, classs, activeBlessing);
    const bPower = getGirlValue(b, classs, activeBlessing);

    return bPower - aPower;
  });
  return girls;
}

function getTargetValue(level: number) {
  // FIXME: Values have changed. Need to check actual values again
  const multiplier = 7 / 6;
  switch (level) {
    case 1:
      return 0;
    case 2:
      return Math.ceil(3375 * multiplier);
    case 3:
      return Math.ceil(4557 * multiplier);
    case 4:
      return Math.ceil(6151 * multiplier);
    case 5:
      return Math.ceil(8304 * multiplier);
    case 6:
      return Math.ceil(11210 * multiplier);
    case 7:
      return Math.ceil(15134 * multiplier);
    case 8:
      return Math.ceil(20431 * multiplier);
    case 9:
      return Math.ceil(27582 * multiplier);
    case 10:
      return Math.ceil(37234 * multiplier);
    case 11:
      return Math.ceil(50267 * multiplier);
    case 12:
      return Math.ceil(67860 * multiplier);
    case 13:
      return Math.ceil(91611 * multiplier);
    case 14:
      return Math.ceil(123674 * multiplier);
    case 15:
    default:
      return Math.ceil(166961 * multiplier);
  }
}
