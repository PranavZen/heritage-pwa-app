import * as React from 'react';
import { useSelector } from 'react-redux';

import { ReactComponent as BadgePercentIcon } from '../../svg/badge-percent.svg';
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
    <BadgePercentIcon
      width={48}
      height={48}
      stroke={fillColor}
      fill="none"
    />
  );
};
