import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown, ChevronUp, X } from '../../lib/icons';

export function Dropdown({
  trigger,
  items,
  align = 'right',
  className,
  triggerClassName,
  itemClassName,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

  return (
    <div className={cn('relative inline-block', className)} ref={dropdownRef}>
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={cn('flex items-center gap-1.5', triggerClassName)}
        tabIndex={0}
        role="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {trigger}
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2 min-w-[180px] glass-card shadow-glass-lg border-pxg-border-accent/50 animate-slide-down',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          role="menu"
        >
          {items.map((item, index) => (
            <button
              key={item.key || index}
              onClick={() => {
                item.onClick?.();
                if (!item.keepOpen) setIsOpen(false);
              }}
              className={cn(
                'w-full px-3 py-2 text-left text-body-sm text-pxg-text-secondary hover:text-pxg-text-primary hover:bg-pxg-bg-hover transition-colors flex items-center gap-2',
                item.disabled && 'opacity-50 cursor-not-allowed',
                item.danger && 'text-pxg-accent-neonRed hover:text-pxg-accent-neonRed/80',
                itemClassName
              )}
              role="menuitem"
              disabled={item.disabled}
              tabIndex={-1}
            >
              {item.icon && <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>}
              <span className="flex-1">{item.label}</span>
              {item.shortcut && <kbd className="text-caption text-pxg-text-muted px-1.5 py-0.5 rounded bg-pxg-bg-primary">{item.shortcut}</kbd>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ label, onClick, icon, danger, disabled, shortcut, keepOpen }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-3 py-2 text-left text-body-sm text-pxg-text-secondary hover:text-pxg-text-primary hover:bg-pxg-bg-hover transition-colors flex items-center gap-2',
        disabled && 'opacity-50 cursor-not-allowed',
        danger && 'text-pxg-accent-neonRed hover:text-pxg-accent-neonRed/80'
      )}
      disabled={disabled}
    >
      {icon && <span className="w-5 h-5 flex-shrink-0">{icon}</span>}
      <span className="flex-1">{label}</span>
      {shortcut && <kbd className="text-caption text-pxg-text-muted px-1.5 py-0.5 rounded bg-pxg-bg-primary">{shortcut}</kbd>}
    </button>
  );
}