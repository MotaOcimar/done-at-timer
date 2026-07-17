import { ChevronRight, Trash2, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSwipeToReveal } from '../hooks/useSwipeToReveal';
import { useClock } from '../hooks/useClock';
import { IconTooltip } from './IconTooltip';
import { RoutePair } from './RoutePair';
import type { Routine } from '../types';
import type { ShareOutcome } from '../utils/shareService';

/**
 * Names the departure–arrival pair (TK-029 pattern, reworded by TK-034 when
 * the departure "now" became explicit). Calm, neutral wording.
 */
const FORECAST_LABEL = 'Leaving now · estimated arrival';

interface RoutineItemProps {
  routine: Routine;
  isExpanded: boolean;
  /** Share feedback for this routine, if any. */
  shareFeedback: ShareOutcome | null;
  activeSwipeId: string | null;
  onSwipeDismissAll: (id?: string) => void;
  onToggleExpand: (id: string) => void;
  onLoad: (id: string) => void;
  onShare: (routine: Routine) => void;
  onDelete: (id: string) => void;
}

/**
 * A routine row in the Control Center's library: tap expands an inline preview
 * of its tasks (TK-009); swiping right-to-left reveals the delete button, same
 * gesture as task cards (TK-031) — the deliberate tap on the revealed button is
 * the confirmation, so deletion is immediate.
 */
const RoutineItem = ({
  routine,
  isExpanded,
  shareFeedback,
  activeSwipeId,
  onSwipeDismissAll,
  onToggleExpand,
  onLoad,
  onShare,
  onDelete,
}: RoutineItemProps) => {
  const { isRevealed, redOpacity, dragProps } = useSwipeToReveal({
    id: routine.id,
    isEnabled: true,
    activeSwipeId,
    onSwipeDismissAll,
  });

  // The routine's finish time if started right now (SPEC-001/SPEC-005): now +
  // sum of estimates, recomputed from the shared per-second clock so it never
  // goes stale while the drawer is open (TK-032). Shown as a full journey —
  // ◉ now ┄ ⌖ finish — with the live departure as the word "now" (TK-034).
  const now = useClock();
  const totalMinutes = routine.tasks.reduce(
    (sum, t) => sum + t.expectedDuration,
    0,
  );
  const forecast = new Date(now.getTime() + totalMinutes * 60_000);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' && e.target === e.currentTarget) {
      onDelete(routine.id);
    }
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      data-testid="routine-item"
      className="outline-none"
      style={{ touchAction: 'pan-y' }}
    >
      <div className="group relative rounded-2xl overflow-hidden border border-transparent hover:border-blue-200 hover:shadow-md transition-all">
        {/* Reveal Area (Behind) */}
        <motion.div
          style={{ opacity: redOpacity }}
          className="absolute inset-0 bg-red-400 flex items-center justify-end pr-6"
        >
          <button
            onClick={() => onDelete(routine.id)}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="text-white hover:scale-110 transition-transform p-3"
            aria-label="Delete routine"
            tabIndex={isRevealed ? 0 : -1}
            aria-hidden={!isRevealed}
            data-testid="routine-delete-button"
          >
            <Trash2 size={20} strokeWidth={2} />
          </button>
        </motion.div>

        {/* Swipeable row (header + preview slide together). Rounded like
            TaskCard so its trailing corners stay curved as it slides over the
            red reveal — the container clips the leading corners to match. */}
        <motion.div
          {...dragProps}
          data-testid="routine-swipeable"
          className="relative rounded-2xl bg-gray-50 group-hover:bg-white transition-colors"
        >
          <div className="flex items-center justify-between p-4">
            <button
              type="button"
              onClick={() => onToggleExpand(routine.id)}
              aria-expanded={isExpanded}
              className="flex-1 min-w-0 flex items-center text-left cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                  {routine.name}
                </h4>
                {shareFeedback ? (
                  <p
                    className={`text-[10px] font-bold uppercase tracking-tight ${shareFeedback === 'copied' ? 'text-green-500' : 'text-red-400'}`}
                  >
                    {shareFeedback === 'copied'
                      ? 'Link copied!'
                      : "Couldn't share"}
                  </p>
                ) : (
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight flex items-center gap-1.5">
                    <span>
                      {routine.tasks.length} tasks • {totalMinutes}m
                    </span>
                    {/* The journey pair, informative here (not the
                        interactive TK-029 tooltip): the row's metadata line is
                        already inside the expand-toggle button, and nesting a
                        button is invalid HTML. The meaning rides along as
                        screen-reader-only text; tapping the row still just
                        expands it. The interactive tooltip lives in the
                        expanded preview below. */}
                    <span
                      data-testid="routine-forecast"
                      className="inline-flex items-center gap-1"
                    >
                      <span className="sr-only">{FORECAST_LABEL}: </span>
                      <RoutePair start="now" end={forecast} />
                    </span>
                  </p>
                )}
              </div>
              <div className="p-2 text-blue-500 opacity-60">
                <ChevronRight
                  data-testid="routine-chevron"
                  size={20}
                  strokeWidth={2}
                  className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                />
              </div>
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onShare(routine)}
                className="p-2 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                aria-label="Share routine"
              >
                <Share2 size={20} strokeWidth={2} />
              </button>
            </div>
          </div>
          {/* Stays mounted so both expanding and collapsing can animate
              (grid-rows 0fr↔1fr); visibility is inline so the hidden state is
              real for assistive tech and computable outside the browser. */}
          <div
            style={{
              visibility: isExpanded ? 'visible' : 'hidden',
            }}
            className={`grid transition-[grid-template-rows,visibility] duration-200 ease-out ${
              isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="overflow-hidden">
              <div className="px-4 pb-4">
                <ul className="mb-3 divide-y divide-gray-200">
                  {routine.tasks.map((task, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between gap-3 py-2 text-sm"
                    >
                      <span className="text-gray-700 truncate">
                        {task.title}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight shrink-0">
                        {task.expectedDuration}m
                      </span>
                    </li>
                  ))}
                </ul>
                {/* Same journey pair, repeated for interface consistency —
                    here it can be the interactive TK-029 tooltip (legal
                    nesting, no enclosing button). The glyphs are decorative;
                    the times carry the accessible name and the label rides
                    along as its description. */}
                <div className="mb-3 flex justify-end">
                  <IconTooltip
                    label={FORECAST_LABEL}
                    align="end"
                    className="gap-1 text-xs font-bold text-gray-500"
                  >
                    <RoutePair start="now" end={forecast} />
                  </IconTooltip>
                </div>
                <button
                  onClick={() => onLoad(routine.id)}
                  className="w-full bg-blue-500 text-white py-2.5 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-100"
                >
                  Load routine
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export { RoutineItem };
