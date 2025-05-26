import * as React from 'react';

type Props = {
  className?: string;
};

export const DownloadSvg: React.FC<Props> = ({ className }) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={20}
      height={20}
      fill='none'
      viewBox='0 0 24 24'
      className={className}
    >
      <path
        fill='currentColor'
        d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4h3V8h2v5h3l-4 4z'
      />
    </svg>
  );
};
