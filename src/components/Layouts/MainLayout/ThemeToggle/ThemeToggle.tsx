import { MoonIcon, SunIcon } from 'lucide-react';
import { useAppContext } from '../../../../contexts/AppProvider.tsx';
import { ThemeEnum } from '../../../../types/theme/themeEnums.ts';
import ToolbarButton from '../../../UI/ToolbarButton/ToolbarButton.tsx';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useAppContext();

  const isDark = theme === ThemeEnum.DARK;
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <ToolbarButton
      onClick={toggleTheme}
      title={label}
      aria-label={label}
    >
      {isDark ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
    </ToolbarButton>
  );
};

export default ThemeToggle;
