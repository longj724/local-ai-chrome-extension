// External Dependencies
import { Settings } from 'lucide-react';

// Relative Dependencies
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ModeToggle } from './ModeToggle';

const SettingsMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Settings size={20} className="hover:cursor-pointer" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" >
        <DropdownMenuItem
          className="flex flex-row gap-2 hover:cursor-pointer"
          onSelect={(e) => e.preventDefault()}
        >
          <ModeToggle />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SettingsMenu;
