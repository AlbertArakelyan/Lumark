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
      {isDark ? <MoonIcon size={16} /> : <SunIcon size={16} />}
    </ToolbarButton>
  );
};

export default ThemeToggle;
