import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { forceCheck } from 'react-lazyload';
import { GameAPI, SalaryDataListener } from '../api/GameAPI';
import { BlessingDefinition, CommonGirlData } from '../data/data';
import { GirlDescription } from './description';
import { GirlTile } from './girl';

/**
 * Number of girls to be rendered immediately. Should be small (< 100 items)
 * to ensure smooth initial state.
 */
const INITIAL_RENDERED_GIRLS = 50;
/**
 * Number of additional girls to be rendered on each cycle. Avoid rendering 1000s of girls
 * in a single cycle.
 */
const GIRLS_PER_CYCLE = 200;
/**
 * The initial delay between the initial rendering, and the addition of a thousand extra girls.
 * Should be long enough to properly render the initial state, but not too long so the remaining girls
 * can be displayed as soon as possible.
 */
const INITIAL_CYCLE_DELAY = 300;
/**
 * The delay between 2 render cycles.
 */
const CYCLE_DELAY = 30; /* ms */
// Total for 1300 girls: 7 cycles of 30ms = 210ms delay (actual rendering may take longer)

export interface HaremWidgetProps {
  girls: CommonGirlData[];
  allGirls: CommonGirlData[];
  visible: boolean;
  show0Pose: boolean;
  currentBlessings: BlessingDefinition[];
  upcomingBlessings: BlessingDefinition[];
  gameAPI: GameAPI;
}

