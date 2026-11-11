import { cn } from '../../lib/utils';
import { forwardRef } from 'react';

export const Table = forwardRef(({ className, children, ...props }, ref) => (
  <div className={cn('table-container', className)} {...props}>
    <table className="table" ref={ref} role="table">
      {children}
    </table>
  </div>
));

Table.displayName = 'Table';

export const TableHeader = forwardRef(({ className, children, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props}>
    {children}
  </thead>
));

TableHeader.displayName = 'TableHeader';

export const TableBody = forwardRef(({ className, children, ...props }, ref) => (
  <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props}>
    {children}
  </tbody>
));

TableBody.displayName = 'TableBody';

export const TableFooter = forwardRef(({ className, children, ...props }, ref) => (
  <tfoot ref={ref} className={cn('border-t bg-pxg-bg-tertiary/30', className)} {...props}>
    {children}
  </tfoot>
));

TableFooter.displayName = 'TableFooter';

export const TableRow = forwardRef(({ className, clickable, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'transition-colors',
      clickable && 'cursor-pointer hover:bg-pxg-bg-hover/50',
      className
    )}
    {...props}
  />
));

TableRow.displayName = 'TableRow';

export const TableHead = forwardRef(({ className, children, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'px-4 py-3 text-caption font-semibold text-pxg-text-muted uppercase tracking-wider bg-pxg-bg-tertiary/50 border-b border-pxg-border-subtle/30',
      className
    )}
    {...props}
  >
    {children}
  </th>
));

TableHead.displayName = 'TableHead';

export const TableCell = forwardRef(({ className, children, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('px-4 py-3 text-body-sm border-b border-pxg-border-subtle/20', className)}
    {...props}
  >
    {children}
  </td>
));

TableCell.displayName = 'TableCell';

export const TableCaption = forwardRef(({ className, children, ...props }, ref) => (
  <caption ref={ref} className={cn('px-4 py-3 text-body-sm text-pxg-text-secondary', className)} {...props}>
    {children}
  </caption>
));

TableCaption.displayName = 'TableCaption';