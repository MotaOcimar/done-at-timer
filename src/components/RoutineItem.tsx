import { ChevronRight, Trash2, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSwipeToReveal } from '../hooks/useSwipeToReveal';
import type { Routine } from '../types';
import type { ShareOutcome } from '../utils/shareService';

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
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                    {routine.tasks.length} tasks •{' '}
                    {routine.tasks.reduce((sum, t) => sum + t.duration, 0)}m
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
                        {task.duration}m
                      </span>
                    </li>
                  ))}
                </ul>
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
