import * as React from 'react';
import {useSelector} from 'react-redux';

import {TabScreens} from '../../../routes';
import {RootState} from '../../../store';

export const HeartTabSvg: React.FC = () => {
  const currentTabScreen = useSelector(
    (state: RootState) => state.tabSlice.screen,
  );

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={24}
      height={24}
      fill='none'
    >
      <path
        fill={
          currentTabScreen === TabScreens.Favorite
            ? 'var(--main-turquoise)'
            : 'var(--text-color)'
        }
        fillOpacity={0.15}
        d='M16.422 3.3c-1.928 0-3.6 1.116-4.423 2.746C11.176 4.416 9.504 3.3 7.576 3.3 4.833 3.3 2.61 5.56 2.61 8.346c0 5.503 9.389 11.742 9.389 11.742s9.389-6.239 9.389-11.742c0-2.787-2.224-5.046-4.966-5.046Z'
      />
      <path
        fill={
          currentTabScreen === TabScreens.Favorite
            ? 'var(--main-turquoise)'
            : 'var(--text-color)'
        }
        fillRule='evenodd'
        d='M20.3 4.706a6.093 6.093 0 0 1 1.333 1.94c.326.758.492 1.562.49 2.39 0 .78-.16 1.593-.476 2.42a10.722 10.722 0 0 1-1.13 2.133c-.769 1.146-1.826 2.341-3.138 3.553a35.517 35.517 0 0 1-4.42 3.453l-.556.356a.753.753 0 0 1-.809 0l-.555-.357a35.071 35.071 0 0 1-4.42-3.452c-1.313-1.211-2.37-2.407-3.139-3.553a10.843 10.843 0 0 1-1.13-2.133c-.316-.827-.475-1.64-.475-2.42a6.057 6.057 0 0 1 1.826-4.329A6.219 6.219 0 0 1 8.07 2.93 6.26 6.26 0 0 1 12 4.315a6.26 6.26 0 0 1 3.93-1.385 6.219 6.219 0 0 1 4.37 1.776ZM12 19.096l.162.253h.002l.005-.004.018-.012.072-.047.268-.18a34.152 34.152 0 0 0 3.848-3.051c1.053-.972 2.114-2.1 2.914-3.291.798-1.187 1.355-2.465 1.355-3.729 0-2.56-2.116-4.624-4.713-4.624-1.64 0-3.086.821-3.931 2.07a4.735 4.735 0 0 0-3.93-2.07c-2.598 0-4.714 2.064-4.714 4.624 0 1.264.557 2.542 1.355 3.729.8 1.191 1.861 2.32 2.914 3.29a34.146 34.146 0 0 0 4.116 3.232l.072.047.018.012.005.003.002.001.162.104.162-.104-.162-.252Zm8.344-10.06Zm-8.506 10.313.162-.252-.162.252ZM8.07 4.711c-2.133 0-3.913 1.482-4.324 3.453.411-1.97 2.19-3.453 4.324-3.453A4.433 4.433 0 0 1 12 7.064a4.433 4.433 0 0 1 3.93-2.353c-1.713 0-3.199.956-3.93 2.353a4.426 4.426 0 0 0-3.93-2.353Z'
        clipRule='evenodd'
      />
    </svg>
  );
};