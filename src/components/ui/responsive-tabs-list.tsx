import { TabsList } from './tabs';
import { cn } from './utils';

interface ResponsiveTabsListProps {
  children: React.ReactNode;
  className?: string;
  gridCols?: 2 | 3 | 4 | 5 | 6;
}

/**
 * Responsive TabsList that scrolls horizontally on mobile
 * and uses grid layout on larger screens
 */
export function ResponsiveTabsList({ 
  children, 
  className,
  gridCols = 3
}: ResponsiveTabsListProps) {
  const gridClass = `md:grid-cols-${gridCols}`;
  
  return (
    <div className="w-full overflow-x-auto pb-1">
      <TabsList 
        className={cn(
          "inline-flex w-auto min-w-full md:grid md:w-full",
          gridClass,
          className
        )}
      >
        {children}
      </TabsList>
    </div>
  );
}
