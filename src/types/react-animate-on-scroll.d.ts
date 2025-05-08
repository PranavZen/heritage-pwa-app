declare module 'react-animate-on-scroll' {
  import React from 'react';
  
  interface ScrollAnimationProps {
    animateIn?: string;
    animateOut?: string;
    offset?: number;
    delay?: number;
    duration?: number;
    animateOnce?: boolean;
    initiallyVisible?: boolean;
    afterAnimatedIn?: (visible: boolean) => void;
    afterAnimatedOut?: (visible: boolean) => void;
    scrollableParentSelector?: string;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
  }
  
  const ScrollAnimation: React.FC<ScrollAnimationProps>;
  
  export default ScrollAnimation;
}
