import { useId, useState, type ReactNode } from 'react';

interface IconTooltipProps {
  /** The meaning shown in the bubble and exposed to assistive tech as the button's
   *  accessible description. Single source of truth for the meaning. */
  label: string;
  /**
   * Where the bubble hangs from the trigger. `center` suits a trigger with open
   * space around it (the arrival header). `end` is for a trigger against the
   * right edge of a clipping container, where a centered bubble would be cut off
   * with no way to scroll to the rest (TK-032).
   */
  align?: 'center' | 'end';
  children: ReactNode;
  className?: string;
}

/**
 * A centered bubble floats in open space, so it may run as wide as its text; an
 * end-anchored one exists because space is tight, so it wraps within a set
 * width. That width must be explicit: left `auto`, an absolute box shrinks to
 * its longest word rather than to `max-width`, stacking the label into a narrow
 * column. 13rem clears the routine card at a 320px viewport.
 */
const BUBBLE_ALIGNMENT = {
  center: 'left-1/2 -translate-x-1/2 whitespace-nowrap',
  end: 'right-0 w-52',
} as const;

/**
 * Wraps content (an icon, or a whole clock+icon group) so its meaning is discoverable
 * by sighted users who aren't running a screen reader. Reveals a small text bubble on
 * tap (toggle), hover, and keyboard focus (TK-029).
 *
 * The bubble is exposed to assistive tech as the button's `aria-describedby`, so the
 * button's accessible *name* still comes from its visible content (e.g. the arrival
 * time) and the meaning rides along as a description — never overriding the value.
 * Children should therefore be decorative (aria-hidden) unless they carry the name.
 * The bubble itself is aria-hidden so it isn't double-counted in the name computation.
 */
const IconTooltip = ({
  label,
  align = 'center',
  children,
  className,
}: IconTooltipProps) => {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  return (
    <button
      type="button"
      aria-describedby={tooltipId}
      onClick={() => setOpen((o) => !o)}
      onBlur={() => setOpen(false)}
      className={`group relative inline-flex items-center justify-center cursor-help ${
        className ?? ''
      }`}
    >
      {children}
      <span
        id={tooltipId}
        aria-hidden="true"
        className={`pointer-events-none absolute top-full z-10 mt-2 rounded-lg bg-gray-900/90 px-2.5 py-1 text-xs font-semibold text-white shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 ${
          BUBBLE_ALIGNMENT[align]
        } ${open ? 'opacity-100' : 'opacity-0'}`}
      >
        {label}
      </span>
    </button>
  );
};

export { IconTooltip };
