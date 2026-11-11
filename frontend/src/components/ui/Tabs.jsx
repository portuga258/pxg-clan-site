import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

export function Tabs({ defaultValue, value, onValueChange, children, className, orientation = 'horizontal' }) {
  const [activeValue, setActiveValue] = useState(defaultValue);
  const controlled = value !== undefined;
  const currentValue = controlled ? value : activeValue;

  const handleChange = (newValue) => {
    if (!controlled) setActiveValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <div
      className={cn('flex flex-col', orientation === 'vertical' && 'flex-row', className)}
      data-orientation={orientation}
    >
      {children({ value: currentValue, onChange: handleChange })}
    </div>
  );
}

export function TabsList({ children, className, orientation = 'horizontal', ...props }) {
  return (
    <div
      role="tablist"
      aria-orientation={orientation}
      className={cn(
        'flex gap-1 bg-pxg-bg-tertiary/30 rounded-lg p-1',
        orientation === 'vertical' && 'flex-col w-fit',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, disabled, className, ...props }) {
  const isActive = props['data-active'] === 'true';

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-disabled={disabled}
      data-state={isActive ? 'active' : 'inactive'}
      data-disabled={disabled}
      className={cn(
        'tab relative data-[state=active]:tab-active data-[state=active]:text-pxg-accent-neonGreen data-[state=active]:font-semibold',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={() => !disabled && props.onChange?.(value)}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className, ...props }) {
  const isActive = props['data-value'] === value;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      className={cn('animate-fade-in', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Composed component for easier usage
export function TabsRoot({ defaultValue, value, onValueChange, children, className, ...props }) {
  const [activeValue, setActiveValue] = useState(defaultValue);
  const controlled = value !== undefined;
  const currentValue = controlled ? value : activeValue;

  const tabsListRef = useRef(null);
  const triggersRef = useRef([]);

  const handleChange = (newValue) => {
    if (!controlled) setActiveValue(newValue);
    onValueChange?.(newValue);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const triggers = triggersRef.current.filter(t => !t.disabled);
      const activeIndex = triggers.findIndex(t => t.value === currentValue);

      let nextIndex = activeIndex;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextIndex = (activeIndex + 1) % triggers.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        nextIndex = (activeIndex - 1 + triggers.length) % triggers.length;
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = triggers.length - 1;
      }

      if (nextIndex !== activeIndex) {
        e.preventDefault();
        triggers[nextIndex].ref?.focus();
        handleChange(triggers[nextIndex].value);
      }
    };

    const list = tabsListRef.current;
    list?.addEventListener('keydown', handleKeyDown);
    return () => list?.removeEventListener('keydown', handleKeyDown);
  }, [currentValue, controlled, handleChange]);

  const registerTrigger = (triggerRef, value, disabled) => {
    const index = triggersRef.current.findIndex(t => t.value === value);
    if (index >= 0) {
      triggersRef.current[index] = { ref: triggerRef, value, disabled };
    } else {
      triggersRef.current.push({ ref: triggerRef, value, disabled });
    }
  };

  return (
    <div className={cn('flex flex-col', className)} {...props}>
      <TabsList ref={tabsListRef} className="flex gap-1 bg-pxg-bg-tertiary/30 rounded-lg p-1" role="tablist" aria-orientation="horizontal">
        {typeof children === 'function'
          ? children({ value: currentValue, onChange: handleChange, registerTrigger })
          : children
        }
      </TabsList>
      <div className="mt-4">
        {typeof children === 'function'
          ? children({ value: currentValue, onChange: handleChange, registerTrigger })
          : children
        }
      </div>
    </div>
  );
}