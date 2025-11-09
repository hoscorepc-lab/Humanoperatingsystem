import { Moon, Sun, Palette } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme, Theme } from '../lib/theme';

export function BrilliantBlackToggle() {
  const { theme, changeTheme } = useTheme();
  
  const themeOrder: Theme[] = ['pearl', 'silver', 'chrome', 'blue', 'black'];
  
  const toggleTheme = () => {
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    changeTheme(themeOrder[nextIndex]);
  };
  
  const isBlack = theme === 'black';
  const isBlue = theme === 'blue';
  
  const getIcon = () => {
    if (isBlack) return <Moon className="h-4 w-4" />;
    if (isBlue) return <Palette className="h-4 w-4 text-[#0052FF]" />;
    return <Sun className="h-4 w-4" />;
  };
  
  const getTitle = () => {
    const themeNames = {
      pearl: 'Pearl White',
      silver: 'Silver Mist',
      chrome: 'Steel Gray',
      blue: 'Electric Blue',
      black: 'Brilliant Black'
    };
    return `Current: ${themeNames[theme]} - Click to cycle themes`;
  };
  
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative"
      title={getTitle()}
    >
      {getIcon()}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
