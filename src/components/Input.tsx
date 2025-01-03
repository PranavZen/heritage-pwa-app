import {FC} from 'react';
import React from 'react';

type Props = {
  type?: 'text' | 'password';
  clickable?: boolean;
  containerStyle?: React.CSSProperties;
  label?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  placeholder?: string;
  icon?: JSX.Element;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
};

export const Input: FC<Props> = ({
  placeholder,
  containerStyle,
  autoCapitalize = 'none',
  clickable,
  leftIcon,
  rightIcon,
  type = 'text',
}) => {
  return (
    <div
      style={{
        height: 50,
        padding: 5,
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        display: 'flex',
        backgroundColor: '#E9F3F6',
        borderRadius: 10,
        ...containerStyle,
      }}
    >
      {leftIcon && <div style={{marginRight: 14}}>{leftIcon}</div>}
      <input
        className='input-field'
        autoCapitalize={autoCapitalize}
        placeholder={placeholder}
        maxLength={50}
        type={type}
        style={{
          width: '100%',
          height: '100%',
          padding: 0,
          margin: 0,
          border: 'none',
          outline: 'none',
          backgroundColor: 'transparent',
          fontSize: 16,
          color: 'var(--main-color)',
          fontFamily: 'DM Sans',
        }}
      />
      {rightIcon && (
        <div style={{marginRight: 20 - 5, marginLeft: 10}}>{rightIcon}</div>
      )}
      {/* {icon && !clickable && <div>{icon}</div>} */}
      {/* {icon && clickable && <button>{icon}</button>} */}
    </div>
  );
};