export const HaremWidget: React.FC<HaremWidgetProps> = ({
  girls,
  allGirls,
  show0Pose,
  currentBlessings,
  upcomingBlessings,
  gameAPI
}) => {
  // On initial rendering, start with a small batch of girls.
  const [renderedGirls, setRenderedGirls] = useState<CommonGirlData[]>(
    girls.slice(0, INITIAL_RENDERED_GIRLS)
  );
  const [initialRender, setInitialRender] = useState(true);

  const [salaryData, setSalaryData] = useState(gameAPI.getSalaryData());

  const [girlsSalaries, setGirlsSalariesMap] = useState<Map<string, number>>(
    new Map()
  );
  const salariesRef = useRef(girlsSalaries);
  const setGirlsSalaries = useCallback((salaries: Map<string, number>) => {
    setGirlsSalariesMap(salaries);
    salariesRef.current = salaries;
  }, []);

  useMemo(() => {
    const now = Date.now();
    const payAt: Map<string, number> = new Map();
    Object.keys(salaryData).forEach((girlId) => {
      const payIn = salaryData[girlId].pay_in;

      payAt.set(girlId, payIn * 1000 + now);
    });
    setGirlsSalaries(payAt);
  }, [salaryData, setGirlsSalaries]);

  const collectSalary = useCallback(
    async (girl: CommonGirlData): Promise<boolean> => {
      const result = gameAPI.collectSalary(girl);
      const newSalaries = new Map(salariesRef.current);
      newSalaries.set(
        girl.id,
        Date.now() + ((girl.salaryTime ?? 0) + 10) * 1000
      );
      setGirlsSalaries(newSalaries);
      const success = await result;
      return success;
    },
    [gameAPI, setGirlsSalaries]
  );

  useEffect(() => {
    const listener: SalaryDataListener = (newSalaryData) => {
      setSalaryData(newSalaryData);
    };
    gameAPI.addSalaryDataListener(listener);
    return () => gameAPI.removeSalaryDataListener(listener);
  }, [gameAPI]);

  // Render a subset of the girls, until all of them are displayed
  // When removing girls, it's okay to simply refresh immediately,
  // as it's a lot faster to remove elements than to create them.
  useEffect(() => {
    if (renderedGirls.length < girls.length) {
      // Use a slightly longer delay between the first update and the next ones,
      // to make sure the page has enough time to render a valid initial
      // state before we stress is with a thousand items.
      const delay = initialRender ? INITIAL_CYCLE_DELAY : CYCLE_DELAY; /* ms */
      const timeout = setTimeout(() => {
        setInitialRender(false);
        setRenderedGirls(
          girls.slice(0, renderedGirls.length + GIRLS_PER_CYCLE)
        );
      }, delay);
      return () => {
        clearTimeout(timeout);
      };
    } else {
      setRenderedGirls(girls);
    }
  }, [girls, renderedGirls]);

  // Render a subset of the girls, until all of them are displayed
  // When removing girls, it's okay to simply refresh immediately,
  // as it's a lot faster to remove elements than to create them.
  useEffect(() => {
    if (renderedGirls.length < girls.length) {
      // Use a slightly longer delay between the first update and the next ones,
      // to make sure the page has enough time to render a valid initial
      // state before we stress is with a thousand items.
      const delay = initialRender ? INITIAL_CYCLE_DELAY : CYCLE_DELAY; /* ms */
      const timeout = setTimeout(() => {
        setInitialRender(false);
        setRenderedGirls(
          girls.slice(0, renderedGirls.length + GIRLS_PER_CYCLE)
        );
      }, delay);
      return () => {
        clearTimeout(timeout);
      };
    } else {
      setRenderedGirls(girls);
    }
  }, [girls, renderedGirls]);

  const ownedGirls = renderedGirls.filter((g) => g.own);
  const missingGirls = renderedGirls.filter((g) => !g.own);

  const [selectedGirl, setSelectedGirl] = useState<CommonGirlData | undefined>(
    () => {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has('girl')) {
        const girlId = searchParams.get('girl');
        const girl = allGirls.find((girl) => girl.id === girlId);
        if (girl !== undefined) {
          return girl;
        }
      }
      return girls.length === 0 ? undefined : girls[0]; // First visible girl
    }
  );
  const selectGirl = useCallback(
    (girl?: CommonGirlData) => {
      setSelectedGirl(girl);

      // Update the location
      const params = new URLSearchParams(window.location.search);
      if (!params.has('harem')) {
        params.set('harem', '');
      }
      if (girl !== undefined) {
        params.set('girl', girl.id);
      } else {
        params.delete('girl');
      }
      const url = new URL(window.location.toString());
      url.search = params.toString();
      window.history.replaceState('', '', url.toString());
    },
    [setSelectedGirl]
  );

  useEffect(() => {
    // Refresh selection when girls data change
    if (selectedGirl !== undefined) {
      const updatedGirl = allGirls.find((girl) => girl.id === selectedGirl.id);
      if (updatedGirl) {
        setSelectedGirl(updatedGirl);
      }
    }
  }, [allGirls]);

  /**
   * Refresh lazy-loading state on render. Many events can cause
   * stuff to suddenly appear, such as filters, but also zoom, browser resize, etc.
   * Not all events will cause a re-render of the component, so we won't immediately
   * detect them. As such, it's safer to re-check on every render (A simple selection
   * change will force the missing images to load).
   */
  useEffect(() => {
    forceCheck();
  });

  return (
    <>
      <div className="girlsList">
        <div className="owned">
          {ownedGirls.map((girl) => {
            const payAt = girlsSalaries.get(girl.id);
            return (
              <GirlTile
                key={girl.id}
                girl={girl}
                selected={
                  selectedGirl !== undefined && selectedGirl.id === girl.id
                }
                selectGirl={selectGirl}
                show0Pose={show0Pose}
                collectSalary={collectSalary}
                payAt={payAt}
              />
            );
          })}
        </div>
        <div className="missing">
          {missingGirls.map((girl) => (
            <GirlTile
              key={girl.id}
              girl={girl}
              selected={
                selectedGirl !== undefined && selectedGirl.id === girl.id
              }
              selectGirl={selectGirl}
              show0Pose={show0Pose}
              collectSalary={collectSalary}
              payAt={undefined}
            />
          ))}
        </div>
      </div>
      <GirlDescription
        allGirls={allGirls}
        girl={selectedGirl}
        activeBlessing={currentBlessings}
        nextBlessing={upcomingBlessings}
        show0Pose={show0Pose}
        gameAPI={gameAPI}
        selectGirl={selectGirl}
      />
    </>
  );
};
