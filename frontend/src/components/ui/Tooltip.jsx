import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

export function Tooltip({ content, children, position = 'top', delay = 200, className }) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);
  const childRef = useRef(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const child = Array.isArray(children) ? children[0] : children;
  const childProps = {
    ref: childRef,
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip,
    onFocus: showTooltip,
    onBlur: hideTooltip,
  };

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrows = {
    top: 'border-t-pxg-bg-primary',
    bottom: 'border-b-pxg-bg-primary',
    left: 'border-l-pxg-bg-primary',
    right: 'border-r-pxg-bg-primary',
  };

  return (
    <div className="relative inline-block" {...childProps}>
      {child}
      {isVisible && (
        <div
          className={cn(
            'tooltip animate-fade-in z-50',
            positions[position],
            className
          )}
          role="tooltip"
        >
          <div className="flex items-center gap-1.5">
            {content}
          </div>
          <div
            className={cn(
              'absolute w-0 h-0 border-4 border-transparent',
              arrows[position],
              {
                top: 'top-full left-1/2 -translate-x-1/2',
                bottom: 'bottom-full left-1/2 -translate-x-1/2',
                left: 'left-full top-1/2 -translate-y-1/2',
                right: 'right-full top-1/2 -translate-y-1/2',
              }[position]
            )}
          />
        </div>
      )}
    </div>
  );
}

export function TooltipTrigger({ children, ...props }) {
  return <span {...props}>{children}</span>;
}

export function TooltipContent({ children, ...props }) {
  return <div {...props}>{children}</div>;
}