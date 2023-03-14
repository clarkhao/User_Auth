import { create } from 'zustand'
import type {Theme} from '@mui/material/styles';
import { lightTheme, darkTheme } from '../component/utils';
/**
 * theme controle
 */
interface IThemeStore {
  theme: Theme;
  toggleTheme: (newTheme: Theme) => void;
}

export const useThemeStore = create<IThemeStore>(set => ({
  theme: lightTheme,
  toggleTheme: (newTheme: Theme) => set({theme: newTheme})
}))
/**
 * i18n control
 */
