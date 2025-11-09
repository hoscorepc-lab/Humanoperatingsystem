import { Palette, Check } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useTheme, Theme, THEME_OPTIONS } from '../lib/theme';

export function ThemeToggle() {
  const { theme, changeTheme, themeOptions } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative overflow-hidden group transition-all duration-300 hover:scale-105"
          title="Change color theme"
        >
          <Palette className="w-4 h-4 transition-all duration-300" />
          <span className="sr-only">Select theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs font-medium">
          Silver Themes
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(Object.keys(themeOptions) as Theme[]).map((themeKey) => {
          const option = themeOptions[themeKey];
          return (
            <DropdownMenuItem
              key={themeKey}
              onClick={() => changeTheme(themeKey)}
              className="cursor-pointer flex items-start gap-2 py-2"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-medium text-sm">{option.name}</div>
                  {theme === themeKey && (
                    <Check className="w-3 h-3 text-primary" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {option.description}
                </div>
              </div>
              <div
                className={`w-6 h-6 rounded-full border-2 border-border flex-shrink-0 mt-0.5 ${getThemePreviewClass(themeKey)}`}
              />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getThemePreviewClass(theme: Theme): string {
  const previews = {
    pearl: 'bg-white',
    silver: 'bg-[#f5f5f7]',
    chrome: 'bg-[#e5e5ea]',
    platinum: 'bg-[#d1d1d6]'
  };
  return previews[theme];
}
