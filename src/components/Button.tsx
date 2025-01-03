import React, {CSSProperties} from 'react';
import {Link, useNavigate} from 'react-router-dom';

type Props = {
  to?: string;
  text?: string;
  containerStyle?: CSSProperties;
  colorScheme?: 'primary' | 'secondary';
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement, MouseEvent>,
  ) => void;
};

export const Button: React.FC<Props> = ({
  to,
  onClick,
  containerStyle,
  text = 'Button',
  colorScheme = 'primary',
}) => {
  const navigate = useNavigate();

  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => {
    if (to === 'back') {
      event.preventDefault();
      navigate(-1);
    } else if (onClick) {
      onClick(event);
    }
  };

  const style: CSSProperties = {
    height: 50,
    backgroundColor:
      colorScheme === 'primary' ? 'var(--main-turquoise)' : 'transparent',
    color:
      colorScheme === 'primary'
        ? 'var(--white-color)'
        : 'var(--main-turquoise)',
    fontFamily: 'DM Sans',
    fontWeight: 700,
    fontSize: 14,
    lineHeight: 1.7,
    cursor: 'pointer',
    margin: '0 auto',
    textAlign: 'center',
    border: '1px solid var(--main-turquoise)',
    textTransform: 'capitalize',
    width: '100%',
    userSelect: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    ...containerStyle,
  };

  if (to) {
    return (
      <Link
        to={to}
        style={{...style}}
        onClick={handleClick}
      >
        {text}
      </Link>
    );
  }

  if (!to) {
    return (
      <button
        style={{...style}}
        onClick={onClick}
      >
        {text}
      </button>
    );
  }

  return null;
};
