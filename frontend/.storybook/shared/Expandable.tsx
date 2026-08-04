import { ReactNode, useState } from 'react';

export interface ExpandableProps {
  /**
   * Noun for the hidden content, used to build the toggle label.
   * `expandableWhat="payload"` renders "Show payload" / "Hide payload".
   */
  expandableWhat: string;
  children: ReactNode;
}

/**
 * Collapsed-by-default wrapper for bulky story output.
 *
 * Stories that dump a raw API payload next to a rendered chart would otherwise
 * push the chart off screen, so the payload starts hidden and the reader opts
 * in. Children are only mounted while open, which keeps a large
 * `JSON.stringify` off the initial render.
 */
export default function Expandable({
  expandableWhat,
  children,
}: ExpandableProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(current => !current)}
        style={{
          background: 'none',
          border: '1px solid currentColor',
          borderRadius: 4,
          cursor: 'pointer',
          font: 'inherit',
          fontSize: 12,
          padding: '2px 8px',
        }}
      >
        {expanded ? 'Hide' : 'Show'} {expandableWhat}
      </button>
      {expanded && children}
    </div>
  );
}
