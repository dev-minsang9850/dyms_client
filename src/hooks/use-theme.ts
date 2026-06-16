/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

export function useTheme() {
  try {
    const { themeMode } = useApp();
    return Colors[themeMode];
  } catch (e) {
    return Colors.light;
  }
}
