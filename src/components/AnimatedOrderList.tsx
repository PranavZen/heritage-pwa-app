import React, { useEffect, useState, useRef } from 'react';
import { OrderItem } from '../items/OrderItem';
import { DishType } from '../types';

interface AnimatedOrderListProps {
  dishes: DishType[];
}

export const AnimatedOrderList: React.FC<AnimatedOrderListProps> = ({ dishes }) => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Start the staggered animation when the container comes into view
          let delay = 0;
          const interval = setInterval(() => {
            setVisibleItems(prev => {
              const nextIndex = prev.length;
              if (nextIndex >= dishes.length) {
                clearInterval(interval);
                return prev;
              }
              return [...prev, nextIndex];
            });
            delay += 150; // Stagger each item by 150ms
            if (delay >= dishes.length * 150) {
              clearInterval(interval);
            }
          }, 150);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    observer.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [dishes.length]);

  return (
    <div ref={containerRef} className="animated-order-list">
      {dishes.map((dish, index) => (
        <div 
          key={dish.cart_id || index} 
          className={`order-item-wrapper ${visibleItems.includes(index) ? 'visible' : ''}`}
          style={{ 
            transitionDelay: `${index * 0.15}s`,
            opacity: visibleItems.includes(index) ? 1 : 0,
            transform: visibleItems.includes(index) ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease'
          }}
        >
          <OrderItem dish={dish} isLast={index === dishes.length - 1} />
        </div>
      ))}
    </div>
  );
};
