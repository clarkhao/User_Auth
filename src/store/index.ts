import { create } from 'zustand'
import type {Theme} from '@mui/material/styles';
import { lightTheme, darkTheme } from '../component/utils';
import { boolean } from 'zod';
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
 * next.js中通过内置的router就可以控制locale，控制i18n，不需要在这里设置
 */

/**
 * login status
 */
interface ILoginStore {
  login: boolean;
  toggleLogin: (newLogin: boolean) => void;
}
export const useLoginStore = create<ILoginStore>(set => ({
  login: false,
  toggleLogin: (newLogin: boolean) => set({login: newLogin})
}))