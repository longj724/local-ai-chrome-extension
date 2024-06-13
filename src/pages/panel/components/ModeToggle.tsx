// External Dependencies
import { Moon, Sun } from 'lucide-react';

// Relative Dependencies
import { Button } from './ui/button';
import { useTheme } from '../ThemeProvider';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    } 
  }

  return (
    <div className="flex flex-row w-full items-center gap-2" onClick={toggleTheme}>
      <p>Toggle theme</p>
      <Button variant="outline" size="icon">
        {theme === 'light' ? (
          <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        ) : (
          <Sun className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        )}
      </Button>
    </div>
  );
}
