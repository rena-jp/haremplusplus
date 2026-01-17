import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { forceCheck } from 'react-lazyload';
import { GameAPI } from '../api/GameAPI';
import {
  BlessingDefinition,
  CommonGirlData,
  Element,
  Trait
} from '../data/data';
import { GirlDescription } from './description';
import { GIRL_TOOLTIP_ID, GirlTile } from './girl';
import { Teams } from './teams';
import { UpgradePage } from './upgrade';
import { TeamsData } from '../hooks/teams-hooks';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { SelectedGirlIdContext } from '../export-api';

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
  gemsCount: Map<Element, number>;
  consumeGems(element: Element, gems: number): void;
  haremMode: HaremMode;
  setHaremMode: (mode: HaremMode) => void;
  teamsData: TeamsData;
  setSingleTrait(trait: Trait): void;
}

export const HaremWidget: React.FC<HaremWidgetProps> = ({
  girls,
  allGirls,
  show0Pose,
  currentBlessings,
  upcomingBlessings,
  gameAPI,
  gemsCount,
  consumeGems,
  haremMode,
  setHaremMode,
  teamsData,
  setSingleTrait
}) => {
  // Sort girls by owned/not owned, to ensure we render owned girls first (avoid weird
  // initial display on small harems with few owned girls).
  // Owned/Not owned girls are rendered in two separate groups anyway, so this won't cause
  // conflicts with user sorting choices.
  const groupedGirls = useMemo(() => {
    const result = [...girls];
    result.sort((a, b) => (a.own === b.own ? 0 : a.own ? -1 : 1));
    return result;
  }, [girls]);

  // On initial rendering, start with a small batch of girls.
  const [renderedGirls, setRenderedGirls] =
    useState<CommonGirlData[]>(groupedGirls);

  useEffect(() => {
    setRenderedGirls(girls);
  }, [girls]);

  const ownedGirls = renderedGirls.filter((g) => g.own);
  const missingGirls = renderedGirls.filter((g) => !g.own);

  const [selectedGirl, setSelectedGirl] = useState<CommonGirlData | undefined>(
    () => {
      const { hash } = window.location;
      const match = hash.match(/#characters-(\d+)/);
      if (match) {
        const girlId = match[1];
        const girl = allGirls.find((girl) => girl.id === girlId);
        if (girl !== undefined) {
          return girl;
        }
      }
      return groupedGirls.length === 0 ? undefined : groupedGirls[0]; // First visible girl
    }
  );

  const teamsGirlListenerRef = useRef<(girl: CommonGirlData) => void>(() => {
    /* No-op until defined by the teams editor */
  });

  const selectGirl = useCallback(
    (girl?: CommonGirlData) => {
      setSelectedGirl(girl);

      // Update the location
      const url = new URL(window.location.toString());
      if (girl !== undefined) {
        url.hash = `characters-${girl.id}`;
      } else {
        url.hash = 'characters';
      }
      window.history.replaceState('', '', url.toString());

      // Notify the team editor of the selected girl, if it is listening.
      if (teamsGirlListenerRef.current && girl !== undefined) {
        teamsGirlListenerRef.current(girl);
      }
    },
    [setSelectedGirl, teamsGirlListenerRef]
  );

  const [girlId, count] = useContext(SelectedGirlIdContext);
  useEffect(() => {
    const girl = allGirls.find((e) => e.id === girlId);
    if (girl) selectGirl(girl);
  }, [allGirls, girlId, count]);

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

  const [showUpgrade, setShowUpgrade] = useState(false);
  const [page, setPage] = useState<UpgradePage>('books');

  const openUpgrade = useCallback((page: UpgradePage) => {
    setShowUpgrade(true);
    setPage(page);
  }, []);

  const closeUpgrade = useCallback(() => {
    setShowUpgrade(false);
  }, []);

  // Use a CSS class to disable all tooltips, instead
  // of a react prop. This is necessary to avoid re-rendering
  // hundreds/thousands of girl tiles whenever the mode changes.
  const hideTooltips = haremMode !== 'edit-teams';

  return (
    <>
      <div className={`girlsList${hideTooltips ? ' hide-tooltips' : ''}`}>
        <div className="owned">
          {ownedGirls.map((girl) => {
            return (
              <GirlTile
                key={girl.id}
                girl={girl}
                selected={
                  selectedGirl !== undefined && selectedGirl.id === girl.id
                }
                selectGirl={selectGirl}
                show0Pose={show0Pose}
                currentBlessings={currentBlessings}
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
              currentBlessings={currentBlessings}
            />
          ))}
        </div>
        <ReactTooltip
          id={GIRL_TOOLTIP_ID}
          className="qh-tooltip"
          classNameArrow="qh-tooltip-arrow"
        />
      </div>
      {haremMode === 'edit-teams' ? (
        <Teams
          allGirls={allGirls}
          close={() => setHaremMode('standard')}
          show0Pose={show0Pose}
          currentBlessings={currentBlessings}
          upcomingBlessings={upcomingBlessings}
          girlListener={teamsGirlListenerRef}
          teamsData={teamsData}
        />
      ) : null}
      <GirlDescription
        allGirls={allGirls}
        listGirls={ownedGirls}
        girl={selectedGirl}
        activeBlessing={currentBlessings}
        nextBlessing={upcomingBlessings}
        show0Pose={show0Pose}
        selectGirl={selectGirl}
        openUpgrade={openUpgrade}
        setSingleTrait={setSingleTrait}
      />
      {selectedGirl && showUpgrade && selectedGirl.own && (
        <div className="harem-upgrade-panel">
          <UpgradePage
            currentGirl={selectedGirl}
            displayedGirls={girls}
            allGirls={allGirls}
            show0Pose={show0Pose}
            gameAPI={gameAPI}
            page={page}
            setPage={setPage}
            selectGirl={selectGirl}
            close={closeUpgrade}
            gemsCount={gemsCount}
            consumeGems={consumeGems}
          />
        </div>
      )}
      {/* <PoPTeams girls={allGirls} activeBlessing={currentBlessings} /> */}
    </>
  );
};

export type HaremMode = 'standard' | 'edit-teams';
