import * as React from 'react';
import { useSelector } from 'react-redux';

import { TabScreens } from '../../../routes';
import { RootState } from '../../../store';

export const SearchTabSvg: React.FC = () => {
  const currentTabScreen = useSelector(
    (state: RootState) => state.tabSlice.screen,
  );

  const fillColor =
    currentTabScreen === TabScreens.Menu
      ? 'var(--main-turquoise)'
      : 'var(--text-color)';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={48}
      height={48}
      viewBox="0 0 24 24"
      fill="none"
      stroke={fillColor}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Rectangular tag with cut top-right corner */}
      <path d="M3 3h14l4 4v14H3V3z" fill="none" />
      <path d="M17 3v4h4" fill="none" />
      {/* Hole circle */}
      <circle cx="7" cy="7" r="1.5" fill={fillColor} />
    </svg>
  );
};
