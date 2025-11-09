import { Menu, X, LucideIcon } from 'lucide-react';
import { Button } from './ui/button';

interface ModuleHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  onBackToDashboard: () => void;
  onClose?: () => void;
  showClose?: boolean;
  children?: React.ReactNode;
}

export function ModuleHeader({
  title,
  description,
  icon: Icon,
  iconColor = 'bg-primary',
  onBackToDashboard,
  onClose,
  showClose = true,
  children
}: ModuleHeaderProps) {
  return (
    <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-3 p-3 sm:p-4">
        {/* Hamburger - go back to dashboard */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onBackToDashboard}
          className="flex-shrink-0 h-14 w-14 active:scale-95 transition-transform"
          title="Back to Dashboard"
        >
          <Menu className="w-10 h-10" />
        </Button>

        {/* Icon */}
        {Icon && (
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${iconColor} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        )}

        {/* Title */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-semibold truncate">{title}</h2>
          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{description}</p>
          )}
        </div>

        {/* Optional children (extra buttons, etc) */}
        {children}

        {/* Close button */}
        {showClose && onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="flex-shrink-0 h-14 w-14 active:scale-95 transition-transform"
            title="Close module"
          >
            <X className="w-10 h-10" />
          </Button>
        )}
      </div>
    </div>
  );
}
